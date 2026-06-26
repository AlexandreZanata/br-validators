import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import { todayIsoDate, USER_AGENT } from './lib/fetch-utils.js';
import {
  buildIssMunicipalEmbed,
  ISS_MUNICIPAL_TARGET_COUNT,
  parseIbgePibTopForBuild,
  type IssMunicipalEmbedRow,
} from './lib/iss-municipal-build.js';
import { IBGE_PIB_TOP100_XLSX_URL } from './lib/parse-ibge-pib-top-municipios.js';
import { ISS_MUNICIPAL_CAPITAL_IBGE_CODES } from './lib/iss-municipal-capital-seeds.js';
import { buildMetadata } from './lib/metadata-writer.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ISS_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/iss-municipal/data');
const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const TMP_XLSX_PATH = path.join(ROOT, '.local/tmp/ibge-pib-top100-2022.xlsx');

const PLANALTO_LC116_URL = 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm';
const IBGE_PIB_MUNICIPAL_URL =
  'https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9088-produto-interno-bruto-dos-municipios.html';
const IBGE_MUNICIPIO_CODES_URL = 'https://www.ibge.gov.br/explica/codigos-dos-municipios.php';
const CNM_LEGISLACAO_URL = 'https://www.cnm.org.br/';
const NFSE_NACIONAL_URL = 'https://www.gov.br/nfse/pt-br';

interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function validateEmbedRows(rows: readonly IssMunicipalEmbedRow[]): void {
  if (rows.length !== ISS_MUNICIPAL_TARGET_COUNT) {
    throw new SourceDataError(
      `Expected ${String(ISS_MUNICIPAL_TARGET_COUNT)} ISS municipal rows, got ${String(rows.length)}`,
    );
  }

  const capitalSet = new Set(ISS_MUNICIPAL_CAPITAL_IBGE_CODES);
  let capitalCount = 0;
  for (const row of rows) {
    if (row.aliquotaMin < 2 || row.aliquotaMax > 5 || row.aliquotaMin > row.aliquotaMax) {
      throw new SourceDataError(
        `Invalid ISS alíquota band for ${row.nome}/${row.uf}: ${String(row.aliquotaMin)}–${String(row.aliquotaMax)}`,
      );
    }
    if (capitalSet.has(row.codigoIbge)) {
      capitalCount += 1;
    }
  }

  if (capitalCount !== ISS_MUNICIPAL_CAPITAL_IBGE_CODES.length) {
    throw new SourceDataError(
      `Expected ${String(ISS_MUNICIPAL_CAPITAL_IBGE_CODES.length)} capitals in embed, found ${String(capitalCount)}`,
    );
  }
}

async function downloadXlsx(url: string, destination: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, 60_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*',
        'User-Agent': USER_AGENT,
      },
    });
    if (!response.ok) {
      throw new SourceDataError(`HTTP ${String(response.status)} downloading ${url}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(destination, buffer);
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  const issPath = path.join(ISS_DATA_DIR, 'iss-municipal.json');
  const metadataPath = path.join(ISS_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [
    PLANALTO_LC116_URL,
    IBGE_PIB_MUNICIPAL_URL,
    IBGE_MUNICIPIO_CODES_URL,
    IBGE_PIB_TOP100_XLSX_URL,
    CNM_LEGISLACAO_URL,
    NFSE_NACIONAL_URL,
  ];

  try {
    const municipiosRaw = await readFile(IBGE_MUNICIPIOS_PATH, 'utf8');
    const municipios = JSON.parse(municipiosRaw) as MunicipioRecord[];

    await mkdir(path.dirname(TMP_XLSX_PATH), { recursive: true });
    await downloadXlsx(IBGE_PIB_TOP100_XLSX_URL, TMP_XLSX_PATH);

    const pibTopRows = parseIbgePibTopForBuild(TMP_XLSX_PATH, municipios);
    const capturadoEm = todayIsoDate();
    const rows = buildIssMunicipalEmbed({
      municipios,
      pibTopRows,
      capturadoEm,
    });
    validateEmbedRows(rows);

    const previousRows = await readJsonIfExists<IssMunicipalEmbedRow[]>(issPath);
    const changes = diffRecordsByKey(
      previousRows ?? [],
      rows,
      (row) => String(row.codigoIbge),
      previousMetadata?.capturadoEm ?? null,
    );

    const estimativaRows = rows.filter((row) => row.estimativa).length;
    const metadata = {
      ...buildMetadata(
        {
          id: 'iss-municipal',
          nome: 'ISS municipal alíquotas — partial embed (capitals + top PIB)',
          fonte: 'Municipal legislation + LC 116/2003 Art. 8 band + IBGE PIB municipal ranking',
          endpoints,
          contagens: {
            municipios: rows.length,
            capitais: ISS_MUNICIPAL_CAPITAL_IBGE_CODES.length,
            estimativaRows,
          },
          documentacao: 'docs/OFFICIAL-SOURCES.md#iss-municipal',
          agendamento: 'manual',
        },
        changes,
      ),
      estimativa: true,
    };

    await mkdir(ISS_DATA_DIR, { recursive: true });
    await writeFile(issPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'iss-municipal',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: `ISS municipal partial embed — ${String(rows.length)} municipalities (${String(ISS_MUNICIPAL_CAPITAL_IBGE_CODES.length)} capitals, ${String(estimativaRows)} estimation rows)`,
    });

    console.log(`Wrote ${String(rows.length)} ISS municipal rows to ${issPath}`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'iss-municipal',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    throw error;
  }
}

main().catch(exitWithError);
