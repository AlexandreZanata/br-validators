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
  IBGE_UF_CODES_URL,
  NFE_CUF_COUNT,
  NFE_CUF_GOLDEN_SP,
  NFE_CUF_MANUAL_UF_URL,
  NFE_CUF_TABLE,
  NFE_PORTAL_URL,
} from './lib/nfe-cuf-table.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const NFE_CUF_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/nfe-cuf/data');
const IBGE_ESTADOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/estados.json');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

interface IbgeEstado {
  codigo: number;
  sigla: string;
  nome: string;
}

interface NfeCufRecord {
  codigo: string;
  uf: string;
  nome: string;
  codigoIbge: string;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function buildCufRows(): NfeCufRecord[] {
  return NFE_CUF_TABLE.map((row) => ({
    codigo: row.codigo,
    uf: row.uf,
    nome: row.nome,
    codigoIbge: row.codigoIbge,
  }));
}

async function assertIbgeCrossRef(rows: readonly NfeCufRecord[]): Promise<void> {
  const estados = await readJsonIfExists<IbgeEstado[]>(IBGE_ESTADOS_PATH);
  if (estados === null) {
    throw new SourceDataError('IBGE estados.json missing — run pnpm fetch:data:ibge first');
  }

  for (const row of rows) {
    const estado = estados.find((entry) => entry.sigla === row.uf);
    if (estado === undefined) {
      throw new SourceDataError(`IBGE cross-ref missing UF ${row.uf}`);
    }
    if (String(estado.codigo) !== row.codigoIbge) {
      throw new SourceDataError(
        `cUF ${row.codigo} codigoIbge ${row.codigoIbge} mismatches IBGE ${String(estado.codigo)} for ${row.uf}`,
      );
    }
    if (estado.nome !== row.nome) {
      throw new SourceDataError(`cUF nome mismatch for ${row.uf}: ${row.nome} vs IBGE ${estado.nome}`);
    }
  }
}

async function main(): Promise<void> {
  const cufPath = path.join(NFE_CUF_DATA_DIR, 'cuf.json');
  const metadataPath = path.join(NFE_CUF_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [NFE_CUF_MANUAL_UF_URL, NFE_PORTAL_URL, IBGE_UF_CODES_URL];

  try {
    const rows = buildCufRows();

    if (rows.length !== NFE_CUF_COUNT) {
      throw new SourceDataError(
        `Expected ${String(NFE_CUF_COUNT)} NF-e cUF rows, got ${String(rows.length)}`,
      );
    }

    const sp = rows.find((entry) => entry.codigo === NFE_CUF_GOLDEN_SP);
    if (sp === undefined || sp.uf !== 'SP') {
      throw new SourceDataError('Golden NF-e cUF 35 (SP) missing from static list');
    }

    await assertIbgeCrossRef(rows);
    await mkdir(NFE_CUF_DATA_DIR, { recursive: true });

    const previousRows = await readJsonIfExists<NfeCufRecord[]>(cufPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousRows ?? [],
      rows,
      (entry) => entry.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'nfe-cuf',
        nome: 'NF-e cUF — SEFAZ federative unit codes',
        fonte: 'Manual NF-e — Tabela de UF (static reference)',
        endpoints,
        contagens: { cuf: rows.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#nfe-cuf',
        agendamento: 'manual',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(cufPath, `${JSON.stringify(rows, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'nfe-cuf',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Static NF-e cUF table generated with IBGE cross-ref.',
    });

    console.log(`NF-e cUF data written (${todayIsoDate()}): ${String(rows.length)} federative units`);
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'nfe-cuf',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[nfe-cuf] ${outcome.message}`);
  }
}

main().catch(exitWithError);
