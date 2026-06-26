/**
 * ISO 4217 currency lookup — offline embedded data with Bacen PTAX enrichment.
 * @see docs/OFFICIAL-SOURCES.md#moedas
 */

import moedasData from './data/moedas.json';
import { resolveStringCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Moeda } from './types.js';

const moedas: readonly Moeda[] = moedasData as Moeda[];

function normalizeCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

/** Returns every embedded ISO 4217 / Bacen currency row (in-memory reference, not a copy). */
export function getAllMoedas(): readonly Moeda[] {
  return moedas;
}

/** @deprecated Use {@link getAllMoedas} instead. Removed in v2.0. */
export function getMoedas(): readonly Moeda[] {
  return getAllMoedas();
}

export function lookupMoedaPorCodigo(codigo: string): LookupResult<Moeda> {
  return resolveStringCodeLookup({
    input: codigo,
    entityLabel: 'Currency',
    normalize: normalizeCodigo,
    isValidNormalized: (normalized) => /^[A-Z]{3}$/.test(normalized),
    invalidFormatMessage: 'Currency code must be 3 uppercase letters (ISO 4217)',
    find: (normalized) => moedas.find((moeda) => moeda.codigo === normalized),
  });
}

export function getMoedaPorCodigo(codigo: string): Moeda | undefined {
  return unwrapLookupValue(lookupMoedaPorCodigo(codigo));
}

export function searchMoedas(query: string, options?: { limit?: number }): readonly Moeda[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Moeda[] = [];

  for (const moeda of moedas) {
    const matchesNome = moeda.nome.toLowerCase().includes(normalizedQuery);
    const matchesCodigo = moeda.codigo.toLowerCase().includes(normalizedQuery);
    if (matchesNome || matchesCodigo) {
      results.push(moeda);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
