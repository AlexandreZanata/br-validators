/**
 * Bacen STR participant lookup — offline embedded data from official STR CSV.
 * @see https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv
 */

import bancosData from './data/bancos.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Banco } from './types.js';

const bancos: readonly Banco[] = bancosData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(3, '0').slice(-3);
}

function normalizeIspb(ispb: string): string {
  const digits = ispb.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(8, '0');
}

/** Returns every embedded Bacen STR participant (in-memory reference, not a copy). */
export function getAllBancos(): readonly Banco[] {
  return bancos;
}

/** @deprecated Use {@link getAllBancos} instead. Removed in v2.0. */
export function getBancos(): readonly Banco[] {
  return getAllBancos();
}

export function lookupBancoPorCodigo(codigo: string): LookupResult<Banco> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'Bank COMPE',
    normalize: normalizeCodigo,
    expectedLength: 3,
    lengthLabel: '3 digits',
    find: (normalized) => bancos.find((banco) => banco.codigo === normalized),
  });
}

export function lookupBancoPorIspb(ispb: string): LookupResult<Banco> {
  return resolveFixedLengthCodeLookup({
    input: ispb,
    entityLabel: 'Bank ISPB',
    normalize: normalizeIspb,
    expectedLength: 8,
    lengthLabel: '8 digits',
    find: (normalized) => bancos.find((banco) => banco.ispb === normalized),
  });
}

export function getBancoPorCodigo(codigo: string): Banco | undefined {
  return unwrapLookupValue(lookupBancoPorCodigo(codigo));
}

export function getBancoPorIspb(ispb: string): Banco | undefined {
  return unwrapLookupValue(lookupBancoPorIspb(ispb));
}
