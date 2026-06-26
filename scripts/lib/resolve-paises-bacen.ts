import {
  BACEN_PAISES_FTP_URL,
  NFE_DIVERSOS_LIST_URL,
  NFE_PAISES_TABLE_URL,
} from '../../packages/br-validators/src/paises-bacen/constants.js';
import { fetchNfePaisesPayload } from './fetch-nfe-portal.js';
import { FETCH_MAX_ATTEMPTS, SourceDataError } from './source-fetch-outcome.js';
import { fetchText, FetchError } from './fetch-utils.js';
import { loadOfficialPaisesBacen } from './paises-bacen-official.js';
import {
  mergePaisesBacenRecords,
  parseNfePaisesTable,
  type PaisBacenRecord,
} from './parse-nfe-paises.js';
import { parsePaisesFromPayload } from './parse-paises-payload.js';

export { BACEN_PAISES_FTP_URL, NFE_DIVERSOS_LIST_URL, NFE_PAISES_TABLE_URL };

export type PaisesBacenFetchSource = 'nfe-fetch' | 'bacen-fetch' | 'embedded';

export interface ResolvePaisesBacenResult {
  paises: PaisBacenRecord[];
  source: PaisesBacenFetchSource;
  attemptsUsed: number;
  endpoints: string[];
  fetchDetail: string | null;
  winningEndpoint: string | null;
}

const BACEN_FTP_MIN_RECORDS = 200;

export async function resolvePaisesBacen(minRecords: number): Promise<ResolvePaisesBacenResult> {
  const endpoints = [NFE_PAISES_TABLE_URL, NFE_DIVERSOS_LIST_URL, BACEN_PAISES_FTP_URL];

  try {
    const { payload, attemptsUsed, finalUrl } = await fetchNfePaisesPayload(
      NFE_PAISES_TABLE_URL,
      minRecords,
    );
    const paises = parsePaisesFromPayload(payload);
    if (paises.length >= minRecords) {
      return {
        paises,
        source: 'nfe-fetch',
        attemptsUsed,
        endpoints,
        fetchDetail: null,
        winningEndpoint: finalUrl,
      };
    }
  } catch (error) {
    const nfeDetail = error instanceof Error ? error.message : 'Unknown NF-e portal fetch error';
    const bacenResult = await tryBacenFtpFetch(minRecords, endpoints, nfeDetail);
    if (bacenResult !== null) {
      return bacenResult;
    }

    return buildEmbeddedResult(endpoints, FETCH_MAX_ATTEMPTS, nfeDetail);
  }

  const bacenResult = await tryBacenFtpFetch(
    minRecords,
    endpoints,
    'Portal payload did not meet minimum country count',
  );
  if (bacenResult !== null) {
    return bacenResult;
  }

  return buildEmbeddedResult(
    endpoints,
    FETCH_MAX_ATTEMPTS,
    'Portal payload did not meet minimum country count',
  );
}

async function tryBacenFtpFetch(
  minRecords: number,
  endpoints: string[],
  nfeDetail: string,
): Promise<ResolvePaisesBacenResult | null> {
  try {
    const text = await fetchText(BACEN_PAISES_FTP_URL, 30_000);
    const bacenPaises = parseNfePaisesTable(text);
    if (bacenPaises.length < BACEN_FTP_MIN_RECORDS) {
      return null;
    }

    const merged = mergePaisesBacenRecords(bacenPaises, loadOfficialPaisesBacen());
    if (merged.length < minRecords) {
      return null;
    }

    return {
      paises: merged,
      source: 'bacen-fetch',
      attemptsUsed: 1,
      endpoints,
      fetchDetail: `NF-e portal unavailable (${nfeDetail}); Bacen FTP merged with NF-e supplemental codes.`,
      winningEndpoint: BACEN_PAISES_FTP_URL,
    };
  } catch (error) {
    if (error instanceof FetchError) {
      return null;
    }
    throw error;
  }
}

function buildEmbeddedResult(
  endpoints: string[],
  attemptsUsed: number,
  fetchDetail: string,
): ResolvePaisesBacenResult {
  return {
    paises: loadOfficialPaisesBacen(),
    source: 'embedded',
    attemptsUsed,
    endpoints,
    fetchDetail,
    winningEndpoint: null,
  };
}

export function validatePaisesBacenRecords(
  paises: PaisBacenRecord[],
  minRecords: number,
  maxRecords: number,
): void {
  if (paises.length < minRecords || paises.length > maxRecords) {
    throw new SourceDataError(
      `Expected ${String(minRecords)}–${String(maxRecords)} countries, got ${String(paises.length)}`,
    );
  }

  const brasil = paises.find((pais) => pais.codigo === '1058');
  if (brasil === undefined || !brasil.nome.toUpperCase().includes('BRASIL')) {
    throw new SourceDataError('Golden country 1058 (Brasil) missing from paises-bacen dataset');
  }

  const codigoSet = new Set(paises.map((pais) => pais.codigo));
  if (codigoSet.size !== paises.length) {
    throw new SourceDataError('Duplicate Bacen country codes detected');
  }
}
