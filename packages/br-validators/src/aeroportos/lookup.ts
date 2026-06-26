/**
 * Brazilian airports — offline embedded data from official ANAC source.
 * @see docs/OFFICIAL-SOURCES.md#aeroportos
 */

import aeroportosData from './data/aeroportos.json';
import { resolveStringCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Aeroporto } from './types.js';

const aeroportos: readonly Aeroporto[] = aeroportosData;

function normalizeIata(code: string): string {
  return code.trim().toUpperCase();
}

function normalizeIcao(code: string): string {
  return code.trim().toUpperCase();
}

/** Returns every embedded ANAC aerodrome row (in-memory reference, not a copy). */
export function getAllAeroportos(): readonly Aeroporto[] {
  return aeroportos;
}

/** @deprecated Use {@link getAllAeroportos} instead. Removed in v2.0. */
export function getAeroportos(): readonly Aeroporto[] {
  return getAllAeroportos();
}

export function lookupAeroportoPorIata(code: string): LookupResult<Aeroporto> {
  return resolveStringCodeLookup({
    input: code,
    entityLabel: 'Airport IATA',
    normalize: normalizeIata,
    isValidNormalized: (normalized) => /^[A-Z0-9]{3}$/.test(normalized),
    invalidFormatMessage: 'IATA code must be 3 alphanumeric characters',
    find: (normalized) => aeroportos.find((aeroporto) => aeroporto.iata === normalized),
  });
}

export function lookupAeroportoPorIcao(code: string): LookupResult<Aeroporto> {
  return resolveStringCodeLookup({
    input: code,
    entityLabel: 'Airport ICAO',
    normalize: normalizeIcao,
    isValidNormalized: (normalized) => /^[A-Z]{4}$/.test(normalized),
    invalidFormatMessage: 'ICAO code must be 4 uppercase letters',
    find: (normalized) => aeroportos.find((aeroporto) => aeroporto.icao === normalized),
  });
}

export function getAeroportoPorIata(code: string): Aeroporto | undefined {
  return unwrapLookupValue(lookupAeroportoPorIata(code));
}

export function getAeroportoPorIcao(code: string): Aeroporto | undefined {
  return unwrapLookupValue(lookupAeroportoPorIcao(code));
}

export function getAeroportosPorMunicipio(ibgeCodigo: number): readonly Aeroporto[] {
  if (!Number.isInteger(ibgeCodigo) || ibgeCodigo <= 0) {
    return [];
  }
  return aeroportos.filter((aeroporto) => aeroporto.municipioIbge === ibgeCodigo);
}
