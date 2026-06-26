/**
 * eSocial Tabela 01 — worker categories — offline embedded data from official layout tables.
 * @see https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html
 */

import categoriasData from './data/categorias.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { EsocialCategoriaTrabalhador } from './types.js';

const categorias: readonly EsocialCategoriaTrabalhador[] = categoriasData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(3, '0').slice(-3);
}

/** Returns every eSocial Tabela 01 category (in-memory reference, not a copy). */
export function getAllEsocialCategorias(): readonly EsocialCategoriaTrabalhador[] {
  return categorias;
}

/** @deprecated Use {@link getAllEsocialCategorias} instead. Removed in v2.0. */
export function getEsocialCategorias(): readonly EsocialCategoriaTrabalhador[] {
  return getAllEsocialCategorias();
}

export function lookupEsocialCategoriaPorCodigo(
  codigo: string,
): LookupResult<EsocialCategoriaTrabalhador> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'eSocial worker category',
    normalize: normalizeCodigo,
    expectedLength: 3,
    lengthLabel: '3 digits',
    find: (normalized) => categorias.find((entry) => entry.codigo === normalized),
  });
}

export function getEsocialCategoriaPorCodigo(
  codigo: string,
): EsocialCategoriaTrabalhador | undefined {
  return unwrapLookupValue(lookupEsocialCategoriaPorCodigo(codigo));
}

export function searchEsocialCategorias(
  query: string,
  options?: { limit?: number },
): readonly EsocialCategoriaTrabalhador[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: EsocialCategoriaTrabalhador[] = [];

  for (const entry of categorias) {
    const haystack = `${entry.codigo} ${entry.grupo} ${entry.descricao}`.toLowerCase();
    if (haystack.includes(normalizedQuery)) {
      results.push(entry);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
