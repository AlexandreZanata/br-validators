/**
 * Movable national federal holiday — Paixão de Cristo (Sexta-feira Santa).
 * Listed as feriado nacional in the annual MGI federal calendar (e.g. Portaria 11.460/2025).
 * @see https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026
 */

import { addUtcDays, easterSunday, formatIsoDate } from './date-utils.js';
import type { FeriadoNacional, ParsedUtcDate } from './types.js';

export const GOOD_FRIDAY_OFFSET_DAYS = -2;
export const FERIADOS_PORTARIA_MGI_11460_2025_URL =
  'https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026';

export function getPaixaoDeCristo(year: number): FeriadoNacional | null {
  if (!Number.isInteger(year)) {
    return null;
  }
  const easter = easterSunday(year);
  const parts = addUtcDays(easter, GOOD_FRIDAY_OFFSET_DAYS);
  return {
    data: formatIsoDate(parts),
    nome: 'Paixão de Cristo',
    tipo: 'movel',
    baseLegal: 'Calendário oficial — administração pública federal (Portaria MGI)',
  };
}

export function isPaixaoDeCristo(parts: ParsedUtcDate): boolean {
  const holiday = getPaixaoDeCristo(parts.year);
  return holiday?.data === formatIsoDate(parts);
}
