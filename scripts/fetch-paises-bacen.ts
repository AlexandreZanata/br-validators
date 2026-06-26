import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import {
  buildEmbeddedFallbackOutcome,
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import {
  BACEN_PAISES_FTP_URL,
  NFE_DIVERSOS_LIST_URL,
  NFE_PAISES_TABLE_URL,
  resolvePaisesBacen,
  validatePaisesBacenRecords,
} from './lib/resolve-paises-bacen.js';
import type { PaisBacenRecord } from './lib/parse-nfe-paises.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PAISES_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/paises-bacen/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

export { BACEN_PAISES_FTP_URL, NFE_DIVERSOS_LIST_URL, NFE_PAISES_TABLE_URL };

export const MIN_PAISES_BACEN = 240;
export const MAX_PAISES_BACEN = 270;

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const paisesPath = path.join(PAISES_DATA_DIR, 'paises.json');
  const metadataPath = path.join(PAISES_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [NFE_PAISES_TABLE_URL, NFE_DIVERSOS_LIST_URL, BACEN_PAISES_FTP_URL];

  try {
    const { paises, source, attemptsUsed, fetchDetail, winningEndpoint } = await resolvePaisesBacen(
      MIN_PAISES_BACEN,
    );
    validatePaisesBacenRecords(paises, MIN_PAISES_BACEN, MAX_PAISES_BACEN);

    await mkdir(PAISES_DATA_DIR, { recursive: true });

    const previousPaises = await readJsonIfExists<PaisBacenRecord[]>(paisesPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousPaises ?? [],
      paises,
      (pais) => pais.codigo,
      comparadoCom,
    );

    const fonte =
      source === 'bacen-fetch'
        ? 'Banco Central FTP paises.txt + NF-e supplemental codes'
        : source === 'nfe-fetch'
          ? 'Portal Nacional NF-e — Tabela de Países (Bacen)'
          : 'Portal Nacional NF-e — Tabela de Países (Bacen)';

    const metadata = buildMetadata(
      {
        id: 'paises-bacen',
        nome: 'NF-e Bacen Country Codes',
        fonte,
        endpoints,
        contagens: { paises: paises.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#paises-bacen',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(paisesPath, `${JSON.stringify(paises, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    if (source === 'nfe-fetch') {
      await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
        datasetId: 'paises-bacen',
        status: 'ok',
        endpoints,
        attempts: attemptsUsed,
        checkedAt: new Date().toISOString(),
        retainedEmbeddedDataFrom: metadata.capturadoEm,
        message: `Official NF-e country table fetch succeeded (${winningEndpoint ?? NFE_PAISES_TABLE_URL}).`,
      });
    } else if (source === 'bacen-fetch') {
      await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
        datasetId: 'paises-bacen',
        status: 'ok',
        endpoints,
        attempts: attemptsUsed,
        checkedAt: new Date().toISOString(),
        retainedEmbeddedDataFrom: metadata.capturadoEm,
        message:
          fetchDetail ??
          'Official Bacen FTP country table fetch succeeded (merged with NF-e supplemental codes).',
      });
    } else {
      const detail =
        fetchDetail === null
          ? 'NF-e portal did not return a parseable country table.'
          : `NF-e portal did not return a parseable country table (${fetchDetail}).`;
      await writeSourceFetchOutcome(
        FETCH_OUTCOME_DIR,
        buildEmbeddedFallbackOutcome(
          'paises-bacen',
          endpoints,
          previousMetadata?.capturadoEm ?? metadata.capturadoEm,
          attemptsUsed,
          detail,
        ),
      );
    }

    console.log(
      `Paises-bacen data written (${todayIsoDate()}): ${String(paises.length)} countries (${source})`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'paises-bacen',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[paises-bacen] ${outcome.message}`);
  }
}

main().catch(exitWithError);
