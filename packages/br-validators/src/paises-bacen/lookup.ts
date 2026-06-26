/**
 * NF-e Bacen country code lookup — offline embedded data from official NF-e table.
 * @see docs/OFFICIAL-SOURCES.md#paises-bacen
 */

import paisesData from './data/paises.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { PaisBacen } from './types.js';

const paises: readonly PaisBacen[] = paisesData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(4, '0').slice(-4);
}

/** Returns every embedded NF-e Bacen country row (in-memory reference, not a copy). */
export function getAllPaisesBacen(): readonly PaisBacen[] {
  return paises;
}

/** @deprecated Use {@link getAllPaisesBacen} instead. Removed in v2.0. */
export function getPaisesBacen(): readonly PaisBacen[] {
  return getAllPaisesBacen();
}

export function lookupPaisPorCodigoBacen(codigo: string): LookupResult<PaisBacen> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'Bacen country',
    normalize: normalizeCodigo,
    expectedLength: 4,
    lengthLabel: '4 digits',
    find: (normalized) => paises.find((pais) => pais.codigo === normalized),
  });
}

export function getPaisPorCodigoBacen(codigo: string): PaisBacen | undefined {
  return unwrapLookupValue(lookupPaisPorCodigoBacen(codigo));
}
