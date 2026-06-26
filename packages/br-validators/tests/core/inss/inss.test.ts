import { describe, expect, it } from 'vitest';

import {
  calcularInssMensal,
  getInssAnosDisponiveis,
  getInssFaixaPorSalario,
  getInssTabelaContribuicao,
  INSS_DATA_VERSION,
  INSS_DEFAULT_ANO,
  INSS_FAIXAS_POR_TABELA,
  INSS_GOLDEN_CONTRIBUICAO_3000,
  INSS_GOLDEN_SALARIO_3000,
  INSS_ALIQUOTAS_URL,
  INSS_PORTARIA_DOU_URL,
  INSS_TETO_2025,
  LEI_10887_URL,
  roundInssCentavos,
} from '../../../src/inss/index.js';
import vectors from '../../vectors/inss.official.json';

describe('INSS — official golden vectors', () => {
  it('calculates minimum wage R$ 1.518,00', () => {
    const result = calcularInssMensal(vectors.golden.salarioMinimo.salarioContribuicao);
    expect(result?.faixa).toBe(vectors.golden.salarioMinimo.faixa);
    expect(result?.aliquota).toBe(vectors.golden.salarioMinimo.aliquota);
    expect(result?.contribuicao).toBe(vectors.golden.salarioMinimo.contribuicao);
  });

  it('calculates faixa 2 ceiling R$ 2.793,88', () => {
    const result = calcularInssMensal(vectors.golden.faixa2Limite.salarioContribuicao);
    expect(result?.faixa).toBe(vectors.golden.faixa2Limite.faixa);
    expect(result?.contribuicao).toBe(vectors.golden.faixa2Limite.contribuicao);
  });

  it('calculates faixa 3 example R$ 3.000,00', () => {
    const result = calcularInssMensal(INSS_GOLDEN_SALARIO_3000);
    expect(result?.faixa).toBe(vectors.golden.faixa3Exemplo.faixa);
    expect(result?.aliquota).toBe(vectors.golden.faixa3Exemplo.aliquota);
    expect(result?.contribuicao).toBe(INSS_GOLDEN_CONTRIBUICAO_3000);
    expect(result?.contribuicao).toBe(vectors.golden.faixa3Exemplo.contribuicao);
  });

  it('calculates teto R$ 8.157,41', () => {
    const result = calcularInssMensal(vectors.golden.tetoExemplo.salarioContribuicao);
    expect(result?.faixa).toBe(vectors.golden.tetoExemplo.faixa);
    expect(result?.contribuicao).toBe(vectors.golden.tetoExemplo.contribuicao);
  });

  it('caps contribution above teto', () => {
    const result = calcularInssMensal(vectors.golden.acimaTeto.salarioContribuicao);
    expect(result?.salarioEfetivo).toBe(vectors.golden.acimaTeto.salarioEfetivo);
    expect(result?.faixa).toBe(vectors.golden.acimaTeto.faixa);
    expect(result?.contribuicao).toBe(vectors.golden.acimaTeto.contribuicao);
  });

  it('resolves faixa lookup for golden salary', () => {
    const faixa = getInssFaixaPorSalario(vectors.golden.faixa3Exemplo.salarioContribuicao);
    expect(faixa?.ano).toBe(INSS_DEFAULT_ANO);
    expect(faixa?.faixa).toBe(3);
    expect(faixa?.descricao).toContain('4.190,83');
    expect(faixa?.teto).toBe(INSS_TETO_2025);
  });

  it('returns undefined for invalid salary or unknown year', () => {
    expect(calcularInssMensal(vectors.negative.invalidSalario)).toBeUndefined();
    expect(getInssFaixaPorSalario(vectors.negative.invalidSalario)).toBeUndefined();
    expect(getInssFaixaPorSalario(3000, vectors.negative.unknownYear)).toBeUndefined();
    expect(getInssTabelaContribuicao(vectors.negative.unknownYear)).toBeUndefined();
    expect(calcularInssMensal(3000, vectors.negative.unknownYear)).toBeUndefined();
  });
});

describe('INSS — progressive table embed', () => {
  it('lists 2025 table with four faixas and teto', () => {
    const tabela = getInssTabelaContribuicao(INSS_DEFAULT_ANO);
    expect(tabela?.faixas.length).toBe(INSS_FAIXAS_POR_TABELA);
    expect(tabela?.faixas.length).toBe(vectors.faixas);
    expect(tabela?.teto).toBe(vectors.teto);
    expect(getInssAnosDisponiveis()).toEqual([INSS_DEFAULT_ANO]);
    expect(tabela?.faixas[0]?.aliquota).toBe(0.075);
    expect(tabela?.faixas[3]?.salarioMax).toBe(INSS_TETO_2025);
  });

  it('defaults to embedded year when ano omitted', () => {
    expect(getInssTabelaContribuicao()?.faixas.length).toBe(INSS_FAIXAS_POR_TABELA);
    expect(calcularInssMensal(1518)?.ano).toBe(INSS_DEFAULT_ANO);
  });

  it('exposes INSS sources in metadata', () => {
    expect(INSS_DATA_VERSION.id).toBe('inss');
    expect(INSS_DATA_VERSION.endpoints).toContain(INSS_PORTARIA_DOU_URL);
    expect(INSS_DATA_VERSION.endpoints).toContain(INSS_ALIQUOTAS_URL);
    expect(INSS_DATA_VERSION.endpoints).toContain(LEI_10887_URL);
    expect(INSS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(INSS_DATA_VERSION.contagens.anos).toBe(1);
    expect(INSS_DATA_VERSION.contagens.faixas).toBe(INSS_FAIXAS_POR_TABELA);
    expect(INSS_DATA_VERSION.verificacao.agendamento).toBe('manual');
  });

  it('roundInssCentavos rounds to two decimals', () => {
    expect(roundInssCentavos(253.415)).toBe(253.42);
    expect(roundInssCentavos(253.414)).toBe(253.41);
  });

  it('resolves faixa 1 for zero salary', () => {
    const faixa = getInssFaixaPorSalario(0);
    expect(faixa?.faixa).toBe(1);
    expect(calcularInssMensal(0)?.contribuicao).toBe(0);
  });
});
