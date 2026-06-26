import { describe, expect, it } from 'vitest';

import {
  CONSCIENCIA_NEGRA_MIN_YEAR,
  FERIADOS_DATA_VERSION,
  FERIADOS_FACULTATIVOS_FEDERAIS_COUNT,
  FERIADOS_FACULTATIVOS_RECORRENTES_COUNT,
  FERIADOS_FIXED_COUNT,
  FERIADOS_GOV_CALENDARIO_URL,
  FERIADOS_LEI_10007_URL,
  FERIADOS_LEI_14759_URL,
  FERIADOS_LEI_662_URL,
  FERIADOS_NACIONAL_TOTAL_COUNT,
  FERIADOS_PORTARIA_MGI_11460_2025_URL,
  easterSunday,
  getAllFeriados,
  getFixedHolidaysForYear,
  getPaixaoDeCristo,
  getPontosFacultativosFederais,
  getProximoDiaUtil,
  isFeriadoNacional,
  isPontoFacultativoFederal,
} from '../../../src/feriados/index.js';
import { formatIsoDate, parseIsoDateString } from '../../../src/feriados/date-utils.js';
import vectors from '../../vectors/feriados.official.json';

describe('Feriados — Easter golden dates (Meeus/Jones/Butcher)', () => {
  it('matches official Easter Sunday for 2024 leap year', () => {
    const easter = easterSunday(2024);
    expect(formatIsoDate(easter)).toBe(vectors.easterSunday['2024']);
  });

  it('matches official Easter Sunday for 2025–2027', () => {
    const years = [2025, 2026, 2027] as const;
    for (const year of years) {
      const easter = easterSunday(year);
      expect(formatIsoDate(easter)).toBe(vectors.easterSunday[year]);
    }
  });
});

describe('Feriados — Paixão de Cristo (movable national, MGI calendar)', () => {
  it('matches Good Friday golden dates for 2025–2027', () => {
    const years = [2025, 2026, 2027] as const;
    for (const year of years) {
      expect(getPaixaoDeCristo(year)?.data).toBe(vectors.paixaoDeCristo[year]);
      expect(isFeriadoNacional(vectors.paixaoDeCristo[year])).toBe(true);
    }
  });

  it('is not listed as ponto facultativo', () => {
    expect(
      getPontosFacultativosFederais(2026).some((p) => p.data === vectors.paixaoDeCristo['2026']),
    ).toBe(false);
  });

  it('returns null for non-integer year', () => {
    expect(getPaixaoDeCristo(2026.5)).toBeNull();
  });
});

describe('Feriados — federal facultative days (Portaria MGI)', () => {
  it('resolves 2025 recurring facultative dates (7 days)', () => {
    const table = vectors.facultativos2025;
    const pontos = getPontosFacultativosFederais(2025);
    expect(pontos).toHaveLength(FERIADOS_FACULTATIVOS_RECORRENTES_COUNT);
    expect(pontos.filter((p) => p.nome === 'Carnaval').map((p) => p.data).sort()).toEqual(
      [table.carnavalSegunda, table.carnavalTerca].sort(),
    );
    expect(pontos.find((p) => p.nome === 'Quarta-Feira de Cinzas')?.data).toBe(table.quartaCinzas);
    expect(pontos.find((p) => p.nome === 'Quarta-Feira de Cinzas')?.horarioParcial).toBe(
      'until 14:00',
    );
    expect(pontos.find((p) => p.nome === 'Corpus Christi')?.data).toBe(table.corpusChristi);
    expect(pontos.find((p) => p.nome === 'Dia do Servidor Público federal')?.data).toBe(
      table.servidorPublico,
    );
    expect(pontos.find((p) => p.nome === 'Véspera do Natal')?.horarioParcial).toBe('after 13:00');
    expect(pontos.find((p) => p.nome === 'Véspera do Natal')?.data).toBe(table.vesperaNatal);
    expect(pontos.find((p) => p.nome === 'Véspera do Ano Novo')?.data).toBe(table.vesperaAnoNovo);
  });

  it('matches Portaria MGI 11.460/2025 facultative calendar for 2026 (9 days)', () => {
    const table = vectors.facultativos2026;
    const pontos = getPontosFacultativosFederais(2026);
    expect(pontos).toHaveLength(FERIADOS_FACULTATIVOS_FEDERAIS_COUNT);
    expect(pontos.filter((p) => p.nome === 'Carnaval').map((p) => p.data).sort()).toEqual(
      [table.carnavalSegunda, table.carnavalTerca].sort(),
    );
    expect(pontos.find((p) => p.nome === 'Quarta-Feira de Cinzas')?.data).toBe(table.quartaCinzas);
    expect(pontos.find((p) => p.data === table.ponte20Abril)?.nome).toBe('Ponto facultativo');
    expect(pontos.find((p) => p.nome === 'Corpus Christi')?.data).toBe(table.corpusChristi);
    expect(pontos.find((p) => p.data === table.ponte5Junho)?.nome).toBe('Ponto facultativo');
    expect(pontos.find((p) => p.nome === 'Dia do Servidor Público federal')?.data).toBe(
      table.servidorPublico,
    );
    expect(pontos.find((p) => p.nome === 'Véspera do Natal')?.data).toBe(table.vesperaNatal);
    expect(pontos.find((p) => p.nome === 'Véspera do Ano Novo')?.data).toBe(table.vesperaAnoNovo);
  });

  it('resolves 2027 recurring facultative dates (7 days)', () => {
    const table = vectors.facultativos2027;
    const pontos = getPontosFacultativosFederais(2027);
    expect(pontos).toHaveLength(FERIADOS_FACULTATIVOS_RECORRENTES_COUNT);
    expect(pontos.find((p) => p.nome === 'Corpus Christi')?.data).toBe(table.corpusChristi);
    expect(pontos.find((p) => p.nome === 'Dia do Servidor Público federal')?.data).toBe(
      table.servidorPublico,
    );
  });

  it('does not treat facultative days as national holidays', () => {
    for (const date of vectors.notNationalFederal) {
      expect(isFeriadoNacional(date)).toBe(false);
    }
  });

  it('detects facultative days via isPontoFacultativoFederal', () => {
    const parts = parseIsoDateString(vectors.facultativos2025.carnavalTerca);
    expect(parts).not.toBeNull();
    if (parts !== null) {
      expect(isPontoFacultativoFederal(parts)).toBe(true);
    }
  });

  it('returns empty list for non-integer year', () => {
    expect(getPontosFacultativosFederais(2025.5)).toEqual([]);
  });
});

describe('Feriados — fixed national federal holidays (Lei 662/1949 + amendments)', () => {
  it('marks every fixed 2025 date as national holiday', () => {
    for (const holiday of vectors.fixed2025) {
      expect(isFeriadoNacional(holiday.data)).toBe(true);
      const list = getAllFeriados(2025);
      expect(list.some((item) => item.data === holiday.data && item.nome === holiday.nome)).toBe(true);
    }
  });

  it('matches Gov.br 2026 national calendar (10 holidays including Paixão de Cristo)', () => {
    for (const holiday of vectors.fixed2026) {
      expect(isFeriadoNacional(holiday.data)).toBe(true);
    }
    expect(isFeriadoNacional(vectors.paixaoDeCristo['2026'])).toBe(true);
    expect(getAllFeriados(2026)).toHaveLength(FERIADOS_NACIONAL_TOTAL_COUNT);
  });

  it('returns false for a regular weekday', () => {
    expect(isFeriadoNacional(vectors.notHoliday)).toBe(false);
  });

  it('excludes Consciência Negra before Lei 14.759/2023 effective year', () => {
    expect(isFeriadoNacional(vectors.conscienciaNegraBeforeLaw.data)).toBe(
      vectors.conscienciaNegraBeforeLaw.expected,
    );
    expect(CONSCIENCIA_NEGRA_MIN_YEAR).toBe(2024);
  });

  it('lists nine fixed templates per year from 2024 onward', () => {
    expect(getFixedHolidaysForYear(2025)).toHaveLength(FERIADOS_FIXED_COUNT);
    expect(getFixedHolidaysForYear(2023)).toHaveLength(FERIADOS_FIXED_COUNT - 1);
  });
});

describe('Feriados — public API', () => {
  it('accepts Date input using UTC parts', () => {
    const date = new Date(Date.UTC(2025, 10, 15));
    expect(isFeriadoNacional(date)).toBe(true);
  });

  it('returns false for invalid ISO strings', () => {
    expect(isFeriadoNacional('2025-13-01')).toBe(false);
    expect(isFeriadoNacional('invalid')).toBe(false);
    expect(isFeriadoNacional('')).toBe(false);
    expect(isFeriadoNacional(new Date(Number.NaN))).toBe(false);
  });

  it('returns empty string for invalid getProximoDiaUtil input', () => {
    expect(getProximoDiaUtil('not-a-date')).toBe('');
  });

  it('skips Christmas and weekends for próximo dia útil', () => {
    expect(getProximoDiaUtil(vectors.proximoDiaUtil.from)).toBe(vectors.proximoDiaUtil.expected);
    expect(getProximoDiaUtil('2025-12-24')).toBe('2025-12-26');
    expect(getProximoDiaUtil('2026-01-09')).toBe('2026-01-12');
  });

  it('returns sorted national holidays for a year (fixed + Paixão de Cristo)', () => {
    const holidays = getAllFeriados(2025);
    expect(holidays.length).toBe(FERIADOS_NACIONAL_TOTAL_COUNT);
    const dates = holidays.map((holiday) => holiday.data);
    expect([...dates].sort()).toEqual(dates);
    expect(holidays.some((holiday) => holiday.tipo === 'movel')).toBe(true);
  });

  it('returns empty list for non-integer year', () => {
    expect(getAllFeriados(2025.5)).toEqual([]);
  });
});

describe('Feriados — transparency metadata', () => {
  it('exposes legal source URLs and catalog counts', () => {
    expect(FERIADOS_DATA_VERSION.id).toBe('feriados');
    expect(FERIADOS_DATA_VERSION.endpoints).toContain(FERIADOS_LEI_662_URL);
    expect(FERIADOS_DATA_VERSION.endpoints).toContain(FERIADOS_LEI_10007_URL);
    expect(FERIADOS_DATA_VERSION.endpoints).toContain(FERIADOS_LEI_14759_URL);
    expect(FERIADOS_DATA_VERSION.endpoints).toContain(FERIADOS_GOV_CALENDARIO_URL);
    expect(FERIADOS_LEI_14759_URL).toBe(vectors.lei14759Url);
    expect(FERIADOS_GOV_CALENDARIO_URL).toBe(vectors.govBrCalendario2026Url);
    expect(FERIADOS_PORTARIA_MGI_11460_2025_URL).toBe(vectors.portariaMgi11460Url);
    expect(FERIADOS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(FERIADOS_DATA_VERSION.contagens.feriadosNacionaisFixos).toBe(FERIADOS_FIXED_COUNT);
    expect(FERIADOS_DATA_VERSION.contagens.pontosFacultativosFederais).toBe(
      FERIADOS_FACULTATIVOS_FEDERAIS_COUNT,
    );
    expect(getPontosFacultativosFederais(2026)).toHaveLength(FERIADOS_FACULTATIVOS_FEDERAIS_COUNT);
  });
});

describe('Feriados — date utils coverage', () => {
  it('rejects invalid calendar dates in ISO parser', () => {
    expect(parseIsoDateString('2025-02-30')).toBeNull();
  });
});
