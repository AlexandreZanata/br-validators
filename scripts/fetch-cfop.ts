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
import { parseCfopHtml, type CfopRecord } from './lib/parse-cfop-html.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CFOP_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/cfop/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const CFOP_HTML_URL =
  'https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente';
const MIN_CFOP = 600;
const MAX_CFOP = 750;

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const metadataPath = path.join(CFOP_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [CFOP_HTML_URL];

  try {
    const html = await fetchTextWithRetry(
      CFOP_HTML_URL,
      FETCH_MAX_ATTEMPTS,
      FETCH_RETRY_DELAY_MS,
      CONFAZ_HTML_TIMEOUT_MS,
    );
    const cfops = parseCfopHtml(html);

    if (cfops.length < MIN_CFOP || cfops.length > MAX_CFOP) {
      throw new SourceDataError(
        `Expected ${String(MIN_CFOP)}–${String(MAX_CFOP)} CFOP codes, got ${String(cfops.length)}`,
      );
    }

    await mkdir(CFOP_DATA_DIR, { recursive: true });
    const cfopPath = path.join(CFOP_DATA_DIR, 'cfop.json');
    const previousCfops = await readJsonIfExists<CfopRecord[]>(cfopPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousCfops ?? [],
      cfops,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'cfop',
        nome: 'CONFAZ CFOP',
        fonte: 'CONFAZ SINIEF Convênio s/nº 1970 — Anexo II',
        endpoints,
        contagens: { cfop: cfops.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#cfop-fiscal-operations',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(cfopPath, `${JSON.stringify(cfops, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'cfop',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official CONFAZ CFOP table fetch succeeded.',
    });

    console.log(`CFOP data written (${todayIsoDate()}): ${String(cfops.length)} codes`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'cfop',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[cfop] ${outcome.message}`);
  }
}

main().catch(exitWithError);
