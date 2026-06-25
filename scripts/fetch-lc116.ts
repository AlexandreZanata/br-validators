import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import {
  fetchLc116Records,
  NFSE_LC116_LIST_URL,
  PLANALTO_LC116_URL,
} from './lib/fetch-lc116-sources.js';
import type { Lc116Record } from './lib/parse-lc116-html.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/lc116/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const MIN_LC116 = 150;
const MAX_LC116 = 250;

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
  const endpoints = [PLANALTO_LC116_URL, NFSE_LC116_LIST_URL];

  try {
    const fetched = await fetchLc116Records(FETCH_MAX_ATTEMPTS);
    const items = fetched.records;

    if (items.length < MIN_LC116 || items.length > MAX_LC116) {
      throw new SourceDataError(
        `Expected ${String(MIN_LC116)}–${String(MAX_LC116)} LC 116 items, got ${String(items.length)} (source=${fetched.source})`,
      );
    }

    const codigoSet = new Set(items.map((record) => record.codigo));
    if (codigoSet.size !== items.length) {
      throw new SourceDataError('Duplicate LC 116 codes detected after merge');
    }

    await mkdir(DATA_DIR, { recursive: true });
    const itemsPath = path.join(DATA_DIR, 'lc116.json');
    const previousItems = await readJsonIfExists<Lc116Record[]>(itemsPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousItems ?? [],
      items,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'lc116',
        nome: 'LC 116/2003 — Lista de Serviços ISS',
        fonte: 'Lei Complementar 116/2003 — Anexo (Lista de Serviços)',
        endpoints: fetched.endpoints,
        contagens: { lc116: items.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#lc116-iss-servicos',
        agendamento: 'manual',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(itemsPath, `${JSON.stringify(items, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'lc116',
      status: 'ok',
      endpoints: fetched.endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: `LC 116 list fetched from ${fetched.source} (${String(items.length)} items).`,
    });

    console.log(`LC 116 data written (${todayIsoDate()}): ${String(items.length)} items via ${fetched.source}`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'lc116',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[lc116] ${outcome.message}`);
  }
}

main().catch(exitWithError);
