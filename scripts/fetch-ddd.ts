import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ANATEL_DDDS } from '../packages/br-validators/src/core/telefone/constants.js';
import { DDD_TO_UF, UF_TO_REGIAO } from './lib/ddd-uf-map.js';
import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
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
const TELEFONE_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/core/telefone/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');

const ANATEL_DDD_PANEL_URL =
  'https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais';

interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

interface DddRecord {
  ddd: string;
  uf: string;
  regiao: string;
  municipios: string[];
}

function buildDddRecords(municipios: MunicipioRecord[]): DddRecord[] {
  const municipiosByUf = new Map<string, string[]>();

  for (const municipio of municipios) {
    const list = municipiosByUf.get(municipio.uf) ?? [];
    list.push(municipio.nome);
    municipiosByUf.set(municipio.uf, list);
  }

  for (const [uf, names] of municipiosByUf) {
    names.sort((left, right) => left.localeCompare(right, 'pt-BR'));
    municipiosByUf.set(uf, names);
  }

  const records: DddRecord[] = [];

  for (const ddd of ANATEL_DDDS) {
    const uf = DDD_TO_UF[ddd];
    const regiao = UF_TO_REGIAO[uf];

    records.push({
      ddd,
      uf,
      regiao,
      municipios: municipiosByUf.get(uf) ?? [],
    });
  }

  return records.sort((left, right) => left.ddd.localeCompare(right.ddd));
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
  const dddPath = path.join(TELEFONE_DATA_DIR, 'ddd-municipios.json');
  const metadataPath = path.join(TELEFONE_DATA_DIR, 'ddd-metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [ANATEL_DDD_PANEL_URL, 'packages/br-validators/src/ibge/data/municipios.json'];

  try {
    let municipiosRaw: string;
    try {
      municipiosRaw = await readFile(IBGE_MUNICIPIOS_PATH, 'utf8');
    } catch {
      throw new SourceDataError(
        'IBGE municipios dependency is missing — run fetch:data:ibge first',
        'dependency_failed',
      );
    }

    const municipios = JSON.parse(municipiosRaw) as MunicipioRecord[];
    if (municipios.length === 0) {
      throw new SourceDataError('IBGE municipios dependency returned an empty dataset', 'dependency_failed');
    }

    const dddRecords = buildDddRecords(municipios);

    if (dddRecords.length !== ANATEL_DDDS.length) {
      throw new SourceDataError(
        `Expected ${String(ANATEL_DDDS.length)} DDD records, got ${String(dddRecords.length)}`,
      );
    }

    await mkdir(TELEFONE_DATA_DIR, { recursive: true });

    const previousRecords = await readJsonIfExists<DddRecord[]>(dddPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;

    const changes = diffRecordsByKey(
      previousRecords ?? [],
      dddRecords,
      (record) => record.ddd,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'telefone-ddd',
        nome: 'Anatel DDD Geographic Lookup',
        fonte: 'Anatel Plano de Numeração + IBGE municipios',
        endpoints,
        contagens: { ddds: dddRecords.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#anatel-ddd-lookup',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(dddPath, `${JSON.stringify(dddRecords, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'telefone-ddd',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'DDD dataset rebuilt from embedded IBGE municipios.',
    });

    console.log(`DDD data written (${todayIsoDate()}): ${String(dddRecords.length)} area codes`);
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'telefone-ddd',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[telefone-ddd] ${outcome.message}`);
  }
}

main().catch(exitWithError);
