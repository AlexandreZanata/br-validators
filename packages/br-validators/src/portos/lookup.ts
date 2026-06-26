/**
 * ANTAQ port installations lookup — offline embedded data from official open-data xlsx.
 * @see docs/OFFICIAL-SOURCES.md#portos
 */

import portosData from './data/portos.json';
import { resolveStringCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Porto } from './types.js';

const portos: readonly Porto[] = portosData;

function normalizeCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

/** Returns every embedded ANTAQ port row (in-memory reference, not a copy). */
export function getAllPortos(): readonly Porto[] {
  return portos;
}

/** @deprecated Use {@link getAllPortos} instead. Removed in v2.0. */
export function getPortos(): readonly Porto[] {
  return getAllPortos();
}

export function lookupPortoPorCodigo(codigo: string): LookupResult<Porto> {
  return resolveStringCodeLookup({
    input: codigo,
    entityLabel: 'Port',
    normalize: normalizeCodigo,
    isValidNormalized: (normalized) => /^BR[A-Z0-9]{3,8}$/.test(normalized),
    invalidFormatMessage: 'Port code must match BR + 3–8 alphanumeric characters (ANTAQ)',
    find: (normalized) => portos.find((porto) => porto.codigo === normalized),
  });
}

export function getPortoPorCodigo(codigo: string): Porto | undefined {
  return unwrapLookupValue(lookupPortoPorCodigo(codigo));
}

export function getPortosPorMunicipio(ibgeCodigo: number): readonly Porto[] {
  if (!Number.isInteger(ibgeCodigo) || ibgeCodigo <= 0) {
    return [];
  }
  return portos.filter((porto) => porto.municipioIbge === ibgeCodigo);
}

export function searchPortos(query: string, options?: { limit?: number }): readonly Porto[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Porto[] = [];

  for (const porto of portos) {
    const matchesNome = porto.nome.toLowerCase().includes(normalizedQuery);
    const matchesCodigo = porto.codigo.toLowerCase().includes(normalizedQuery);
    const matchesMunicipio = porto.municipioNome.toLowerCase().includes(normalizedQuery);
    if (matchesNome || matchesCodigo || matchesMunicipio) {
      results.push(porto);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
