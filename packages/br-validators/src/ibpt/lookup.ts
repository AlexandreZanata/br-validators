/**
 * IBPT approximate tax burden lookup — offline golden subset (NCM × UF).
 * @see https://deolhonoimposto.ibpt.org.br/
 */

import cargasData from './data/cargas.json';
import { IBPT_UF_SIGLA_SET } from './constants.js';
import {
  lookupFound,
  lookupInvalidFormat,
  lookupInvalidInput,
  lookupNotFound,
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { IbptCargaLookup, IbptCargaTributaria } from './types.js';

const cargas: readonly IbptCargaTributaria[] = cargasData;

function normalizeNcm(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(8, '0').slice(-8);
}

function normalizeUf(uf: string): string {
  return uf.trim().toUpperCase();
}

function normalizeExcecao(excecao: string | undefined): string {
  return (excecao ?? '').trim();
}

function buildLookupKey(ncm: string, uf: string, excecao: string): string {
  return `${uf}:${ncm}:${excecao}`;
}

const cargasByKey = new Map<string, IbptCargaTributaria>(
  cargas.map((carga) => [buildLookupKey(carga.ncm, carga.uf, carga.excecao), carga]),
);

/** Returns every embedded IBPT carga row (in-memory reference, not a copy). */
export function getAllIbptCargas(): readonly IbptCargaTributaria[] {
  return cargas;
}

/** @deprecated Use {@link getAllIbptCargas} instead. Removed in v2.0. */
export function getIbptCargas(): readonly IbptCargaTributaria[] {
  return getAllIbptCargas();
}

export function lookupIbptCargaPorNcmUf(options: {
  ncm: string;
  uf: string;
  excecao?: string;
}): LookupResult<IbptCargaLookup> {
  const trimmedNcm = options.ncm.trim();
  const trimmedUf = options.uf.trim();
  if (trimmedNcm.length === 0 || trimmedUf.length === 0) {
    return lookupInvalidInput('NCM and UF are required');
  }

  const ncm = normalizeNcm(options.ncm);
  const uf = normalizeUf(options.uf);
  const excecao = normalizeExcecao(options.excecao);

  if (ncm.length !== 8) {
    return lookupInvalidFormat('NCM code must have 8 digits after normalization');
  }
  if (!IBPT_UF_SIGLA_SET.has(uf)) {
    return lookupInvalidFormat('UF must be a valid Brazilian state code');
  }

  const found = cargasByKey.get(buildLookupKey(ncm, uf, excecao));
  if (found === undefined) {
    return lookupNotFound(`IBPT carga for NCM ${ncm} / UF ${uf} not in embedded table`);
  }

  return lookupFound(found);
}

export function getIbptCargaPorNcmUf(options: {
  ncm: string;
  uf: string;
  excecao?: string;
}): IbptCargaLookup | undefined {
  return unwrapLookupValue(lookupIbptCargaPorNcmUf(options));
}

export function computeIbptCargaTotal(
  carga: IbptCargaTributaria,
  options: { importado: boolean },
): number {
  const federal = options.importado
    ? carga.aliquotaImportadosFederal
    : carga.aliquotaNacionalFederal;
  const total = federal + carga.aliquotaEstadual + carga.aliquotaMunicipal;
  return Math.round(total * 100) / 100;
}

export function getIbptTabelaAtual(): string | undefined {
  return cargas[0]?.tabela;
}
