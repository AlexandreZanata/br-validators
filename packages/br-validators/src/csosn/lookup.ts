/**
 * CONFAZ CSOSN lookup — offline embedded data from Ajuste SINIEF 03/10.
 * @see https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/a03_10
 */

import csosnData from './data/csosn.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Csosn } from './types.js';

const csosnRows: readonly Csosn[] = csosnData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(3, '0').slice(-3);
}

/** Returns every embedded CSOSN row (in-memory reference, not a copy). */
export function getAllCsosn(): readonly Csosn[] {
  return csosnRows;
}

export function lookupCsosnPorCodigo(codigo: string): LookupResult<Csosn> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'CSOSN',
    normalize: normalizeCodigo,
    expectedLength: 3,
    lengthLabel: '3 digits',
    find: (normalized) => csosnRows.find((row) => row.codigo === normalized),
  });
}

export function getCsosnPorCodigo(codigo: string): Csosn | undefined {
  return unwrapLookupValue(lookupCsosnPorCodigo(codigo));
}

export function searchCsosn(query: string, options?: { limit?: number }): readonly Csosn[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Csosn[] = [];

  for (const row of csosnRows) {
    if (row.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(row);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
