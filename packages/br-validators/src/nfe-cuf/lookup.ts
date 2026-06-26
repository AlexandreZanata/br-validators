/**
 * NF-e cUF lookup — SEFAZ federative unit codes (distinct semantics from IBGE locality API).
 * @see http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Il8k4BIjb48=
 */

import cufData from './data/cuf.json';
import { resolveStringCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { NfeCuf } from './types.js';

const cufRows: readonly NfeCuf[] = cufData;

const byCodigo = new Map(cufRows.map((row) => [row.codigo, row]));
const byUf = new Map(cufRows.map((row) => [row.uf, row]));

function normalizeCodigo(input: string): string {
  return input.replace(/\D/g, '');
}

function normalizeUf(input: string): string {
  return input.trim().toUpperCase();
}

/** Returns every embedded NF-e cUF row (in-memory reference, not a copy). */
export function getAllCuf(): readonly NfeCuf[] {
  return cufRows;
}

/** @deprecated Use {@link getAllCuf} instead. Removed in v2.0. */
export function getCufs(): readonly NfeCuf[] {
  return getAllCuf();
}

export function lookupCufPorCodigo(codigo: string): LookupResult<NfeCuf> {
  return resolveStringCodeLookup({
    input: codigo,
    entityLabel: 'NF-e cUF',
    normalize: normalizeCodigo,
    isValidNormalized: (normalized) => /^\d{2}$/.test(normalized),
    invalidFormatMessage: 'NF-e cUF code must have 2 digits after normalization',
    find: (normalized) => byCodigo.get(normalized),
  });
}

export function getCufPorCodigo(codigo: string): NfeCuf | undefined {
  return unwrapLookupValue(lookupCufPorCodigo(codigo));
}

export function getCufPorUf(uf: string): NfeCuf | undefined {
  const normalized = normalizeUf(uf);
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return undefined;
  }
  return byUf.get(normalized);
}
