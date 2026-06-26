/**
 * TSE ↔ IBGE municipality cross-walk — offline embedded data from official TSE open data.
 * @see docs/OFFICIAL-SOURCES.md#tse-municipios
 */

import mapeamentoData from './data/mapeamento.json';
import { resolveFixedLengthCodeLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { TseMunicipioMapping } from './types.js';

const mapeamento: readonly TseMunicipioMapping[] = mapeamentoData;

function normalizeCodigoTse(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(5, '0');
}

export function getMapeamentoTseIbge(): readonly TseMunicipioMapping[] {
  return mapeamento;
}

export function lookupMunicipioIbgePorCodigoTse(codigo: string): LookupResult<number> {
  return resolveFixedLengthCodeLookup({
    input: codigo,
    entityLabel: 'TSE municipality code',
    normalize: normalizeCodigoTse,
    expectedLength: 5,
    lengthLabel: '5 digits',
    find: (normalized) =>
      mapeamento.find((entry) => entry.codigoTse === normalized)?.ibgeCodigo,
  });
}

export function getMunicipioIbgePorCodigoTse(codigo: string): number | undefined {
  return unwrapLookupValue(lookupMunicipioIbgePorCodigoTse(codigo));
}

export function getCodigosTsePorMunicipio(ibgeCodigo: number): readonly string[] {
  if (!Number.isInteger(ibgeCodigo) || ibgeCodigo <= 0) {
    return [];
  }
  return mapeamento
    .filter((entry) => entry.ibgeCodigo === ibgeCodigo)
    .map((entry) => entry.codigoTse);
}
