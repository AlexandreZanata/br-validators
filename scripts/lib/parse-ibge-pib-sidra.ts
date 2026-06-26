/**
 * Fetch + parse IBGE SIDRA table 5938 — municipal PIB at current prices (2022).
 * @see https://apisidra.ibge.gov.br/values/t/5938/n6/all/v/37/p/2022
 */

import { FETCH_MAX_ATTEMPTS, FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';
import { fetchJsonWithRetry } from './fetch-utils.js';

export const IBGE_SIDRA_PIB_TABLE = 5938;
export const IBGE_SIDRA_PIB_VARIABLE = 37;
export const IBGE_SIDRA_PIB_YEAR = 2022;

export const IBGE_SIDRA_PIB_URL = buildIbgeSidraPibUrl(IBGE_SIDRA_PIB_YEAR);

export interface IbgeSidraPibRow {
  codigoIbge: number;
  pibMilReais: number;
}

export interface IbgeSidraPibPayloadRow {
  NC: string;
  D1C: string;
  V: string;
}

export function buildIbgeSidraPibUrl(year = IBGE_SIDRA_PIB_YEAR): string {
  return `https://apisidra.ibge.gov.br/values/t/${String(IBGE_SIDRA_PIB_TABLE)}/n6/all/v/${String(IBGE_SIDRA_PIB_VARIABLE)}/p/${String(year)}`;
}

function isIbgeSidraPibPayloadRow(value: object): value is IbgeSidraPibPayloadRow {
  return (
    'NC' in value &&
    typeof value.NC === 'string' &&
    'D1C' in value &&
    typeof value.D1C === 'string' &&
    'V' in value &&
    typeof value.V === 'string'
  );
}

export function parseIbgeSidraPibValor(raw: string): number | null {
  if (raw === '-' || raw === '...') {
    return null;
  }
  const normalized = raw.replace(/\./g, '');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export function parseIbgeSidraPibPayload(
  payload: readonly IbgeSidraPibPayloadRow[],
): IbgeSidraPibRow[] {
  const results: IbgeSidraPibRow[] = [];

  for (const row of payload) {
    if (row.NC === 'Nível Territorial (Código)') {
      continue;
    }

    const pibMilReais = parseIbgeSidraPibValor(row.V);
    if (pibMilReais === null) {
      continue;
    }

    const codigoIbge = Number(row.D1C);
    if (!Number.isFinite(codigoIbge) || codigoIbge <= 0) {
      continue;
    }

    results.push({ codigoIbge, pibMilReais });
  }

  return results;
}

function readSidraPayloadRows(raw: readonly object[]): IbgeSidraPibPayloadRow[] {
  const rows: IbgeSidraPibPayloadRow[] = [];
  for (const item of raw) {
    if (isIbgeSidraPibPayloadRow(item)) {
      rows.push(item);
    }
  }
  return rows;
}

export function parseIbgeSidraPibJson(raw: string): IbgeSidraPibRow[] {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (!Array.isArray(parsed)) {
    throw new Error('Expected SIDRA JSON array');
  }
  return parseIbgeSidraPibPayload(readSidraPayloadRows(parsed));
}

export function sortSidraPibRowsByPibDesc(
  rows: readonly IbgeSidraPibRow[],
): IbgeSidraPibRow[] {
  return [...rows].sort((left, right) => right.pibMilReais - left.pibMilReais);
}

export async function fetchIbgeSidraPibMunicipios(
  year = IBGE_SIDRA_PIB_YEAR,
): Promise<IbgeSidraPibRow[]> {
  const url = buildIbgeSidraPibUrl(year);
  const payload = await fetchJsonWithRetry<readonly object[]>(
    url,
    FETCH_MAX_ATTEMPTS,
    FETCH_RETRY_DELAY_MS,
    120_000,
  );
  if (!Array.isArray(payload)) {
    throw new Error('Expected SIDRA JSON array');
  }
  const rows = parseIbgeSidraPibPayload(readSidraPayloadRows(payload));
  if (rows.length < 5_000) {
    throw new Error(`Expected at least 5000 SIDRA municipal PIB rows, got ${String(rows.length)}`);
  }
  return rows;
}
