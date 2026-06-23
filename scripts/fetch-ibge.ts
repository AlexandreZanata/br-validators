import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { fetchJsonWithRetry, todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import { exitWithError } from './lib/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IBGE_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/ibge/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const IBGE_ESTADOS_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
const IBGE_MUNICIPIOS_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';
const EXPECTED_ESTADOS = 27;
const MIN_MUNICIPIOS = 5500;

interface IbgeApiRegiao {
  id: number;
  nome: string;
}

interface IbgeApiEstado {
  id: number;
  sigla: string;
  nome: string;
  regiao: IbgeApiRegiao;
}

interface IbgeApiMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: { sigla: string };
    };
  } | null;
  'regiao-imediata'?: {
    'regiao-intermediaria': {
      UF: { sigla: string };
    };
  };
}

interface EstadoRecord {
  codigo: number;
  sigla: string;
  nome: string;
  regiao: IbgeApiRegiao;
}

interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

function normalizeEstado(raw: IbgeApiEstado): EstadoRecord {
  return {
    codigo: raw.id,
    sigla: raw.sigla,
    nome: raw.nome,
    regiao: { id: raw.regiao.id, nome: raw.regiao.nome },
  };
}

function resolveMunicipioUf(raw: IbgeApiMunicipio): string {
  const fromMicrorregiao = raw.microrregiao?.mesorregiao.UF.sigla;
  if (fromMicrorregiao !== undefined) {
    return fromMicrorregiao;
  }
  const fromImediata = raw['regiao-imediata']?.['regiao-intermediaria'].UF.sigla;
  if (fromImediata !== undefined) {
    return fromImediata;
  }
  throw new Error(`Cannot resolve UF for municipality ${String(raw.id)} (${raw.nome})`);
}

function normalizeMunicipio(raw: IbgeApiMunicipio): MunicipioRecord {
  return {
    codigo: raw.id,
    nome: raw.nome,
    uf: resolveMunicipioUf(raw),
  };
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
  const metadataPath = path.join(IBGE_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [IBGE_ESTADOS_URL, IBGE_MUNICIPIOS_URL];

  try {
    const [rawEstados, rawMunicipios] = await Promise.all([
      fetchJsonWithRetry<IbgeApiEstado[]>(IBGE_ESTADOS_URL, FETCH_MAX_ATTEMPTS),
      fetchJsonWithRetry<IbgeApiMunicipio[]>(IBGE_MUNICIPIOS_URL, FETCH_MAX_ATTEMPTS),
    ]);

    if (rawEstados.length === 0 || rawMunicipios.length === 0) {
      throw new SourceDataError('Official IBGE API returned an empty payload');
    }

    const estados = rawEstados.map(normalizeEstado).sort((a, b) => a.codigo - b.codigo);
    const municipios = rawMunicipios.map(normalizeMunicipio).sort((a, b) => a.codigo - b.codigo);

    if (estados.length !== EXPECTED_ESTADOS) {
      throw new SourceDataError(
        `Expected ${String(EXPECTED_ESTADOS)} estados, got ${String(estados.length)}`,
      );
    }
    if (municipios.length < MIN_MUNICIPIOS) {
      throw new SourceDataError(
        `Expected at least ${String(MIN_MUNICIPIOS)} municipios, got ${String(municipios.length)}`,
      );
    }

    await mkdir(IBGE_DATA_DIR, { recursive: true });

    const estadosPath = path.join(IBGE_DATA_DIR, 'estados.json');
    const municipiosPath = path.join(IBGE_DATA_DIR, 'municipios.json');

    const previousEstados = await readJsonIfExists<EstadoRecord[]>(estadosPath);
    const previousMunicipios = await readJsonIfExists<MunicipioRecord[]>(municipiosPath);

    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const estadoChanges = diffRecordsByKey(
      previousEstados ?? [],
      estados,
      (e) => String(e.codigo),
      comparadoCom,
    );
    const municipioChanges = diffRecordsByKey(
      previousMunicipios ?? [],
      municipios,
      (m) => String(m.codigo),
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'ibge',
        nome: 'IBGE Localidades',
        fonte: 'IBGE API v1 /localidades',
        endpoints,
        contagens: { estados: estados.length, municipios: municipios.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#ibge-localities',
      },
      {
        adicionados: estadoChanges.adicionados + municipioChanges.adicionados,
        removidos: estadoChanges.removidos + municipioChanges.removidos,
        alterados: estadoChanges.alterados + municipioChanges.alterados,
        comparadoCom,
      },
    );

    const jsonIndent = 2;
    await writeFile(estadosPath, `${JSON.stringify(estados, null, jsonIndent)}\n`);
    await writeFile(municipiosPath, `${JSON.stringify(municipios, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'ibge',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official IBGE API fetch succeeded.',
    });

    console.log(
      `IBGE data written (${todayIsoDate()}): ${String(estados.length)} estados, ${String(municipios.length)} municipios`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'ibge',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[ibge] ${outcome.message}`);
  }
}

main().catch(exitWithError);
