/**
 * CONFAZ CEST lookup — offline embedded data from Convênio ICMS 142/2018 annex tables.
 * @see https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18
 */

import cestData from './data/cest.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Cest } from './types.js';

const cests: readonly Cest[] = cestData;

function normalizeCestCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(7, '0').slice(-7);
}

function normalizeNcm(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(8, '0').slice(0, 8);
}

/** Returns every embedded CEST row (in-memory reference, not a copy). */
export function getAllCest(): readonly Cest[] {
  return cests;
}

/** @deprecated Use {@link getAllCest} instead. Removed in v2.0. */
export function getCests(): readonly Cest[] {
  return getAllCest();
}

export function lookupCestPorCodigo(codigo: string): LookupResult<Cest> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'CEST',
    normalize: normalizeCestCodigo,
    expectedLength: 7,
    lengthLabel: '7 digits',
    find: (normalized) => cests.find((cest) => cest.codigo === normalized),
  });
}

export function getCestPorCodigo(codigo: string): Cest | undefined {
  return unwrapLookupValue(lookupCestPorCodigo(codigo));
}

export function searchCest(query: string, options?: { limit?: number }): readonly Cest[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Cest[] = [];

  for (const cest of cests) {
    if (cest.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(cest);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}

export function getCestPorNcm(ncm: string): readonly Cest[] {
  const normalizedNcm = normalizeNcm(ncm);
  if (normalizedNcm.length !== 8) {
    return [];
  }

  const results: Cest[] = [];
  for (const cest of cests) {
    if (cest.ncms.some((prefix) => prefix.length > 0 && normalizedNcm.startsWith(prefix))) {
      results.push(cest);
    }
  }

  return results;
}
