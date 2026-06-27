import { describe, expect, it } from 'vitest';

import periodoFixture from '../fixtures/ptax-periodo-response.json' with { type: 'json' };
import {
  PTAX_FECHAMENTO_TIPO,
  PTAX_ROLLING_BUSINESS_DAYS,
  buildPtaxPeriodoRequestUrl,
  collectRecentBusinessDayIsoDates,
  formatBacenPtaxDate,
  mergePtaxRecords,
  parsePtaxFechamentoRows,
  parsePtaxIsoDateFromDataHora,
  resolvePtaxPeriodBounds,
} from './ptax-bacen-api.js';

describe('formatBacenPtaxDate', () => {
  it('converts ISO dates to Bacen MM-dd-yyyy', () => {
    expect(formatBacenPtaxDate('2025-06-24')).toBe('06-24-2025');
    expect(formatBacenPtaxDate('invalid')).toBe('');
  });
});

describe('parsePtaxIsoDateFromDataHora', () => {
  it('extracts YYYY-MM-DD from Bacen timestamp', () => {
    expect(parsePtaxIsoDateFromDataHora('2025-06-24 13:02:35.468')).toBe('2025-06-24');
    expect(parsePtaxIsoDateFromDataHora('bad')).toBe('');
  });
});

describe('buildPtaxPeriodoRequestUrl', () => {
  it('builds Olinda period URL with Bacen date params', () => {
    const url = buildPtaxPeriodoRequestUrl('USD', '2025-06-20', '2025-06-24');
    expect(url).toContain("@moeda='USD'");
    expect(url).toContain("@dataInicial='06-20-2025'");
    expect(url).toContain("@dataFinalCotacao='06-24-2025'");
    expect(buildPtaxPeriodoRequestUrl('USD', 'bad', '2025-06-24')).toBe('');
  });
});

describe('collectRecentBusinessDayIsoDates', () => {
  it('skips weekends when collecting business days', () => {
    const dates = collectRecentBusinessDayIsoDates(new Date('2025-06-24T12:00:00.000Z'), 3);
    expect(dates).toEqual(['2025-06-24', '2025-06-23', '2025-06-20']);
  });
});

describe('resolvePtaxPeriodBounds', () => {
  it('returns sorted oldest and newest business-day bounds', () => {
    const bounds = resolvePtaxPeriodBounds(new Date('2025-06-24T12:00:00.000Z'), 3);
    expect(bounds).toEqual({ dataInicial: '2025-06-20', dataFinal: '2025-06-24' });
  });
});

describe('parsePtaxFechamentoRows', () => {
  it('keeps only Fechamento PTAX rows deduped by date', () => {
    const records = parsePtaxFechamentoRows('usd', periodoFixture.value);
    expect(records).toEqual([
      {
        moeda: 'USD',
        data: '2025-06-23',
        paridadeCompra: 1.15,
        paridadeVenda: 1.15,
        cotacaoCompra: 6.32,
        cotacaoVenda: 6.33,
        dataHoraCotacao: '2025-06-23 13:08:03.250',
        tipoBoletim: PTAX_FECHAMENTO_TIPO,
      },
      {
        moeda: 'USD',
        data: '2025-06-24',
        paridadeCompra: 1,
        paridadeVenda: 1,
        cotacaoCompra: 5.21,
        cotacaoVenda: 5.22,
        dataHoraCotacao: '2025-06-24 13:08:18.606',
        tipoBoletim: PTAX_FECHAMENTO_TIPO,
      },
    ]);
  });
});

describe('PTAX rolling window', () => {
  it('targets 90 business days for embed refresh', () => {
    expect(PTAX_ROLLING_BUSINESS_DAYS).toBe(90);
    const dates = collectRecentBusinessDayIsoDates(new Date('2026-06-26T12:00:00.000Z'), 90);
    expect(dates).toHaveLength(90);
  });
});

describe('mergePtaxRecords', () => {
  it('dedupes by moeda and date', () => {
    const merged = mergePtaxRecords([
      {
        moeda: 'USD',
        data: '2025-06-24',
        paridadeCompra: 1,
        paridadeVenda: 1,
        cotacaoCompra: 5.49,
        cotacaoVenda: 5.5,
        dataHoraCotacao: '2025-06-24 13:02:35.468',
        tipoBoletim: PTAX_FECHAMENTO_TIPO,
      },
      {
        moeda: 'USD',
        data: '2025-06-24',
        paridadeCompra: 1,
        paridadeVenda: 1,
        cotacaoCompra: 9,
        cotacaoVenda: 9,
        dataHoraCotacao: '2025-06-24 13:02:35.468',
        tipoBoletim: PTAX_FECHAMENTO_TIPO,
      },
      {
        moeda: 'EUR',
        data: '2025-06-24',
        paridadeCompra: 1.15,
        paridadeVenda: 1.15,
        cotacaoCompra: 6.32,
        cotacaoVenda: 6.33,
        dataHoraCotacao: '2025-06-24 13:02:35.468',
        tipoBoletim: PTAX_FECHAMENTO_TIPO,
      },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged.find((entry) => entry.moeda === 'USD')?.cotacaoCompra).toBe(9);
  });
});
