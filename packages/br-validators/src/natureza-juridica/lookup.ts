/**
 * RFB CNPJ natureza jurídica lookup — offline embedded data from official open-data CSV.
 * @see https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/
 */

import naturezasData from './data/naturezas.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { NaturezaJuridica } from './types.js';

const naturezas: readonly NaturezaJuridica[] = naturezasData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(4, '0').slice(-4);
}

/** Returns every embedded natureza jurídica row (in-memory reference, not a copy). */
export function getAllNaturezaJuridica(): readonly NaturezaJuridica[] {
  return naturezas;
}

/** @deprecated Use {@link getAllNaturezaJuridica} instead. Removed in v2.0. */
export function getNaturezasJuridicas(): readonly NaturezaJuridica[] {
  return getAllNaturezaJuridica();
}

export function lookupNaturezaJuridicaPorCodigo(codigo: string): LookupResult<NaturezaJuridica> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'Legal nature',
    normalize: normalizeCodigo,
    expectedLength: 4,
    lengthLabel: '4 digits',
    find: (normalized) => naturezas.find((natureza) => natureza.codigo === normalized),
  });
}

export function getNaturezaJuridicaPorCodigo(codigo: string): NaturezaJuridica | undefined {
  return unwrapLookupValue(lookupNaturezaJuridicaPorCodigo(codigo));
}
