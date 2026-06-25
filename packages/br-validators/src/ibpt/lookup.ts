/**
 * IBPT approximate tax burden lookup — offline golden subset (NCM × UF).
 * @see https://deolhonoimposto.ibpt.org.br/
 */

import cargasData from './data/cargas.json';
import { IBPT_UF_SIGLA_SET } from './constants.js';
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

export function getIbptCargas(): readonly IbptCargaTributaria[] {
  return cargas;
}

export function getIbptCargaPorNcmUf(options: {
  ncm: string;
  uf: string;
  excecao?: string;
}): IbptCargaLookup | undefined {
  const ncm = normalizeNcm(options.ncm);
  const uf = normalizeUf(options.uf);
  const excecao = normalizeExcecao(options.excecao);
  if (ncm.length !== 8 || !IBPT_UF_SIGLA_SET.has(uf)) {
    return undefined;
  }
  return cargasByKey.get(buildLookupKey(ncm, uf, excecao));
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
