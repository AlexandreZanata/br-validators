/**
 * Bacen SELIC meta (SGS 432) — offline embedded daily series.
 * @see https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json
 */

import selicData from './data/selic.json';
import { buildSelicMetaResult } from './staleness.js';
import type {
  SelicHistoricoRange,
  SelicLookupOptions,
  SelicMetaObservacao,
  SelicMetaResult,
} from './types.js';

const observacoes: readonly SelicMetaObservacao[] = selicData;

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

  const slashMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/u.exec(trimmed);
  if (slashMatch !== null) {
    return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
  }

  return '';
}

function compareByDateDesc(left: SelicMetaObservacao, right: SelicMetaObservacao): number {
  return right.data.localeCompare(left.data);
}

function compareByDateAsc(left: SelicMetaObservacao, right: SelicMetaObservacao): number {
  return left.data.localeCompare(right.data);
}

export function getSelicList(): readonly SelicMetaObservacao[] {
  return observacoes;
}

export function pickLatestSelicMeta(
  items: readonly SelicMetaObservacao[],
): SelicMetaObservacao | undefined {
  if (items.length === 0) {
    return undefined;
  }
  return [...items].sort(compareByDateDesc)[0];
}

function resolveSelicObservacao(data?: string): SelicMetaObservacao | undefined {
  if (data === undefined) {
    return pickLatestSelicMeta(observacoes);
  }

  const normalizedData = normalizeData(data);
  if (normalizedData.length === 0) {
    return undefined;
  }

  return observacoes.find((entry) => entry.data === normalizedData);
}

export function getSelicMeta(options?: SelicLookupOptions): SelicMetaResult | undefined {
  const observacao = resolveSelicObservacao();
  if (observacao === undefined) {
    return undefined;
  }
  return buildSelicMetaResult(observacao, options);
}

export function getSelicMetaPorData(
  isoDate: string,
  options?: SelicLookupOptions,
): SelicMetaResult | undefined {
  const observacao = resolveSelicObservacao(isoDate);
  if (observacao === undefined) {
    return undefined;
  }
  return buildSelicMetaResult(observacao, options);
}

export function getSelicHistorico(range: SelicHistoricoRange): readonly SelicMetaObservacao[] {
  const from = range.from === undefined ? '' : normalizeData(range.from);
  const to = range.to === undefined ? '' : normalizeData(range.to);

  if ((range.from !== undefined && from.length === 0) || (range.to !== undefined && to.length === 0)) {
    return [];
  }

  if (from.length > 0 && to.length > 0 && from > to) {
    return [];
  }

  return observacoes
    .filter((entry) => {
      if (from.length > 0 && entry.data < from) {
        return false;
      }
      if (to.length > 0 && entry.data > to) {
        return false;
      }
      return true;
    })
    .sort(compareByDateAsc);
}
