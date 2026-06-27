import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BACEN_PTAX_COTACAO_PERIODO_URL,
  BACEN_PTAX_SWAGGER_URL,
  PTAX_DATA_VERSION,
  PTAX_EMBED_BUSINESS_DAYS,
  PTAX_GOLDEN_EUR,
  PTAX_GOLDEN_USD,
  PTAX_STALE_WARNING,
  buildPtaxCotacaoResult,
  getBrazilTodayIso,
  getPtaxCotacao,
  getPtaxCotacoesPorMoeda,
  getPtaxHistorico,
  getPtaxList,
  getPtaxUltimoDiaUtil,
  isBrazilBusinessDay,
  isPtaxCotacaoStale,
  pickLatestPtaxCotacao,
  subtractBusinessDays,
} from '../../../src/ptax/index.js';
import vectors from '../../vectors/ptax.official.json';

describe('PTAX — official golden vectors', () => {
  it('resolves USD Fechamento for último dia útil embedded', () => {
    const cotacao = getPtaxUltimoDiaUtil(vectors.golden.usdUltimoDiaUtil.moeda, {
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(cotacao?.moeda).toBe(PTAX_GOLDEN_USD);
    expect(cotacao?.data).toBe(vectors.golden.usdUltimoDiaUtil.data);
    expect(cotacao?.dataReferencia).toBe(vectors.golden.usdUltimoDiaUtil.data);
    expect(cotacao?.cotacaoCompra).toBe(vectors.golden.usdUltimoDiaUtil.cotacaoCompra);
    expect(cotacao?.cotacaoVenda).toBe(vectors.golden.usdUltimoDiaUtil.cotacaoVenda);
    expect(cotacao?.tipoBoletim).toBe('Fechamento PTAX');
    expect(cotacao?.isStale).toBe(false);
    expect(cotacao?.warning).toBeUndefined();
  });

  it('resolves EUR último dia útil via getPtaxCotacao without date', () => {
    const cotacao = getPtaxCotacao(vectors.golden.eurUltimoDiaUtil.moeda, undefined, {
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(cotacao?.moeda).toBe(PTAX_GOLDEN_EUR);
    expect(cotacao?.dataReferencia).toBe(vectors.golden.eurUltimoDiaUtil.data);
    expect(cotacao?.cotacaoCompra).toBe(vectors.golden.eurUltimoDiaUtil.cotacaoCompra);
    expect(cotacao?.cotacaoVenda).toBe(vectors.golden.eurUltimoDiaUtil.cotacaoVenda);
    expect(cotacao?.isStale).toBe(false);
  });

  it('resolves USD historical date using ISO and Bacen date formats', () => {
    const iso = getPtaxCotacao(
      vectors.golden.usdHistorico.moeda,
      vectors.golden.usdHistorico.data,
      { asOfDate: vectors.staleness.asOfFresh },
    );
    expect(iso?.cotacaoCompra).toBe(vectors.golden.usdHistorico.cotacaoCompra);
    expect(iso?.cotacaoVenda).toBe(vectors.golden.usdHistorico.cotacaoVenda);
    expect(iso?.dataReferencia).toBe(vectors.golden.usdHistorico.data);
    expect(iso?.isStale).toBe(true);
    expect(iso?.warning).toBe(PTAX_STALE_WARNING);

    const bacen = getPtaxCotacao(
      vectors.golden.usdHistorico.moeda,
      vectors.golden.usdHistorico.dataBacen,
      { asOfDate: vectors.staleness.asOfFresh },
    );
    expect(bacen?.data).toBe(vectors.golden.usdHistorico.data);
    expect(bacen?.isStale).toBe(true);
  });

  it('returns undefined for unknown currency, date, or invalid inputs', () => {
    expect(getPtaxCotacao('BRL')).toBeUndefined();
    expect(getPtaxCotacao('USD', '1999-01-01')).toBeUndefined();
    expect(getPtaxCotacao('US', '2026-06-24')).toBeUndefined();
    expect(getPtaxCotacao('USD', 'bad-date')).toBeUndefined();
    expect(getPtaxUltimoDiaUtil('')).toBeUndefined();
    expect(getPtaxCotacoesPorMoeda('XYZ')).toEqual([]);
    expect(getPtaxCotacoesPorMoeda('')).toEqual([]);
  });
});

describe('PTAX — historico', () => {
  it('returns sorted USD rows in date range with staleness metadata on each row', () => {
    const range = vectors.golden.historicoRange;
    const results = getPtaxHistorico(range.moeda, {
      desde: range.desde,
      ate: range.ate,
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(results).toHaveLength(range.expectedRowCount);
    expect(results[0].dataReferencia).toBe(range.firstDate);
    expect(results[results.length - 1].dataReferencia).toBe(range.lastDate);
    expect(results.every((row) => row.dataReferencia >= range.desde)).toBe(true);
    expect(results.every((row) => row.dataReferencia <= range.ate)).toBe(true);
    expect(results.every((row) => row.moeda === PTAX_GOLDEN_USD)).toBe(true);
    expect(results.every((row) => typeof row.isStale === 'boolean')).toBe(true);
    expect(results[results.length - 1].isStale).toBe(false);
    expect(results[0].isStale).toBe(true);
  });

  it('returns empty array for invalid moeda, dates, or inverted range', () => {
    expect(getPtaxHistorico('', { desde: '2026-06-01', ate: '2026-06-26' })).toEqual([]);
    expect(getPtaxHistorico('USD', { desde: 'bad', ate: '2026-06-26' })).toEqual([]);
    expect(getPtaxHistorico('USD', { desde: '2026-06-26', ate: '2026-06-01' })).toEqual([]);
    expect(getPtaxHistorico('XYZ', { desde: '2026-06-01', ate: '2026-06-26' })).toEqual([]);
  });

  it('accepts Bacen MM-DD-YYYY date format in historico range', () => {
    const results = getPtaxHistorico('USD', {
      desde: '06-23-2026',
      ate: '06-24-2026',
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(results).toHaveLength(2);
    expect(results[0].data).toBe('2026-06-23');
    expect(results[1].data).toBe('2026-06-24');
  });
});

describe('PTAX — staleness vectors', () => {
  it('marks último dia útil as fresh when as-of is next business day', () => {
    const cotacao = getPtaxUltimoDiaUtil('USD', { asOfDate: vectors.staleness.asOfFresh });
    expect(cotacao?.dataReferencia).toBe(vectors.staleness.freshReferenceDate);
    expect(cotacao?.isStale).toBe(false);
    expect(cotacao?.warning).toBeUndefined();
  });

  it('marks historical quote as stale with adapter warning', () => {
    const cotacao = getPtaxCotacao('USD', vectors.staleness.staleReferenceDate, {
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(cotacao?.isStale).toBe(true);
    expect(cotacao?.warning).toBe(vectors.staleness.staleWarning);
    expect(cotacao?.warning).toBe(PTAX_STALE_WARNING);
  });

  it('aligns dataReferencia with PTAX_DATA_VERSION.capturadoEm calendar day', () => {
    expect(PTAX_DATA_VERSION.capturadoEm).toBe(vectors.staleness.capturadoEm);
  });
});

describe('PTAX — staleness helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves Brazil local today via America/Sao_Paulo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-26T15:00:00.000Z'));
    expect(getBrazilTodayIso()).toBe('2026-06-26');
  });

  it('subtracts business days skipping weekends', () => {
    expect(subtractBusinessDays('2026-06-26', 1)).toBe('2026-06-25');
    expect(subtractBusinessDays('2026-06-23', 1)).toBe('2026-06-22');
  });

  it('returns input unchanged when businessDays is below 1', () => {
    expect(subtractBusinessDays('2026-06-26', 0)).toBe('2026-06-26');
  });

  it('returns empty string for invalid ISO input', () => {
    expect(subtractBusinessDays('bad-date', 1)).toBe('');
  });

  it('returns false for invalid staleness inputs', () => {
    expect(isPtaxCotacaoStale('bad', '2026-06-26')).toBe(false);
    expect(isPtaxCotacaoStale('2026-06-25', 'bad')).toBe(false);
    expect(isBrazilBusinessDay('bad-date')).toBe(false);
    expect(isBrazilBusinessDay('2026-06-26')).toBe(true);
    expect(isBrazilBusinessDay('2026-06-27')).toBe(false);
  });

  it('buildPtaxCotacaoResult uses Brazil today when asOfDate omitted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-26T12:00:00.000Z'));
    const row = getPtaxList().find((entry) => entry.moeda === 'USD' && entry.data === '2026-06-25');
    expect(row).toBeDefined();
    const result = buildPtaxCotacaoResult(row!);
    expect(result.isStale).toBe(false);
  });
});

describe('PTAX — coverage and metadata', () => {
  it('lists embedded cotacoes within expected Bacen PTAX bounds', () => {
    const list = getPtaxList();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minRecords);
    expect(list.length).toBeLessThanOrEqual(vectors.maxRecords);
    expect(new Set(list.map((entry) => entry.moeda)).size).toBeGreaterThanOrEqual(
      vectors.minMoedas,
    );
    expect(new Set(list.map((entry) => entry.moeda)).size).toBeLessThanOrEqual(vectors.maxMoedas);
  });

  it('returns cotacoes per moeda sorted by most recent date first', () => {
    const usdRows = getPtaxCotacoesPorMoeda('usd');
    expect(usdRows.length).toBeGreaterThan(0);
    expect(usdRows[0].data >= usdRows[usdRows.length - 1].data).toBe(true);
    expect(pickLatestPtaxCotacao(usdRows, 'USD')?.data).toBe(usdRows[0].data);
    expect(pickLatestPtaxCotacao(usdRows, 'bad')).toBeUndefined();
    expect(pickLatestPtaxCotacao([], 'USD')).toBeUndefined();
  });

  it('exposes Bacen PTAX endpoints and daily refresh metadata', () => {
    expect(PTAX_DATA_VERSION.id).toBe('ptax');
    expect(PTAX_DATA_VERSION.endpoints).toContain(BACEN_PTAX_COTACAO_PERIODO_URL);
    expect(PTAX_DATA_VERSION.endpoints).toContain(BACEN_PTAX_SWAGGER_URL);
    expect(PTAX_DATA_VERSION.endpoints).toContain(vectors.swaggerUrl);
    expect(PTAX_DATA_VERSION.contagens.cotacoes).toBe(getPtaxList().length);
    expect(PTAX_DATA_VERSION.janelaDiasUteis).toBe(vectors.janelaDiasUteis);
    expect(PTAX_DATA_VERSION.janelaDiasUteis).toBe(PTAX_EMBED_BUSINESS_DAYS);
    expect(PTAX_DATA_VERSION.verificacao.agendamento).toBe('diario');
  });
});
