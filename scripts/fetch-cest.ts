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
import { FETCH_RETRY_DELAY_MS } from './lib/fetch-retry-config.js';
import { fetchTextWithRetry, todayIsoDate, CONFAZ_HTML_TIMEOUT_MS } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import { parseCestHtml, type CestRecord } from './lib/parse-cest-html.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/cest/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

export const CEST_HTML_URL =
  'https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18';

export const MIN_CEST = 950;
export const MAX_CEST = 1050;

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [CEST_HTML_URL];

  try {
    const html = await fetchTextWithRetry(
      CEST_HTML_URL,
      FETCH_MAX_ATTEMPTS,
      FETCH_RETRY_DELAY_MS,
      CONFAZ_HTML_TIMEOUT_MS,
    );
    const cests = parseCestHtml(html);

    if (cests.length < MIN_CEST || cests.length > MAX_CEST) {
      throw new SourceDataError(
        `Expected ${String(MIN_CEST)}–${String(MAX_CEST)} CEST codes, got ${String(cests.length)}`,
      );
    }

    const codigoSet = new Set(cests.map((record) => record.codigo));
    if (codigoSet.size !== cests.length) {
      throw new SourceDataError('Duplicate CEST codes detected');
    }

    await mkdir(DATA_DIR, { recursive: true });
    const cestPath = path.join(DATA_DIR, 'cest.json');
    const previousCests = await readJsonIfExists<CestRecord[]>(cestPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousCests ?? [],
      cests,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'cest',
        nome: 'CONFAZ CEST',
        fonte: 'CONFAZ Convênio ICMS 142/2018 — Anexos II a XXVI',
        endpoints,
        contagens: { cest: cests.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#cest',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(cestPath, `${JSON.stringify(cests, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'cest',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official CONFAZ CEST table fetch succeeded.',
    });

    console.log(`CEST data written (${todayIsoDate()}): ${String(cests.length)} codes`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'cest',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[cest] ${outcome.message}`);
  }
}

main().catch(exitWithError);
