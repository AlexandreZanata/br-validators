import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

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
import {
  extractGoldenIbptCargas,
  type IbptCargaRecord,
  type IbptNcmPayload,
} from './lib/parse-ibpt-ncm-json.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/ibpt/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

export const IBPT_OFFICIAL_PORTAL_URL = 'https://deolhonoimposto.ibpt.org.br/';

/**
 * Dev fallback — republication of official IBPT NCM tables (subset fetch only).
 * @see https://ibpt.valraw.com.br/
 */
export const IBPT_DEV_API_BASE_URL = 'https://ibpt.valraw.com.br/api';

export const IBPT_GOLDEN_NCMS = ['01012100', '12011000', '22030000'] as const;
export const IBPT_GOLDEN_UFS = ['SP', 'RJ', 'MG'] as const;

export const IBPT_MIN_CARGAS = 4;
export const IBPT_MAX_CARGAS = 12;

interface IbptMetaPayload {
  anos: number[];
  versoes: Partial<Record<string, string[]>>;
}

async function downloadText(url: string, gzip: boolean): Promise<string> {
  let lastError: object | string | number | boolean | null = null;
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'br-validators-data-refresh/1.0' },
        signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok) {
        throw new SourceDataError(`HTTP ${String(response.status)} downloading ${url}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (gzip) {
        return gunzipSync(buffer).toString('utf8');
      }
      return buffer.toString('utf8');
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

function parseJsonObject(raw: string): object {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new SourceDataError('Expected JSON object from IBPT API');
  }
  return parsed;
}

function resolveLatestTabela(meta: IbptMetaPayload): { ano: number; tabela: string } {
  if (meta.anos.length === 0) {
    throw new SourceDataError('IBPT meta.json has no years');
  }
  const latestYear = meta.anos[meta.anos.length - 1];
  const versoes = meta.versoes[String(latestYear)];
  if (versoes === undefined || versoes.length === 0) {
    throw new SourceDataError(`IBPT meta.json has no versions for year ${String(latestYear)}`);
  }
  const tabela = versoes[versoes.length - 1];
  if (tabela.length === 0) {
    throw new SourceDataError(`IBPT meta.json has no tabela for year ${String(latestYear)}`);
  }
  return { ano: latestYear, tabela };
}

async function fetchGoldenCargas(endpoints: string[]): Promise<IbptCargaRecord[]> {
  const metaUrl = `${IBPT_DEV_API_BASE_URL}/meta.json`;
  const metaRaw = await downloadText(metaUrl, false);
  endpoints.push(metaUrl);
  const meta = parseJsonObject(metaRaw) as IbptMetaPayload;
  const { ano, tabela } = resolveLatestTabela(meta);

  const cargas: IbptCargaRecord[] = [];
  for (const uf of IBPT_GOLDEN_UFS) {
    const url = `${IBPT_DEV_API_BASE_URL}/${String(ano)}/${tabela}/ncm/${uf}.json.gz`;
    const raw = await downloadText(url, true);
    endpoints.push(url);
    const payload = parseJsonObject(raw) as IbptNcmPayload;
    cargas.push(...extractGoldenIbptCargas(payload, uf, IBPT_GOLDEN_NCMS));
  }

  return cargas.sort((left, right) => {
    const byUf = left.uf.localeCompare(right.uf);
    if (byUf !== 0) {
      return byUf;
    }
    return left.ncm.localeCompare(right.ncm);
  });
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
  const dataPath = path.join(DATA_DIR, 'cargas.json');
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints: string[] = [IBPT_OFFICIAL_PORTAL_URL];

  try {
    const cargas = await fetchGoldenCargas(endpoints);

    if (cargas.length < IBPT_MIN_CARGAS || cargas.length > IBPT_MAX_CARGAS) {
      throw new SourceDataError(
        `Expected ${String(IBPT_MIN_CARGAS)}–${String(IBPT_MAX_CARGAS)} IBPT cargas, got ${String(cargas.length)}`,
      );
    }

    const keySet = new Set(cargas.map((carga) => `${carga.uf}:${carga.ncm}:${carga.excecao}`));
    if (keySet.size !== cargas.length) {
      throw new SourceDataError('Duplicate IBPT NCM×UF keys detected');
    }

    await mkdir(DATA_DIR, { recursive: true });
    const previousCargas = await readJsonIfExists<IbptCargaRecord[]>(dataPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousCargas ?? [],
      cargas,
      (record) => `${record.uf}:${record.ncm}:${record.excecao}`,
      comparadoCom,
    );

    const tabela = cargas[0]?.tabela ?? '';

    const metadata = buildMetadata(
      {
        id: 'ibpt',
        nome: 'IBPT — Carga tributária aproximada por NCM (Lei 12.741/2012)',
        fonte: 'IBPT — De Olho no Imposto (tabelas oficiais NCM × UF)',
        endpoints,
        contagens: { cargas: cargas.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#ibpt-carga-tributaria-ncm',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(dataPath, `${JSON.stringify(cargas, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'ibpt',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'IBPT golden NCM×UF subset fetch succeeded.',
    });

    console.log(`IBPT data written (${todayIsoDate()}): ${String(cargas.length)} cargas, tabela ${tabela}`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'ibpt',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[ibpt] ${outcome.message}`);
  }
}

main().catch(exitWithError);
