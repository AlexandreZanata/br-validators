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
import { todayIsoDate } from './lib/fetch-utils.js';
import {
  CSOSN_SINIEF_0310,
  CSOSN_SINIEF_0310_COUNT,
  CSOSN_SINIEF_0310_URL,
} from './lib/csosn-sinief-0310.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CSOSN_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/csosn/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

interface CsosnRecord {
  codigo: string;
  descricao: string;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function buildCsosn(): CsosnRecord[] {
  return CSOSN_SINIEF_0310.map((entry) => ({
    codigo: entry.codigo,
    descricao: entry.descricao,
  }));
}

async function main(): Promise<void> {
  const csosnPath = path.join(CSOSN_DATA_DIR, 'csosn.json');
  const metadataPath = path.join(CSOSN_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [CSOSN_SINIEF_0310_URL];

  try {
    const csosn = buildCsosn();

    if (csosn.length !== CSOSN_SINIEF_0310_COUNT) {
      throw new SourceDataError(
        `Expected ${String(CSOSN_SINIEF_0310_COUNT)} CSOSN codes, got ${String(csosn.length)}`,
      );
    }

    const golden = csosn.find((entry) => entry.codigo === '101');
    if (golden === undefined) {
      throw new SourceDataError('Golden CSOSN 101 missing from static list');
    }

    await mkdir(CSOSN_DATA_DIR, { recursive: true });

    const previousCsosn = await readJsonIfExists<CsosnRecord[]>(csosnPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousCsosn ?? [],
      csosn,
      (entry) => entry.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'csosn',
        nome: 'CONFAZ CSOSN — Simples Nacional',
        fonte: 'CONFAZ Ajuste SINIEF 03/10 — CSOSN table',
        endpoints,
        contagens: { csosn: csosn.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#csosn',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(csosnPath, `${JSON.stringify(csosn, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'csosn',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Static CONFAZ CSOSN SINIEF 03/10 list generated.',
    });

    console.log(`CSOSN data written (${todayIsoDate()}): ${String(csosn.length)} codes`);
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'csosn',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[csosn] ${outcome.message}`);
  }
}

main().catch(exitWithError);
