/**
 * LC 116/2003 ISS service list — offline embedded data from federal publications.
 * @see https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm
 */

import lc116Data from './data/lc116.json';
import { resolveStringCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Lc116 } from './types.js';

const items: readonly Lc116[] = lc116Data;

function normalizeCodigo(codigo: string): string {
  const trimmed = codigo.trim();
  const dotted = /^(\d{1,2})\.(\d{1,2})$/u.exec(trimmed);
  if (dotted !== null) {
    const item = String(Number.parseInt(dotted[1], 10));
    const sub = dotted[2].padStart(2, '0');
    return `${item}.${sub}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 6) {
    const item = String(Number.parseInt(digits.slice(0, 2), 10));
    const sub = digits.slice(2, 4);
    return `${item}.${sub}`;
  }

  return '';
}

/** Returns every embedded LC 116 service item (in-memory reference, not a copy). */
export function getAllLc116(): readonly Lc116[] {
  return items;
}

/** @deprecated Use {@link getAllLc116} instead. Removed in v2.0. */
export function getLc116List(): readonly Lc116[] {
  return getAllLc116();
}

export function lookupLc116PorCodigo(codigo: string): LookupResult<Lc116> {
  return resolveStringCodeLookup({
    input: codigo,
    entityLabel: 'LC 116',
    normalize: normalizeCodigo,
    isValidNormalized: (normalized) => normalized.length > 0,
    invalidFormatMessage: 'LC 116 code must be item.subitem (e.g. 1.01 or 010101)',
    find: (normalized) => items.find((entry) => entry.codigo === normalized),
  });
}

export function getLc116PorCodigo(codigo: string): Lc116 | undefined {
  return unwrapLookupValue(lookupLc116PorCodigo(codigo));
}

export function searchLc116(query: string, options?: { limit?: number }): readonly Lc116[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: Lc116[] = [];

  for (const entry of items) {
    if (entry.descricao.toLowerCase().includes(normalizedQuery)) {
      results.push(entry);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
