import { describe, expect, it } from 'vitest';

import {
  calcularIrpfMensal,
  getIrpfAnosDisponiveis,
  getIrpfFaixaPorValor,
  getIrpfTabelaProgressiva,
  IRPF_DATA_VERSION,
  IRPF_DEFAULT_ANO,
  IRPF_FAIXAS_POR_TABELA,
  IRPF_GOLDEN_BASE_3000,
  IRPF_GOLDEN_IMPOSTO_3000,
  IRPF_TABELA_PROGRESSIVA_MENSAL_URL,
  IRPF_TABELAS_URL,
  LEI_7713_URL,
  roundIrpfCentavos,
} from '../../../src/irpf/index.js';
import vectors from '../../vectors/irpf.official.json';

describe('IRPF — official golden vectors', () => {
  it('calculates exempt base R$ 2.000,00', () => {
    const result = calcularIrpfMensal(vectors.golden.isento2000.baseCalculo);
    expect(result?.faixa).toBe(vectors.golden.isento2000.faixa);
    expect(result?.aliquota).toBe(vectors.golden.isento2000.aliquota);
    expect(result?.imposto).toBe(vectors.golden.isento2000.imposto);
  });

  it('calculates faixa 2 ceiling R$ 2.826,65', () => {
    const result = calcularIrpfMensal(vectors.golden.faixa2Limite.baseCalculo);
    expect(result?.faixa).toBe(vectors.golden.faixa2Limite.faixa);
    expect(result?.imposto).toBe(vectors.golden.faixa2Limite.imposto);
  });

  it('calculates faixa 3 example R$ 3.000,00', () => {
    const result = calcularIrpfMensal(IRPF_GOLDEN_BASE_3000);
    expect(result?.faixa).toBe(vectors.golden.faixa3Exemplo.faixa);
    expect(result?.aliquota).toBe(vectors.golden.faixa3Exemplo.aliquota);
    expect(result?.imposto).toBe(IRPF_GOLDEN_IMPOSTO_3000);
    expect(result?.imposto).toBe(vectors.golden.faixa3Exemplo.imposto);
  });

  it('calculates faixa 5 example R$ 5.000,00', () => {
    const result = calcularIrpfMensal(vectors.golden.faixa5Exemplo.baseCalculo);
    expect(result?.faixa).toBe(vectors.golden.faixa5Exemplo.faixa);
    expect(result?.imposto).toBe(vectors.golden.faixa5Exemplo.imposto);
  });

  it('resolves faixa lookup for golden base', () => {
    const faixa = getIrpfFaixaPorValor(vectors.golden.faixa3Exemplo.baseCalculo);
    expect(faixa?.ano).toBe(IRPF_DEFAULT_ANO);
    expect(faixa?.faixa).toBe(3);
    expect(faixa?.descricao).toContain('3.751,05');
  });

  it('returns undefined for invalid base or unknown year', () => {
    expect(calcularIrpfMensal(vectors.negative.invalidBase)).toBeUndefined();
    expect(getIrpfFaixaPorValor(vectors.negative.invalidBase)).toBeUndefined();
    expect(getIrpfTabelaProgressiva(vectors.negative.unknownYear)).toBeUndefined();
    expect(calcularIrpfMensal(3000, vectors.negative.unknownYear)).toBeUndefined();
  });
});

describe('IRPF — progressive table embed', () => {
  it('lists 2025 table with five faixas', () => {
    const faixas = getIrpfTabelaProgressiva(IRPF_DEFAULT_ANO);
    expect(faixas?.length).toBe(IRPF_FAIXAS_POR_TABELA);
    expect(faixas?.length).toBe(vectors.faixas);
    expect(getIrpfAnosDisponiveis()).toEqual([IRPF_DEFAULT_ANO]);
    expect(faixas?.[0]?.aliquota).toBe(0);
    expect(faixas?.[4]?.baseCalculoMax).toBeNull();
  });

  it('defaults to embedded year when ano omitted', () => {
    expect(getIrpfTabelaProgressiva()?.length).toBe(IRPF_FAIXAS_POR_TABELA);
    expect(calcularIrpfMensal(2000)?.ano).toBe(IRPF_DEFAULT_ANO);
  });

  it('exposes RFB sources in metadata', () => {
    expect(IRPF_DATA_VERSION.id).toBe('irpf');
    expect(IRPF_DATA_VERSION.endpoints).toContain(IRPF_TABELAS_URL);
    expect(IRPF_DATA_VERSION.endpoints).toContain(IRPF_TABELA_PROGRESSIVA_MENSAL_URL);
    expect(IRPF_DATA_VERSION.endpoints).toContain(LEI_7713_URL);
    expect(IRPF_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(IRPF_DATA_VERSION.contagens.anos).toBe(1);
    expect(IRPF_DATA_VERSION.contagens.faixas).toBe(IRPF_FAIXAS_POR_TABELA);
    expect(IRPF_DATA_VERSION.verificacao.agendamento).toBe('manual');
  });

  it('roundIrpfCentavos rounds to two decimals', () => {
    expect(roundIrpfCentavos(68.555)).toBe(68.56);
    expect(roundIrpfCentavos(68.554)).toBe(68.55);
  });

  it('resolves faixa 1 for zero base', () => {
    const faixa = getIrpfFaixaPorValor(0);
    expect(faixa?.faixa).toBe(1);
    expect(calcularIrpfMensal(0)?.imposto).toBe(0);
  });
});
