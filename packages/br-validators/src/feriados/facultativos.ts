/**
 * Federal facultative days (pontos facultativos) per annual MGI portaria.
 * NOT national holidays — Paixão de Cristo is excluded (see movable-national.ts).
 * @see https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026
 */

import portariaExtras from './data/portaria-extras.json';
import { addUtcDays, easterSunday, formatIsoDate } from './date-utils.js';
import type { ParsedUtcDate, PontoFacultativoFederal } from './types.js';

export const FERIADOS_LEI_9093_URL = 'https://www.planalto.gov.br/ccivil_03/leis/l9093.htm';
export const FERIADOS_GOV_CALENDARIO_URL =
  'https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026';

export const CARNIVAL_MONDAY_OFFSET_DAYS = -48;
export const CARNIVAL_TUESDAY_OFFSET_DAYS = -47;
export const ASH_WEDNESDAY_OFFSET_DAYS = -46;
export const CORPUS_CHRISTI_OFFSET_DAYS = 60;

const PORTARIA_BASE_LEGAL = 'Portaria MGI — calendário oficial da administração pública federal';

interface EasterFacultativoTemplate {
  offsetDays: number;
  nome: string;
  horarioParcial?: PontoFacultativoFederal['horarioParcial'];
}

interface FixedFacultativoTemplate {
  month: number;
  day: number;
  nome: string;
  horarioParcial?: PontoFacultativoFederal['horarioParcial'];
}

const EASTER_FACULTATIVOS: readonly EasterFacultativoTemplate[] = [
  { offsetDays: CARNIVAL_MONDAY_OFFSET_DAYS, nome: 'Carnaval' },
  { offsetDays: CARNIVAL_TUESDAY_OFFSET_DAYS, nome: 'Carnaval' },
  {
    offsetDays: ASH_WEDNESDAY_OFFSET_DAYS,
    nome: 'Quarta-Feira de Cinzas',
    horarioParcial: 'until 14:00',
  },
  { offsetDays: CORPUS_CHRISTI_OFFSET_DAYS, nome: 'Corpus Christi' },
];

const FIXED_FACULTATIVOS: readonly FixedFacultativoTemplate[] = [
  { month: 10, day: 28, nome: 'Dia do Servidor Público federal' },
  { month: 12, day: 24, nome: 'Véspera do Natal', horarioParcial: 'after 13:00' },
  { month: 12, day: 31, nome: 'Véspera do Ano Novo', horarioParcial: 'after 13:00' },
];

const PORTARIA_EXTRAS_BY_YEAR = portariaExtras as Record<
  string,
  readonly Omit<PontoFacultativoFederal, 'horarioParcial'>[]
>;

function getEasterFacultativos(year: number): PontoFacultativoFederal[] {
  const easter = easterSunday(year);
  return EASTER_FACULTATIVOS.map((template) => {
    const parts = addUtcDays(easter, template.offsetDays);
    return {
      data: formatIsoDate(parts),
      nome: template.nome,
      baseLegal: PORTARIA_BASE_LEGAL,
      ...(template.horarioParcial === undefined ? {} : { horarioParcial: template.horarioParcial }),
    };
  });
}

function getFixedFacultativos(year: number): PontoFacultativoFederal[] {
  return FIXED_FACULTATIVOS.map((template) => ({
    data: formatIsoDate({ year, month: template.month, day: template.day }),
    nome: template.nome,
    baseLegal: PORTARIA_BASE_LEGAL,
    ...(template.horarioParcial === undefined ? {} : { horarioParcial: template.horarioParcial }),
  }));
}

function getPortariaExtras(year: number): readonly PontoFacultativoFederal[] {
  return PORTARIA_EXTRAS_BY_YEAR[String(year)] ?? [];
}

export function getPontosFacultativosFederais(year: number): readonly PontoFacultativoFederal[] {
  if (!Number.isInteger(year)) {
    return [];
  }
  const pontos = [
    ...getEasterFacultativos(year),
    ...getFixedFacultativos(year),
    ...getPortariaExtras(year),
  ];
  return pontos.sort((left, right) => left.data.localeCompare(right.data));
}

export function isPontoFacultativoFederal(parts: ParsedUtcDate): boolean {
  return getPontosFacultativosFederais(parts.year).some(
    (ponto) => ponto.data === formatIsoDate(parts),
  );
}
