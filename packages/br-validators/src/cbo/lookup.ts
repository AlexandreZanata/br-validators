/**
 * CBO 2002 occupation lookup — offline embedded data from official MTE CSV.
 * @see https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads
 */

import cboData from './data/cbo.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Cbo } from './types.js';

const cbos: readonly Cbo[] = cboData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(6, '0').slice(-6);
}

/** Returns every embedded CBO occupation (in-memory reference, not a copy). */
export function getAllCbo(): readonly Cbo[] {
  return cbos;
}

/** @deprecated Use {@link getAllCbo} instead. Removed in v2.0. */
export function getCbos(): readonly Cbo[] {
  return getAllCbo();
}

export function lookupCboPorCodigo(codigo: string): LookupResult<Cbo> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'CBO',
    normalize: normalizeCodigo,
    expectedLength: 6,
    lengthLabel: '6 digits',
    find: (normalized) => cbos.find((cbo) => cbo.codigo === normalized),
  });
}

export function getCboPorCodigo(codigo: string): Cbo | undefined {
  return unwrapLookupValue(lookupCboPorCodigo(codigo));
}

export function searchCbo(query: string, options?: { limit?: number }): readonly Cbo[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Cbo[] = [];

  for (const cbo of cbos) {
    if (cbo.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(cbo);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
