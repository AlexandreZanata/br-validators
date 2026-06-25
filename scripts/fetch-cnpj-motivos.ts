import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError, toError } from './lib/errors.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import { parseCnpjMotivosCsv, type CnpjMotivoRecord } from './lib/parse-cnpj-motivos-csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/cnpj-motivos/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const TEMP_ZIP_PATH = path.join(ROOT, '.tmp/cnpj-motivos-fetch/Motivos.zip');

export const CNPJ_MOTIVOS_BASE_URL =
  'https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj';

/**
 * Dev fallback when dadosabertos.rfb.gov.br times out.
 * Community mirror of official RFB CNPJ open-data Motivos.zip (2024-09 release).
 * @see https://github.com/jonathands/dados-abertos-receita-cnpj
 */
export const DEV_FALLBACK_MOTIVOS_ZIP_URL =
  'https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Motivos.zip';

export const MIN_MOTIVOS = 55;
export const MAX_MOTIVOS = 65;

function buildRecentMonthUrls(): string[] {
  const urls: string[] = [];
  const now = new Date();
  for (let offset = 0; offset < 6; offset += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    urls.push(`${CNPJ_MOTIVOS_BASE_URL}/${year}-${month}/Motivos.zip`);
  }
  return urls;
}

async function downloadZip(url: string, destination: string): Promise<void> {
  let lastError: object | string | number | boolean | null = null;
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'br-validators-data-refresh/1.0' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new SourceDataError(`HTTP ${String(response.status)} downloading ${url}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, buffer);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : 'Unknown download error';
      if (attempt < FETCH_MAX_ATTEMPTS) {
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      }
    }
  }
  throw toError(lastError ?? 'Unknown download error');
}

function extractCsvFromZip(zipPath: string): string {
  const listResult = spawnSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
  if (listResult.status !== 0) {
    throw new SourceDataError('Failed to list Motivos.zip contents');
  }
  const entryName = listResult.stdout
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().includes('moti') || line.toLowerCase().endsWith('.csv'));
  if (entryName === undefined || entryName.length === 0) {
    throw new SourceDataError('Motivos.zip does not contain expected CSV entry');
  }

  const extractResult = spawnSync('unzip', ['-p', zipPath, entryName], {
    encoding: 'latin1',
    maxBuffer: 1024 * 1024,
  });
  if (extractResult.status !== 0 || extractResult.stdout.length === 0) {
    throw new SourceDataError(`Failed to extract ${entryName} from Motivos.zip`);
  }
  return extractResult.stdout;
}

async function fetchMotivosZip(endpoints: string[]): Promise<{ csvText: string; usedUrl: string }> {
  const monthUrls = buildRecentMonthUrls();
  const candidateUrls = [...monthUrls, DEV_FALLBACK_MOTIVOS_ZIP_URL];
  let lastError: object | string | number | boolean | null = null;

  for (const url of candidateUrls) {
    try {
      await downloadZip(url, TEMP_ZIP_PATH);
      const csvText = extractCsvFromZip(TEMP_ZIP_PATH);
      if (csvText.trim().length === 0) {
        throw new SourceDataError('Motivos CSV returned an empty body');
      }
      endpoints.push(url);
      return { csvText, usedUrl: url };
    } catch (error) {
      lastError = error instanceof Error ? error : 'Unknown download error';
    }
  }

  throw toError(lastError ?? 'All Motivos.zip download URLs failed');
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const dataPath = path.join(DATA_DIR, 'motivos.json');
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints: string[] = [];

  try {
    const { csvText } = await fetchMotivosZip(endpoints);
    const motivos = parseCnpjMotivosCsv(csvText);

    if (motivos.length < MIN_MOTIVOS || motivos.length > MAX_MOTIVOS) {
      throw new SourceDataError(
        `Expected ${String(MIN_MOTIVOS)}–${String(MAX_MOTIVOS)} motivos, got ${String(motivos.length)}`,
      );
    }

    const codigoSet = new Set(motivos.map((record) => record.codigo));
    if (codigoSet.size !== motivos.length) {
      throw new SourceDataError('Duplicate motivo situacao cadastral codes detected');
    }

    await mkdir(DATA_DIR, { recursive: true });
    const previousMotivos = await readJsonIfExists<CnpjMotivoRecord[]>(dataPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousMotivos ?? [],
      motivos,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'cnpj-motivos',
        nome: 'RFB CNPJ Motivos de Situação Cadastral',
        fonte: 'Receita Federal — Dados Abertos CNPJ (Motivos.zip)',
        endpoints,
        contagens: { motivos: motivos.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#cnpj-motivos-situacao-cadastral',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(dataPath, `${JSON.stringify(motivos, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'cnpj-motivos',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official RFB Motivos.zip fetch succeeded.',
    });

    console.log(`CNPJ motivos data written (${todayIsoDate()}): ${String(motivos.length)} codes`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'cnpj-motivos',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[cnpj-motivos] ${outcome.message}`);
  }
}

main().catch(exitWithError);
