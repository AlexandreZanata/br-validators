import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from './lib/errors.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import {
  buildIssMunicIbgeEmbed,
  collectEmbeddedIssIbgeCodes,
  IBGE_MUNIC_BASE_2024_URL,
  IBGE_MUNIC_PESQUISA_URL,
  ISS_MUNIC_IBGE_RESEARCH_NOTA,
  type IbgeMunicipioIndexEntry,
} from './lib/iss-munic-ibge-build.js';
import { ISS_MUNICIPAL_TARGET_COUNT } from './lib/iss-municipal-build.js';
import {
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  buildFailureOutcome,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ISS_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/iss-municipal/data');
const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');
const ISS_MUNICIPAL_PATH = path.join(ISS_DATA_DIR, 'iss-municipal.json');
const MUNIC_IBGE_PATH = path.join(ISS_DATA_DIR, 'iss-munic-ibge.json');
const MUNIC_IBGE_METADATA_PATH = path.join(ISS_DATA_DIR, 'munic-ibge-metadata.json');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const MUNIC_ANO_PESQUISA = 2024;
const MIN_IBGE_MUNICIPIOS = 5500;

interface IssMunicipalEmbedRow {
  codigoIbge: number;
}

function validateMunicIbgeRows(
  rows: readonly { codigoIbge: number; aliquotaMin: number; aliquotaMax: number }[],
  expectedCount: number,
): void {
  if (rows.length !== expectedCount) {
    throw new SourceDataError(
      `Expected ${String(expectedCount)} MUNIC/IBGE fallback rows, got ${String(rows.length)}`,
    );
  }

  for (const row of rows) {
    if (row.aliquotaMin < 2 || row.aliquotaMax > 5 || row.aliquotaMin > row.aliquotaMax) {
      throw new SourceDataError(
        `Invalid MUNIC/IBGE alíquota band for IBGE ${String(row.codigoIbge)}: ${String(row.aliquotaMin)}–${String(row.aliquotaMax)}`,
      );
    }
  }
}

async function main(): Promise<void> {
  const capturadoEm = todayIsoDate();
  const endpoints = [IBGE_MUNIC_PESQUISA_URL, IBGE_MUNIC_BASE_2024_URL];

  try {
    const municipios = JSON.parse(await readFile(IBGE_MUNICIPIOS_PATH, 'utf8')) as IbgeMunicipioIndexEntry[];
    const issMunicipal = JSON.parse(await readFile(ISS_MUNICIPAL_PATH, 'utf8')) as IssMunicipalEmbedRow[];

    if (municipios.length < MIN_IBGE_MUNICIPIOS) {
      throw new SourceDataError(
        `Expected at least ${String(MIN_IBGE_MUNICIPIOS)} IBGE municipios, got ${String(municipios.length)}`,
      );
    }

    if (issMunicipal.length !== ISS_MUNICIPAL_TARGET_COUNT) {
      throw new SourceDataError(
        `Expected ${String(ISS_MUNICIPAL_TARGET_COUNT)} ISS municipal rows before MUNIC join, got ${String(issMunicipal.length)}`,
      );
    }

    const embeddedCodes = collectEmbeddedIssIbgeCodes(issMunicipal);
    const rows = buildIssMunicIbgeEmbed({
      municipios,
      embeddedIssIbgeCodes: embeddedCodes,
      municAnoPesquisa: MUNIC_ANO_PESQUISA,
    });

    const expectedCount = municipios.length - embeddedCodes.size;
    validateMunicIbgeRows(rows, expectedCount);

    await mkdir(ISS_DATA_DIR, { recursive: true });
    await writeFile(MUNIC_IBGE_PATH, `${JSON.stringify(rows, null, 2)}\n`);
    await writeFile(
      MUNIC_IBGE_METADATA_PATH,
      `${JSON.stringify(
        {
          id: 'iss-munic-ibge',
          municAnoPesquisa: MUNIC_ANO_PESQUISA,
          municBaseUrl: IBGE_MUNIC_BASE_2024_URL,
          municPesquisaUrl: IBGE_MUNIC_PESQUISA_URL,
          issSidraTableId: null,
          nota: ISS_MUNIC_IBGE_RESEARCH_NOTA,
          capturadoEm,
          contagens: { municipios: rows.length },
          documentacao: 'docs/OFFICIAL-SOURCES.md#iss-munic-ibge',
        },
        null,
        2,
      )}\n`,
    );

    const bytes = Buffer.byteLength(JSON.stringify(rows));
    console.log(
      `MUNIC/IBGE ISS fallback written: ${String(rows.length)} municipalities (~${String(Math.round(bytes / 1024))} KiB raw JSON)`,
    );
    console.log(`Research note: ${ISS_MUNIC_IBGE_RESEARCH_NOTA}`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'iss-munic-ibge',
      status: 'ok',
      endpoints,
      attempts: 1,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: capturadoEm,
      message: `ISS MUNIC/IBGE fallback — ${String(rows.length)} municipalities (MUNIC ${String(MUNIC_ANO_PESQUISA)})`,
    });
  } catch (error) {
    const outcome = buildFailureOutcome(
      'iss-munic-ibge',
      endpoints,
      capturadoEm,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    throw error;
  }
}

main().catch(exitWithError);
