import { describe, expect, it } from 'vitest';

import {
  BACEN_PTAX_COTACAO_PERIODO_URL,
  BACEN_PTAX_SWAGGER_URL,
  PTAX_DATA_VERSION,
  PTAX_GOLDEN_EUR,
  PTAX_GOLDEN_USD,
  getPtaxCotacao,
  getPtaxCotacoesPorMoeda,
  getPtaxList,
  getPtaxUltimoDiaUtil,
  pickLatestPtaxCotacao,
} from '../../../src/ptax/index.js';
import vectors from '../../vectors/ptax.official.json';

describe('PTAX — official golden vectors', () => {
  it('resolves USD Fechamento for último dia útil embedded', () => {
    const cotacao = getPtaxUltimoDiaUtil(vectors.golden.usdUltimoDiaUtil.moeda);
    expect(cotacao?.moeda).toBe(PTAX_GOLDEN_USD);
    expect(cotacao?.data).toBe(vectors.golden.usdUltimoDiaUtil.data);
    expect(cotacao?.cotacaoCompra).toBe(vectors.golden.usdUltimoDiaUtil.cotacaoCompra);
    expect(cotacao?.cotacaoVenda).toBe(vectors.golden.usdUltimoDiaUtil.cotacaoVenda);
    expect(cotacao?.tipoBoletim).toBe('Fechamento PTAX');
  });

  it('resolves EUR último dia útil via getPtaxCotacao without date', () => {
    const cotacao = getPtaxCotacao(vectors.golden.eurUltimoDiaUtil.moeda);
    expect(cotacao?.moeda).toBe(PTAX_GOLDEN_EUR);
    expect(cotacao?.data).toBe(vectors.golden.eurUltimoDiaUtil.data);
    expect(cotacao?.cotacaoCompra).toBe(vectors.golden.eurUltimoDiaUtil.cotacaoCompra);
    expect(cotacao?.cotacaoVenda).toBe(vectors.golden.eurUltimoDiaUtil.cotacaoVenda);
  });

  it('resolves USD historical date using ISO and Bacen date formats', () => {
    const iso = getPtaxCotacao(
      vectors.golden.usdHistorico.moeda,
      vectors.golden.usdHistorico.data,
    );
    expect(iso?.cotacaoCompra).toBe(vectors.golden.usdHistorico.cotacaoCompra);
    expect(iso?.cotacaoVenda).toBe(vectors.golden.usdHistorico.cotacaoVenda);

    const bacen = getPtaxCotacao(
      vectors.golden.usdHistorico.moeda,
      vectors.golden.usdHistorico.dataBacen,
    );
    expect(bacen?.data).toBe(vectors.golden.usdHistorico.data);
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
    expect(PTAX_DATA_VERSION.verificacao.agendamento).toBe('diario');
  });
});
