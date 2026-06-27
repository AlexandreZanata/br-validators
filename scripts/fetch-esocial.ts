import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import { fetchEsocialCategorias, fetchEsocialRubricas } from './lib/fetch-esocial-sources.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import type {
  EsocialCategoriaRecord,
  EsocialRubricaRecord,
} from './lib/parse-esocial-tabelas-html.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ESOCIAL_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/esocial/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const ESOCIAL_MIN_CATEGORIAS = 40;
const ESOCIAL_MAX_CATEGORIAS = 55;
const ESOCIAL_MIN_RUBRICAS = 200;
const ESOCIAL_MAX_RUBRICAS = 220;

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function assertUniqueCodes(records: readonly { codigo: string }[], label: string): void {
  const codigoSet = new Set(records.map((entry) => entry.codigo));
  if (codigoSet.size !== records.length) {
    throw new SourceDataError(`Duplicate eSocial ${label} codes detected`);
  }
}

async function main(): Promise<void> {
  const categoriasPath = path.join(ESOCIAL_DATA_DIR, 'categorias.json');
  const rubricasPath = path.join(ESOCIAL_DATA_DIR, 'rubricas.json');
  const metadataPath = path.join(ESOCIAL_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [
    'https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html',
  ];

  try {
    const [categoriasResult, rubricasResult] = await Promise.all([
      fetchEsocialCategorias(FETCH_MAX_ATTEMPTS),
      fetchEsocialRubricas(FETCH_MAX_ATTEMPTS),
    ]);
    const categorias = categoriasResult.records;
    const rubricas = rubricasResult.records;
    const resolvedEndpoints = categoriasResult.endpoints;

    if (
      categorias.length < ESOCIAL_MIN_CATEGORIAS ||
      categorias.length > ESOCIAL_MAX_CATEGORIAS
    ) {
      throw new SourceDataError(
        `Expected ${String(ESOCIAL_MIN_CATEGORIAS)}–${String(ESOCIAL_MAX_CATEGORIAS)} worker categories, got ${String(categorias.length)}`,
      );
    }

    if (rubricas.length < ESOCIAL_MIN_RUBRICAS || rubricas.length > ESOCIAL_MAX_RUBRICAS) {
      throw new SourceDataError(
        `Expected ${String(ESOCIAL_MIN_RUBRICAS)}–${String(ESOCIAL_MAX_RUBRICAS)} payroll rubricas, got ${String(rubricas.length)}`,
      );
    }

    assertUniqueCodes(categorias, 'category');
    assertUniqueCodes(rubricas, 'rubrica');

    await mkdir(ESOCIAL_DATA_DIR, { recursive: true });

    const previousCategorias = await readJsonIfExists<EsocialCategoriaRecord[]>(categoriasPath);
    const previousRubricas = await readJsonIfExists<EsocialRubricaRecord[]>(rubricasPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const categoriaChanges = diffRecordsByKey(
      previousCategorias ?? [],
      categorias,
      (entry) => entry.codigo,
      comparadoCom,
    );
    const rubricaChanges = diffRecordsByKey(
      previousRubricas ?? [],
      rubricas,
      (entry) => entry.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'esocial',
        nome: 'eSocial S-1.3 — Tabela 01 (Categorias) + Tabela 03 (Rubricas)',
        fonte: 'eSocial S-1.3 — Tabelas 01 e 03',
        endpoints: resolvedEndpoints,
        contagens: { categorias: categorias.length, rubricas: rubricas.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#esocial',
        agendamento: 'manual',
      },
      {
        adicionados: categoriaChanges.adicionados + rubricaChanges.adicionados,
        removidos: categoriaChanges.removidos + rubricaChanges.removidos,
        alterados: categoriaChanges.alterados + rubricaChanges.alterados,
        comparadoCom: categoriaChanges.comparadoCom,
      },
    );

    const jsonIndent = 2;
    await writeFile(categoriasPath, `${JSON.stringify(categorias, null, jsonIndent)}\n`);
    await writeFile(rubricasPath, `${JSON.stringify(rubricas, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'esocial',
      status: 'ok',
      endpoints: resolvedEndpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message:
        'eSocial Tabela 01 worker categories and Tabela 03 payroll rubricas embedded from official layout tables.',
    });

    console.log(
      `eSocial data written (${todayIsoDate()}): ${String(categorias.length)} worker categories, ${String(rubricas.length)} payroll rubricas`,
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
