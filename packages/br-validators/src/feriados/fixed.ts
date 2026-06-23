/**
 * Fixed national federal holidays — Lei 662/1949 (consolidated by Lei 10.607/2002) and amendments.
 * @see https://www.planalto.gov.br/ccivil_03/leis/l0662.htm
 * @see https://www.planalto.gov.br/ccivil_03/leis/l10607.htm
 */

import { formatIsoDate } from './date-utils.js';
import type { FeriadoNacional, ParsedUtcDate } from './types.js';

export const FERIADOS_LEI_662_URL = 'https://www.planalto.gov.br/ccivil_03/leis/l0662.htm';
export const FERIADOS_LEI_10007_URL = 'https://www.planalto.gov.br/ccivil_03/leis/l10607.htm';
export const FERIADOS_LEI_6802_URL = 'https://www.planalto.gov.br/ccivil_03/leis/l6802.htm';
export const FERIADOS_LEI_14759_URL =
  'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/L14759.htm';

export const CONSCIENCIA_NEGRA_MIN_YEAR = 2024;

interface FixedHolidayTemplate {
  month: number;
  day: number;
  nome: string;
  baseLegal: string;
  activeFromYear?: number;
}

const FIXED_HOLIDAY_TEMPLATES: readonly FixedHolidayTemplate[] = [
  { month: 1, day: 1, nome: 'Confraternização Universal', baseLegal: 'Lei 662/1949' },
  { month: 4, day: 21, nome: 'Tiradentes', baseLegal: 'Lei 662/1949' },
  { month: 5, day: 1, nome: 'Dia do Trabalho', baseLegal: 'Lei 662/1949' },
  { month: 9, day: 7, nome: 'Independência do Brasil', baseLegal: 'Lei 662/1949' },
  { month: 10, day: 12, nome: 'Nossa Senhora Aparecida', baseLegal: 'Lei 6.802/1980' },
  { month: 11, day: 2, nome: 'Finados', baseLegal: 'Lei 662/1949' },
  { month: 11, day: 15, nome: 'Proclamação da República', baseLegal: 'Lei 662/1949' },
  {
    month: 11,
    day: 20,
    nome: 'Dia Nacional de Zumbi e da Consciência Negra',
    baseLegal: 'Lei 14.759/2023',
    activeFromYear: CONSCIENCIA_NEGRA_MIN_YEAR,
  },
  { month: 12, day: 25, nome: 'Natal', baseLegal: 'Lei 662/1949' },
];

export function getFixedHolidaysForYear(year: number): FeriadoNacional[] {
  const holidays: FeriadoNacional[] = [];
  for (const template of FIXED_HOLIDAY_TEMPLATES) {
    if (template.activeFromYear !== undefined && year < template.activeFromYear) {
      continue;
    }
    const parts: ParsedUtcDate = { year, month: template.month, day: template.day };
    holidays.push({
      data: formatIsoDate(parts),
      nome: template.nome,
      tipo: 'fixo',
      baseLegal: template.baseLegal,
    });
  }
  return holidays;
}

export function isFixedHoliday(parts: ParsedUtcDate): boolean {
  return getFixedHolidaysForYear(parts.year).some((holiday) => holiday.data === formatIsoDate(parts));
}
