/**
 * Brazilian national federal holidays — Lei 662/1949 (fixed) + Paixão de Cristo (movable, MGI calendar).
 * Does NOT include pontos facultativos (Carnaval, Corpus Christi, etc.).
 * @see https://www.planalto.gov.br/ccivil_03/leis/l0662.htm
 * @see https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026
 */

import {
  addUtcDays,
  formatIsoDate,
  isWeekendUtc,
  parseDateInput,
} from './date-utils.js';
import { getFixedHolidaysForYear, isFixedHoliday } from './fixed.js';
import { getPaixaoDeCristo, isPaixaoDeCristo } from './movable-national.js';
import type { FeriadoNacional } from './types.js';

export function isFeriadoNacional(input: string | Date): boolean {
  const parts = parseDateInput(input);
  if (parts === null) {
    return false;
  }
  return isFixedHoliday(parts) || isPaixaoDeCristo(parts);
}

/** Returns every national federal holiday for a calendar year (in-memory reference, not a copy). */
export function getAllFeriados(year: number): readonly FeriadoNacional[] {
  if (!Number.isInteger(year)) {
    return [];
  }
  const holidays: FeriadoNacional[] = [...getFixedHolidaysForYear(year)];
  const paixao = getPaixaoDeCristo(year);
  if (paixao !== null) {
    holidays.push(paixao);
  }
  return holidays.sort((left, right) => left.data.localeCompare(right.data));
}

/** @deprecated Use {@link getAllFeriados} instead. Removed in v2.0. */
export function getFeriadosNacionais(year: number): readonly FeriadoNacional[] {
  return getAllFeriados(year);
}

export function getProximoDiaUtil(input: string | Date): string {
  const parts = parseDateInput(input);
  if (parts === null) {
    return '';
  }

  let cursor = addUtcDays(parts, 1);
  while (isWeekendUtc(cursor) || isFeriadoNacional(formatIsoDate(cursor))) {
    cursor = addUtcDays(cursor, 1);
  }
  return formatIsoDate(cursor);
}
