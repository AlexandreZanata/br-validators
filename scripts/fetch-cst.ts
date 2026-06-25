import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import {
  fetchSpedCstTables,
  SPED_CST_CONSULTA_URL,
  SPED_CST_TABLE_IDS,
} from './lib/fetch-sped-cst-tables.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import type { CstRecord } from './lib/parse-sped-cst-html.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/cst/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const MIN_ICMS = 10;
const MAX_ICMS = 20;
const MIN_IPI = 12;
const MAX_IPI = 20;
const MIN_PIS = 30;
const MAX_PIS = 40;
const MIN_COFINS = 30;
const MAX_COFINS = 40;

const PIS_CST_DOC_URL = 'http://sped.rfb.gov.br/arquivo/download/1629';
const COFINS_CST_DOC_URL = 'http://sped.rfb.gov.br/arquivo/download/1630';

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function assertCount(label: string, count: number, min: number, max: number): void {
  if (count < min || count > max) {
    throw new SourceDataError(`Expected ${String(min)}–${String(max)} ${label}, got ${String(count)}`);
  }
}

function assertUniqueCodes(records: readonly CstRecord[], label: string): void {
  const codes = new Set(records.map((record) => record.codigo));
  if (codes.size !== records.length) {
    throw new SourceDataError(`Duplicate ${label} CST codes detected`);
  }
}

async function main(): Promise<void> {
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [SPED_CST_CONSULTA_URL, PIS_CST_DOC_URL, COFINS_CST_DOC_URL];

  try {
    const tables = await fetchSpedCstTables();

    assertCount('ICMS CST', tables.icms.length, MIN_ICMS, MAX_ICMS);
    assertCount('IPI CST', tables.ipi.length, MIN_IPI, MAX_IPI);
    assertCount('PIS CST', tables.pis.length, MIN_PIS, MAX_PIS);
    assertCount('COFINS CST', tables.cofins.length, MIN_COFINS, MAX_COFINS);
    assertUniqueCodes(tables.icms, 'ICMS');
    assertUniqueCodes(tables.ipi, 'IPI');
    assertUniqueCodes(tables.pis, 'PIS');
    assertUniqueCodes(tables.cofins, 'COFINS');

    await mkdir(DATA_DIR, { recursive: true });

    const icmsPath = path.join(DATA_DIR, 'cst-icms.json');
    const ipiPath = path.join(DATA_DIR, 'cst-ipi.json');
    const pisPath = path.join(DATA_DIR, 'cst-pis.json');
    const cofinsPath = path.join(DATA_DIR, 'cst-cofins.json');

    const previousIcms = await readJsonIfExists<CstRecord[]>(icmsPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const icmsChanges = diffRecordsByKey(
      previousIcms ?? [],
      tables.icms,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'cst',
        nome: 'RFB SPED — CST (ICMS, IPI, PIS, COFINS)',
        fonte: 'SPED Fiscal — Tabelas de Situação Tributária (IN RFB 932/2009 family)',
        endpoints,
        contagens: {
          icms: tables.icms.length,
          ipi: tables.ipi.length,
          pis: tables.pis.length,
          cofins: tables.cofins.length,
        },
        documentacao: 'docs/OFFICIAL-SOURCES.md#cst-situacao-tributaria',
        agendamento: 'manual',
      },
      icmsChanges,
    );

    const jsonIndent = 2;
    await writeFile(icmsPath, `${JSON.stringify(tables.icms, null, jsonIndent)}\n`);
    await writeFile(ipiPath, `${JSON.stringify(tables.ipi, null, jsonIndent)}\n`);
    await writeFile(pisPath, `${JSON.stringify(tables.pis, null, jsonIndent)}\n`);
    await writeFile(cofinsPath, `${JSON.stringify(tables.cofins, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'cst',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: `SPED CST tables fetched (ICMS=${String(tables.icms.length)}, IPI=${String(tables.ipi.length)}, PIS=${String(tables.pis.length)}, COFINS=${String(tables.cofins.length)}; SPED table ids ${SPED_CST_TABLE_IDS.icms}/${SPED_CST_TABLE_IDS.ipi}/${SPED_CST_TABLE_IDS.pis}/${SPED_CST_TABLE_IDS.cofins}).`,
    });

    console.log(`CST data written (${todayIsoDate()}):`, metadata.contagens);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'cst',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[cst] ${outcome.message}`);
  }
}

main().catch(exitWithError);
