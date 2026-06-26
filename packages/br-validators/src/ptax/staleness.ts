/**
 * PTAX embed staleness — business-day age vs Brazil local today.
 * @see docs/OFFICIAL-SOURCES.md#ptax-cotacoes
 */

import { isFeriadoNacional } from '../feriados/calendar.js';
import {
  addUtcDays,
  formatIsoDate,
  isWeekendUtc,
  parseIsoDateString,
} from '../feriados/date-utils.js';
import { PTAX_STALE_WARNING } from './constants.js';
import type { PtaxCotacao, PtaxCotacaoResult, PtaxLookupOptions } from './types.js';

function isDiaUtil(isoDate: string): boolean {
  const parts = parseIsoDateString(isoDate);
  if (parts === null) {
    return false;
  }
  return !isWeekendUtc(parts) && !isFeriadoNacional(isoDate);
}

export function isBrazilBusinessDay(isoDate: string): boolean {
  return isDiaUtil(isoDate);
}

export function getBrazilTodayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}

export function subtractBusinessDays(fromIso: string, businessDays: number): string {
  if (businessDays < 1) {
    return fromIso;
  }

  const start = parseIsoDateString(fromIso);
  if (start === null) {
    return '';
  }

  let cursor = start;
  let remaining = businessDays;
  const maxIterations = businessDays * 4 + 14;

  for (let iteration = 0; iteration < maxIterations && remaining > 0; iteration += 1) {
    cursor = addUtcDays(cursor, -1);
    const iso = formatIsoDate(cursor);
    if (isDiaUtil(iso)) {
      remaining -= 1;
    }
  }

  return formatIsoDate(cursor);
}

export function isPtaxCotacaoStale(dataReferencia: string, asOfDate: string): boolean {
  const reference = parseIsoDateString(dataReferencia);
  const asOf = parseIsoDateString(asOfDate);
  if (reference === null || asOf === null) {
    return false;
  }

  const previousBusinessDay = subtractBusinessDays(asOfDate, 1);
  return dataReferencia < previousBusinessDay;
}

export function buildPtaxCotacaoResult(
  cotacao: PtaxCotacao,
  options?: PtaxLookupOptions,
): PtaxCotacaoResult {
  const asOfDate = options?.asOfDate ?? getBrazilTodayIso();
  const dataReferencia = cotacao.data;
  const isStale = isPtaxCotacaoStale(dataReferencia, asOfDate);

  return {
    ...cotacao,
    dataReferencia,
    isStale,
    ...(isStale ? { warning: PTAX_STALE_WARNING } : {}),
  };
}
