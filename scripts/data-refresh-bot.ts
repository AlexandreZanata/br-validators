import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { spawn } from 'node:child_process';

import { writeCriticalAlertsFiles } from './lib/critical-alerts-writer.js';
import { resolveDatasetDrift, sumReportTotals } from './lib/drift-detection.js';
import { exitWithError } from './lib/errors.js';
import {
  buildFieldChangesReport,
  snapshotDatasetJson,
  type FieldChangesReport,
} from './lib/field-change-report.js';
import { sealAllStaleBaselines } from './lib/seal-baseline-metadata.js';
import { parseDatasetMetadata } from './lib/parse-metadata.js';
import {
  generateDataFreshnessDoc,
  generateJobSummary,
  generatePrBody,
  type RefreshReport,
  type RefreshReportDataset,
} from './lib/report-markdown.js';
import {
  readSourceFetchOutcomes,
  type SourceAlert,
} from './lib/source-fetch-outcome.js';
import { probeMetadataEndpoints } from './lib/source-probe.js';
import {
  collectHealthAlerts,
  syncSourceHealthFromOutcomes,
  type SourceHealthState,
} from './lib/source-health-tracker.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import type { DatasetMetadata } from '../packages/br-validators/src/data-catalog/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DATASET_METADATA_PATHS = [
  path.join(ROOT, 'packages/br-validators/src/ibge/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/bancos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/aeroportos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/tse-municipios/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/moedas/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/ptax/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/paises-bacen/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/incoterms/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/core/telefone/data/ddd-metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/feriados/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cnaes/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cfop/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/natureza-juridica/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cnpj-motivos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/ibpt/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/nbs/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cest/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cst/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/lc116/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/esocial/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/simples-nacional/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/ncm/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/cbo/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/core/cep/data/faixa-metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/portos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/anp-combustiveis/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/pncp-reference/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/transparencia-snapshots/data/metadata.json'),
] as const;

const FETCH_DATASET_IDS = [
  'ibge',
  'bancos',
  'aeroportos',
  'tse-municipios',
  'moedas',
  'ptax',
  'paises-bacen',
  'incoterms',
  'telefone-ddd',
  'cnaes',
  'cfop',
  'natureza-juridica',
  'cnpj-motivos',
  'ibpt',
  'nbs',
  'cest',
  'ncm',
  'cbo',
  'portos',
  'pncp-reference',
  'transparencia-snapshots',
] as const;

const FIELD_CHANGE_DATASET_IDS = [
  ...FETCH_DATASET_IDS,
  'feriados',
  'cep-faixas',
] as const;

const PROBE_ONLY_METADATA_PATHS = [
  path.join(ROOT, 'packages/br-validators/src/feriados/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/core/cep/data/faixa-metadata.json'),
] as const;

const FETCH_SCRIPTS = [
  'scripts/fetch-ibge.ts',
  'scripts/fetch-bancos.ts',
  'scripts/fetch-aeroportos.ts',
  'scripts/fetch-tse-municipios.ts',
  'scripts/fetch-moedas.ts',
  'scripts/fetch-ptax.ts',
  'scripts/fetch-paises-bacen.ts',
  'scripts/fetch-incoterms.ts',
  'scripts/fetch-ddd.ts',
  'scripts/fetch-cnaes.ts',
  'scripts/fetch-cfop.ts',
  'scripts/fetch-natureza-juridica.ts',
  'scripts/fetch-cnpj-motivos.ts',
  'scripts/fetch-ibpt.ts',
  'scripts/fetch-nbs.ts',
  'scripts/fetch-cest.ts',
  'scripts/fetch-ncm.ts',
  'scripts/fetch-cbo.ts',
  'scripts/fetch-portos.ts',
  'scripts/fetch-pncp-reference.ts',
  'scripts/fetch-transparencia-snapshots.ts',
] as const;

const REPORT_DIR = path.join(ROOT, 'data/refresh-reports');
const FETCH_OUTCOME_DIR = path.join(REPORT_DIR, 'fetch-outcomes');
const SOURCE_HEALTH_DIR = path.join(REPORT_DIR, 'source-health');
const DAILY_DIR = path.join(REPORT_DIR, 'daily');
const FIELD_CHANGES_DIR = path.join(REPORT_DIR, 'field-changes');
const FRESHNESS_DOC = path.join(ROOT, 'docs/DATA-FRESHNESS.md');
const JOB_SUMMARY_PATH = path.join(REPORT_DIR, 'job-summary.md');
const CRITICAL_ALERTS_MD = path.join(REPORT_DIR, 'CRITICAL-ALERTS.md');
const CRITICAL_ALERTS_LOG = path.join(REPORT_DIR, 'CRITICAL-ALERTS.log');
const DAILY_RETENTION_DAYS = 90;

interface CliOptions {
  fetchOnly: boolean;
  reportOnly: boolean;
  dryRun: boolean;
  noArchive: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  return {
    fetchOnly: argv.includes('--fetch-only'),
    reportOnly: argv.includes('--report-only'),
    dryRun: argv.includes('--dry-run'),
    noArchive: argv.includes('--no-archive'),
  };
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${String(code ?? 'unknown')}`));
      }
    });
  });
}

async function readAllMetadata(): Promise<DatasetMetadata[]> {
  const datasets: DatasetMetadata[] = [];
  for (const metadataPath of DATASET_METADATA_PATHS) {
    const raw = await readFile(metadataPath, 'utf8');
    datasets.push(parseDatasetMetadata(raw));
  }
  return datasets;
}

function mergeSourceAlerts(
  healthAlerts: SourceAlert[],
): SourceAlert[] {
  const merged = new Map<string, SourceAlert>();
  for (const alert of healthAlerts) {
    const existing = merged.get(alert.datasetId);
    if (existing === undefined || alert.severity === 'critical') {
      merged.set(alert.datasetId, alert);
    }
  }
  return [...merged.values()];
}

async function collectSourceAlerts(runDate: string): Promise<{
  alerts: SourceAlert[];
  healthStates: SourceHealthState[];
}> {
  await probeMetadataEndpoints(PROBE_ONLY_METADATA_PATHS, FETCH_OUTCOME_DIR);

  const allDatasetIds = [...FETCH_DATASET_IDS, 'feriados', 'cep-faixas'] as const;
  const outcomes = await readSourceFetchOutcomes(FETCH_OUTCOME_DIR, allDatasetIds);
  const healthStates = await syncSourceHealthFromOutcomes(SOURCE_HEALTH_DIR, outcomes, runDate);
  const alerts = mergeSourceAlerts(collectHealthAlerts(healthStates));

  return { alerts, healthStates };
}

async function pruneDailyArchives(): Promise<void> {
  let entries: string[] = [];
  try {
    entries = await readdir(DAILY_DIR);
  } catch {
    return;
  }

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - DAILY_RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  for (const entry of entries) {
    if (!entry.endsWith('.json')) {
      continue;
    }
    const date = entry.replace(/\.json$/, '');
    if (date < cutoffIso) {
      await unlink(path.join(DAILY_DIR, entry));
    }
  }
}

function buildFieldChangesFromReport(
  runDate: string,
  datasetEntries: readonly RefreshReportDataset[],
): FieldChangesReport {
  const hasDrift = datasetEntries.some((entry) => entry.status === 'changed');
  return {
    date: runDate,
    summary: hasDrift ? 'drift' : 'no_drift',
    datasets: datasetEntries.map((entry) => {
      if (entry.status === 'unchanged') {
        return { id: entry.id, status: 'unchanged' as const };
      }
      return {
        id: entry.id,
        status: 'changed' as const,
        adicionados: entry.alteracoes.adicionados,
        removidos: entry.alteracoes.removidos,
        alterados: entry.alteracoes.alterados,
        ...(entry.camposAlterados === undefined ? {} : { camposAlterados: entry.camposAlterados }),
      };
    }),
  };
}

async function writeReports(
  dryRun: boolean,
  noArchive: boolean,
  snapshots: ReadonlyMap<string, ReadonlyMap<string, string>> | null,
  baselinesSelados: number,
): Promise<RefreshReport> {
  const runDate = todayIsoDate();
  const datasets = await readAllMetadata();
  const { alerts: sourceAlerts, healthStates } = await collectSourceAlerts(runDate);

  const comparadoCom = datasets[0]?.alteracoes.comparadoCom ?? null;
  const snapshotFieldChanges =
    snapshots === null
      ? null
      : await buildFieldChangesReport(
          ROOT,
          FIELD_CHANGE_DATASET_IDS,
          snapshots,
          runDate,
          comparadoCom,
        );

  const fieldChangeById = new Map(
    snapshotFieldChanges?.datasets.map((entry) => [entry.id, entry]) ?? [],
  );

  const datasetEntries: RefreshReportDataset[] = datasets.map((metadata) => {
    const fieldEntry = fieldChangeById.get(metadata.id);
    const drift = resolveDatasetDrift({
      metadataChanges: metadata.alteracoes,
      capturadoEm: metadata.capturadoEm,
      ...(fieldEntry === undefined
        ? {}
        : {
            fieldStatus: fieldEntry.status,
            fieldAdicionados: fieldEntry.adicionados,
            fieldRemovidos: fieldEntry.removidos,
            fieldAlterados: fieldEntry.alterados,
          }),
    });

    return {
      id: metadata.id,
      status: drift.status,
      alteracoes: drift.alteracoes,
      contagens: metadata.contagens,
      ...(fieldEntry?.camposAlterados === undefined
        ? {}
        : { camposAlterados: fieldEntry.camposAlterados }),
    };
  });

  const totals = sumReportTotals(datasetEntries);
  const fieldChanges =
    snapshotFieldChanges ?? buildFieldChangesFromReport(runDate, datasetEntries);
  const criticalAlerts = sourceAlerts.filter((alert) => alert.severity === 'critical').length;

  const report: RefreshReport = {
    executadoEm: new Date().toISOString(),
    runDate,
    schedule: 'diario',
    agendamento: 'diario',
    datasets: datasetEntries,
    sourceAlerts,
    resumo: {
      datasetsVerificados: datasets.length,
      datasetsAlterados: totals.datasetsAlterados,
      totalAdicionados: totals.totalAdicionados,
      totalRemovidos: totals.totalRemovidos,
      totalAlterados: totals.totalAlterados,
      sourceAlerts: sourceAlerts.length,
      criticalAlerts,
      baselinesSelados,
    },
  };

  if (dryRun) {
    console.log('Dry run — report:', JSON.stringify(report, null, 2));
    console.log('Field changes:', JSON.stringify(fieldChanges, null, 2));
    return report;
  }

  await mkdir(REPORT_DIR, { recursive: true });

  await writeFile(path.join(REPORT_DIR, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(REPORT_DIR, 'pr-body.md'), generatePrBody(report, datasets));
  await writeFile(FRESHNESS_DOC, generateDataFreshnessDoc(report, datasets));
  await writeFile(
    JOB_SUMMARY_PATH,
    generateJobSummary(report, fieldChanges),
  );

  await writeCriticalAlertsFiles(
    { markdownPath: CRITICAL_ALERTS_MD, logPath: CRITICAL_ALERTS_LOG },
    healthStates,
    report.executadoEm,
  );

  if (!noArchive) {
    await mkdir(DAILY_DIR, { recursive: true });
    await writeFile(path.join(DAILY_DIR, `${runDate}.json`), `${JSON.stringify(report, null, 2)}\n`);

    await mkdir(FIELD_CHANGES_DIR, { recursive: true });
    await writeFile(
      path.join(FIELD_CHANGES_DIR, `${runDate}.json`),
      `${JSON.stringify(fieldChanges, null, 2)}\n`,
    );

    await pruneDailyArchives();
  }

  return report;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  let snapshots: Map<string, Map<string, string>> | null = null;

  const baselinesSelados = await sealAllStaleBaselines(DATASET_METADATA_PATHS);
  if (baselinesSelados > 0) {
    console.log(`Sealed ${String(baselinesSelados)} stale baseline metadata file(s).`);
  }

  if (!options.reportOnly) {
    snapshots = await snapshotDatasetJson(ROOT, FIELD_CHANGE_DATASET_IDS);
    await mkdir(FETCH_OUTCOME_DIR, { recursive: true });
    for (const script of FETCH_SCRIPTS) {
      await runCommand('pnpm', ['exec', 'tsx', script]);
    }
  }

  const report = await writeReports(options.dryRun, options.noArchive, snapshots, baselinesSelados);

  if (report.sourceAlerts.length > 0) {
    console.warn(`Source alerts: ${String(report.sourceAlerts.length)} — embedded data retained.`);
    for (const alert of report.sourceAlerts) {
      console.warn(`[${alert.datasetId}] (${alert.severity}) ${alert.message}`);
    }
  }

  if (report.resumo.datasetsAlterados === 0 && report.sourceAlerts.length === 0) {
    console.log('No dataset drift detected. All HTTP sources responded successfully.');
  } else if (report.resumo.datasetsAlterados === 0 && report.sourceAlerts.length > 0) {
    console.log('No dataset drift detected. See source alerts above for embedded-data retention warnings.');
  } else if (report.resumo.datasetsAlterados > 0) {
    console.log(
      `Dataset drift detected: +${String(report.resumo.totalAdicionados)} −${String(report.resumo.totalRemovidos)} ~${String(report.resumo.totalAlterados)}`,
    );
  }
}

main().catch(exitWithError);
