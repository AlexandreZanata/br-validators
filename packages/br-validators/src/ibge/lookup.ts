/**
 * IBGE locality lookup — offline embedded data from official IBGE API.
 * @see https://servicodados.ibge.gov.br/api/docs/localidades
 */

import { IBGE_UF_SIGLA_SET } from './constants.js';
import estadosData from './data/estados.json';
import municipiosData from './data/municipios.json';
import { resolvePositiveIntegerLookup } from '../lookup/resolve.js';
import {
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { Estado, Municipio } from './types.js';

const estados: readonly Estado[] = estadosData;
const municipios: readonly Municipio[] = municipiosData;

/** Returns every embedded IBGE state row (in-memory reference, not a copy). */
export function getAllEstados(): readonly Estado[] {
  return estados;
}

/** @deprecated Use {@link getAllEstados} instead. Removed in v2.0. */
export function getEstados(): readonly Estado[] {
  return getAllEstados();
}

/** Returns embedded IBGE municipalities, optionally filtered by UF (in-memory reference, not a copy). */
export function getAllMunicipios(options?: { uf?: string }): readonly Municipio[] {
  const uf = options?.uf;
  if (uf === undefined || uf === '') {
    return municipios;
  }

  const normalized = uf.toUpperCase();
  if (!IBGE_UF_SIGLA_SET.has(normalized)) {
    return [];
  }

  return municipios.filter((municipio) => municipio.uf === normalized);
}

/** @deprecated Use {@link getAllMunicipios} instead. Removed in v2.0. */
export function getMunicipios(options?: { uf?: string }): readonly Municipio[] {
  return getAllMunicipios(options);
}

export function lookupMunicipioPorCodigo(codigo: number): LookupResult<Municipio> {
  return resolvePositiveIntegerLookup({
    value: codigo,
    entityLabel: 'IBGE municipality',
    find: (value) => municipios.find((municipio) => municipio.codigo === value),
  });
}

export function getMunicipioPorCodigo(codigo: number): Municipio | undefined {
  return unwrapLookupValue(lookupMunicipioPorCodigo(codigo));
}
