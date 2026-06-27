/**
 * eSocial Tabela 03 — payroll rubric nature codes — offline embedded data from official layout tables.
 * @see https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html
 */

import rubricasData from './data/rubricas.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { EsocialRubrica } from './types.js';

const rubricas: readonly EsocialRubrica[] = rubricasData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(4, '0').slice(-4);
}

/** Returns every eSocial Tabela 03 rubrica (in-memory reference, not a copy). */
export function getAllEsocialRubricas(): readonly EsocialRubrica[] {
  return rubricas;
}

export function lookupEsocialRubricaPorCodigo(codigo: string): LookupResult<EsocialRubrica> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'eSocial payroll rubric',
    normalize: normalizeCodigo,
    expectedLength: 4,
    lengthLabel: '4 digits',
    find: (normalized) => rubricas.find((entry) => entry.codigo === normalized),
  });
}

export function getEsocialRubricaPorCodigo(codigo: string): EsocialRubrica | undefined {
  return unwrapLookupValue(lookupEsocialRubricaPorCodigo(codigo));
}

export function searchEsocialRubricas(
  query: string,
  options?: { limit?: number },
): readonly EsocialRubrica[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: EsocialRubrica[] = [];

  for (const entry of rubricas) {
    const haystack = `${entry.codigo} ${entry.natureza} ${entry.descricao}`.toLowerCase();
    if (haystack.includes(normalizedQuery)) {
      results.push(entry);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
