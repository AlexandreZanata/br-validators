/**
 * Bacen PTAX Fechamento — offline embedded exchange rates.
 * @see https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3
 */

import ptaxData from './data/ptax.json';
import { buildPtaxCotacaoResult } from './staleness.js';
import type { PtaxCotacao, PtaxCotacaoResult, PtaxLookupOptions } from './types.js';

const cotacoes: readonly PtaxCotacao[] = ptaxData as PtaxCotacao[];

function normalizeMoeda(moeda: string): string {
  const normalized = moeda.trim().toUpperCase();
  return /^[A-Z]{3}$/u.test(normalized) ? normalized : '';
}

function normalizeData(data: string): string {
  const trimmed = data.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(trimmed);
  if (isoMatch !== null) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const bacenMatch = /^(\d{2})-(\d{2})-(\d{4})$/u.exec(trimmed);
  if (bacenMatch !== null) {
    return `${bacenMatch[3]}-${bacenMatch[1]}-${bacenMatch[2]}`;
  }

  return '';
}

function compareByDateDesc(left: PtaxCotacao, right: PtaxCotacao): number {
  return right.data.localeCompare(left.data);
}

export function pickLatestPtaxCotacao(
  items: readonly PtaxCotacao[],
  moeda: string,
): PtaxCotacao | undefined {
  const normalizedMoeda = normalizeMoeda(moeda);
  if (normalizedMoeda.length === 0) {
    return undefined;
  }

  const matches = items.filter((entry) => entry.moeda === normalizedMoeda);
  if (matches.length === 0) {
    return undefined;
  }

  return [...matches].sort(compareByDateDesc)[0];
}

export function getPtaxList(): readonly PtaxCotacao[] {
  return cotacoes;
}

export function getPtaxCotacoesPorMoeda(moeda: string): readonly PtaxCotacao[] {
  const normalizedMoeda = normalizeMoeda(moeda);
  if (normalizedMoeda.length === 0) {
    return [];
  }

  return cotacoes
    .filter((entry) => entry.moeda === normalizedMoeda)
    .sort(compareByDateDesc);
}

function resolvePtaxCotacao(
  moeda: string,
  data?: string,
): PtaxCotacao | undefined {
  const normalizedMoeda = normalizeMoeda(moeda);
  if (normalizedMoeda.length === 0) {
    return undefined;
  }

  if (data === undefined) {
    return pickLatestPtaxCotacao(cotacoes, normalizedMoeda);
  }

  const normalizedData = normalizeData(data);
  if (normalizedData.length === 0) {
    return undefined;
  }

  return cotacoes.find(
    (entry) => entry.moeda === normalizedMoeda && entry.data === normalizedData,
  );
}

export function getPtaxCotacao(
  moeda: string,
  data?: string,
  options?: PtaxLookupOptions,
): PtaxCotacaoResult | undefined {
  const cotacao = resolvePtaxCotacao(moeda, data);
  if (cotacao === undefined) {
    return undefined;
  }
  return buildPtaxCotacaoResult(cotacao, options);
}

export function getPtaxUltimoDiaUtil(
  moeda: string,
  options?: PtaxLookupOptions,
): PtaxCotacaoResult | undefined {
  const cotacao = pickLatestPtaxCotacao(cotacoes, moeda);
  if (cotacao === undefined) {
    return undefined;
  }
  return buildPtaxCotacaoResult(cotacao, options);
}
