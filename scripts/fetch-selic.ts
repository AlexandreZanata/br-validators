import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { fetchJsonWithRetry, todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import {
  BCB_SELIC_COPOM_URL,
  BCB_SELIC_DATASET_URL,
  BCB_SELIC_SGS_API_URL,
  BCB_SELIC_SGS_CONSULTA_URL,
  SELIC_MAX_RECORDS,
  SELIC_MIN_RECORDS,
  SELIC_ROLLING_CALENDAR_DAYS,
  buildSelicRequestUrl,
  mergeSelicRecords,
  parseSelicRows,
  resolveSelicPeriodBounds,
  type SgsSelicApiRow,
  type SelicMetaRecord,
} from './lib/selic-sgs-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SELIC_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/selic/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function validateSelicRecords(records: readonly SelicMetaRecord[]): void {
  if (records.length < SELIC_MIN_RECORDS || records.length > SELIC_MAX_RECORDS) {
    throw new SourceDataError(
      `Expected ${String(SELIC_MIN_RECORDS)}–${String(SELIC_MAX_RECORDS)} SELIC rows, got ${String(records.length)}`,
    );
  }

  const latest = records[records.length - 1];
  if (latest.valor < 0 || latest.valor > 100) {
    throw new SourceDataError(`SELIC latest value out of range: ${String(latest.valor)}`);
  }
}

async function main(): Promise<void> {
  const selicPath = path.join(SELIC_DATA_DIR, 'selic.json');
  const metadataPath = path.join(SELIC_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [
    BCB_SELIC_DATASET_URL,
    BCB_SELIC_SGS_API_URL,
    BCB_SELIC_SGS_CONSULTA_URL,
    BCB_SELIC_COPOM_URL,
  ];

  try {
    const periodBounds = resolveSelicPeriodBounds(new Date(), SELIC_ROLLING_CALENDAR_DAYS);
    if (periodBounds === null) {
      throw new SourceDataError('Unable to resolve SELIC calendar-day window');
    }

    const url = buildSelicRequestUrl(periodBounds.dataInicial, periodBounds.dataFinal);
    if (url.length === 0) {
      throw new SourceDataError('Unable to build SELIC SGS request URL');
    }

    const rows = await fetchJsonWithRetry<readonly SgsSelicApiRow[]>(url, FETCH_MAX_ATTEMPTS);
    const selic = mergeSelicRecords(parseSelicRows(rows));
    validateSelicRecords(selic);

    await mkdir(SELIC_DATA_DIR, { recursive: true });

    const previousSelic = await readJsonIfExists<SelicMetaRecord[]>(selicPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousSelic ?? [],
      selic,
      (record) => record.data,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'selic',
        nome: 'Bacen SGS — Meta Selic (série 432)',
        fonte: 'Banco Central — Taxa meta Selic definida pelo Copom',
        endpoints,
        contagens: {
          observacoes: selic.length,
          dias: new Set(selic.map((record) => record.data)).size,
        },
        documentacao: 'docs/OFFICIAL-SOURCES.md#selic-meta-sgs-432',
        agendamento: 'diario',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(selicPath, `${JSON.stringify(selic, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    const latest = selic[selic.length - 1];
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'selic',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: `Bacen SELIC meta embedded (${periodBounds.dataInicial}..${periodBounds.dataFinal}) — latest ${latest.data} = ${String(latest.valor)}% a.a.`,
    });

    console.log(
      `SELIC data written (${todayIsoDate()}): ${String(selic.length)} observations`,
    );
    console.log(
      `Window: ${periodBounds.dataInicial} .. ${periodBounds.dataFinal} (${String(SELIC_ROLLING_CALENDAR_DAYS)} calendar days)`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'selic',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[selic] ${outcome.message}`);
  }
}

main().catch(exitWithError);
