/**
 * ISS municipal cascade lookup — 500 embed → MUNIC/IBGE → LC 116.
 * @see docs/OFFICIAL-SOURCES.md#iss-munic-ibge
 */

import ibgeMunicipios from '../ibge/data/municipios.json';
import municIbgeData from './data/iss-munic-ibge.json';
import {
  ISS_MUNICIPAL_LC116_MAX,
  ISS_MUNICIPAL_LC116_MIN,
  PLANALTO_LC116_ART8_URL,
} from './constants.js';
import { getIssMunicipalPorIbge } from './lookup.js';
import { buildIssMunicIbgeResult, buildLc116EstimativaResult } from './result.js';
import type { IssMunicIbgeRow } from './munic-ibge-types.js';
import type { IssMunicipalResult } from './types.js';
import { ISS_MUNICIPAL_DATA_VERSION } from './version.js';

const municRows: readonly IssMunicIbgeRow[] = municIbgeData;

const municByIbge = new Map(municRows.map((row) => [row.codigoIbge, row]));

interface IbgeMunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

const ibgeByCodigo = new Map(
  (ibgeMunicipios as IbgeMunicipioRecord[]).map((entry) => [entry.codigo, entry]),
);

function normalizeIbgeCodigo(codigo: number | string): number | null {
  const digits = String(codigo).replace(/\D/g, '');
  if (digits.length === 0) {
    return null;
  }
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

/** Returns MUNIC/IBGE fallback row for IBGE codes outside the 500-row partial embed. */
export function getIssMunicIbgePorIbge(codigo: number | string): IssMunicipalResult | undefined {
  const normalized = normalizeIbgeCodigo(codigo);
  if (normalized === null) {
    return undefined;
  }

  const row = municByIbge.get(normalized);
  if (row === undefined) {
    return undefined;
  }

  return buildIssMunicIbgeResult(row);
}

/**
 * Cascade lookup: partial 500 embed → MUNIC/IBGE fallback → LC 116 generic band.
 * Returns `undefined` only for invalid IBGE input or unknown municipality code.
 */
export function lookupIssMunicipalPorIbge(codigo: number | string): IssMunicipalResult | undefined {
  const embedded = getIssMunicipalPorIbge(codigo);
  if (embedded !== undefined) {
    return embedded;
  }

  const munic = getIssMunicIbgePorIbge(codigo);
  if (munic !== undefined) {
    return munic;
  }

  const normalized = normalizeIbgeCodigo(codigo);
  if (normalized === null) {
    return undefined;
  }

  return resolveIbgeLc116Fallback(normalized);
}

/** LC 116 fallback when municipality exists in IBGE localities but not yet in MUNIC embed. */
export function resolveIbgeLc116Fallback(normalizedIbge: number): IssMunicipalResult | undefined {
  const ibgeMunicipio = ibgeByCodigo.get(normalizedIbge);
  if (ibgeMunicipio === undefined) {
    return undefined;
  }

  return buildLc116EstimativaResult({
    codigoIbge: ibgeMunicipio.codigo,
    nome: ibgeMunicipio.nome,
    uf: ibgeMunicipio.uf,
    aliquotaMin: ISS_MUNICIPAL_LC116_MIN,
    aliquotaMax: ISS_MUNICIPAL_LC116_MAX,
    leiUrl: PLANALTO_LC116_ART8_URL,
    capturadoEm: ISS_MUNICIPAL_DATA_VERSION.capturadoEm,
  });
}

/** Returns every MUNIC/IBGE fallback row (in-memory reference, not a copy). */
export function getAllIssMunicIbge(): readonly IssMunicIbgeRow[] {
  return municRows;
}

/** Count of municipalities in the MUNIC/IBGE fallback embed. */
export function getIssMunicIbgeCount(): number {
  return municRows.length;
}
