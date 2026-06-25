import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import { fetchEsocialCategorias } from './lib/fetch-esocial-sources.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import type { EsocialCategoriaRecord } from './lib/parse-esocial-tabelas-html.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ESOCIAL_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/esocial/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const ESOCIAL_MIN_CATEGORIAS = 40;
const ESOCIAL_MAX_CATEGORIAS = 55;

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const categoriasPath = path.join(ESOCIAL_DATA_DIR, 'categorias.json');
  const metadataPath = path.join(ESOCIAL_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [
    'https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html',
  ];

  try {
    const { records, endpoints: resolvedEndpoints } = await fetchEsocialCategorias(
      FETCH_MAX_ATTEMPTS,
    );
    const categorias = records;

    if (
      categorias.length < ESOCIAL_MIN_CATEGORIAS ||
      categorias.length > ESOCIAL_MAX_CATEGORIAS
    ) {
      throw new SourceDataError(
        `Expected ${String(ESOCIAL_MIN_CATEGORIAS)}–${String(ESOCIAL_MAX_CATEGORIAS)} worker categories, got ${String(categorias.length)}`,
      );
    }

    const codigoSet = new Set(categorias.map((entry) => entry.codigo));
    if (codigoSet.size !== categorias.length) {
      throw new SourceDataError('Duplicate eSocial category codes detected');
    }

    await mkdir(ESOCIAL_DATA_DIR, { recursive: true });

    const previousCategorias = await readJsonIfExists<EsocialCategoriaRecord[]>(categoriasPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousCategorias ?? [],
      categorias,
      (entry) => entry.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'esocial',
        nome: 'eSocial Tabela 01 — Categorias de Trabalhadores',
        fonte: 'eSocial S-1.3 — Tabela 01 (Categorias de Trabalhadores)',
        endpoints: resolvedEndpoints,
        contagens: { categorias: categorias.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#esocial-categorias-trabalhadores',
        agendamento: 'manual',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(categoriasPath, `${JSON.stringify(categorias, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'esocial',
      status: 'ok',
      endpoints: resolvedEndpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'eSocial Tabela 01 worker categories embedded from official layout tables.',
    });

    console.log(
      `eSocial data written (${todayIsoDate()}): ${String(categorias.length)} worker categories`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'esocial',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[esocial] ${outcome.message}`);
  }
}

main().catch(exitWithError);
