/**
 * IBGE CNAE 2.3 subclass lookup — offline embedded data from official IBGE API.
 * @see https://servicodados.ibge.gov.br/api/docs/cnae
 */

import cnaesData from './data/cnaes.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Cnae } from './types.js';

const cnaes: readonly Cnae[] = cnaesData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(7, '0').slice(-7);
}

/** Returns every embedded CNAE subclass (in-memory reference, not a copy). */
export function getAllCnae(): readonly Cnae[] {
  return cnaes;
}

/** @deprecated Use {@link getAllCnae} instead. Removed in v2.0. */
export function getCnaes(): readonly Cnae[] {
  return getAllCnae();
}

export function lookupCnaePorCodigo(codigo: string): LookupResult<Cnae> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'CNAE',
    normalize: normalizeCodigo,
    expectedLength: 7,
    lengthLabel: '7 digits',
    find: (normalized) => cnaes.find((cnae) => cnae.codigo === normalized),
  });
}

export function getCnaePorCodigo(codigo: string): Cnae | undefined {
  return unwrapLookupValue(lookupCnaePorCodigo(codigo));
}

export function searchCnaes(query: string, options?: { limit?: number }): readonly Cnae[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Cnae[] = [];

  for (const cnae of cnaes) {
    if (cnae.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(cnae);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
