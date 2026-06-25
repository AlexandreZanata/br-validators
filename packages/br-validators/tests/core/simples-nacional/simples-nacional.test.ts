import { describe, expect, it } from 'vitest';

import {
  CGSN_RESOLUCAO_140_URL,
  PLANALTO_LC123_URL,
  RECEITA_SIMPLES_ANEXO_I_URL,
  SIMPLES_FAIXAS_POR_ANEXO,
  SIMPLES_GOLDEN_ANEXO_COMERCIO,
  SIMPLES_GOLDEN_ANEXO_PROFISSIONAIS,
  SIMPLES_GOLDEN_ANEXO_SERVICOS,
  SIMPLES_MAX_RBT12,
  SIMPLES_NACIONAL_DATA_VERSION,
  computeSimplesAliquotaEfetiva,
  getSimplesAnexo,
  getSimplesAnexos,
  getSimplesFaixa,
} from '../../../src/simples-nacional/index.js';
import vectors from '../../vectors/simples-nacional.official.json';
import * as simplesNacionalBarrel from '../../../src/simples-nacional.js';

describe('Simples Nacional — official golden vectors', () => {
  it('resolves Anexo I faixa 3 for RBT12 R$ 700.000 (comércio)', () => {
    const golden = vectors.golden.anexoIComercio;
    const faixa = getSimplesFaixa({ anexo: golden.anexo, receitaBruta: golden.receitaBruta });
    expect(faixa?.anexo).toBe(SIMPLES_GOLDEN_ANEXO_COMERCIO);
    expect(faixa?.faixa).toBe(golden.faixa);
    expect(faixa?.aliquotaNominal).toBe(golden.aliquotaNominal);
    expect(faixa?.parcelaDeduzir).toBe(golden.parcelaDeduzir);
    expect(computeSimplesAliquotaEfetiva({ anexo: golden.anexo, receitaBruta: golden.receitaBruta })).toBe(
      golden.aliquotaEfetiva,
    );
  });

  it('resolves Anexo III 1ª faixa at RBT12 ceiling R$ 180.000', () => {
    const golden = vectors.golden.anexoIIIFaixa1;
    const faixa = getSimplesFaixa({ anexo: golden.anexo, receitaBruta: golden.receitaBruta });
    expect(faixa?.anexo).toBe(SIMPLES_GOLDEN_ANEXO_SERVICOS);
    expect(faixa?.faixa).toBe(golden.faixa);
    expect(faixa?.aliquotaNominal).toBe(golden.aliquotaNominal);
    expect(faixa?.parcelaDeduzir).toBe(golden.parcelaDeduzir);
  });

  it('resolves Anexo V 2ª faixa for RBT12 R$ 200.000 (serviços intelectuais)', () => {
    const golden = vectors.golden.anexoVProfissionais;
    const faixa = getSimplesFaixa({ anexo: golden.anexo, receitaBruta: golden.receitaBruta });
    expect(faixa?.anexo).toBe(SIMPLES_GOLDEN_ANEXO_PROFISSIONAIS);
    expect(faixa?.faixa).toBe(golden.faixa);
    expect(computeSimplesAliquotaEfetiva({ anexo: golden.anexo, receitaBruta: golden.receitaBruta })).toBe(
      golden.aliquotaEfetiva,
    );
  });

  it('flags Anexo IV with CPP collected outside Simples Nacional', () => {
    const anexo = getSimplesAnexo(vectors.golden.anexoIVCppFora.anexo);
    expect(anexo?.cppForaSimples).toBe(vectors.golden.anexoIVCppFora.cppForaSimples);
  });
});

describe('Simples Nacional — lookup normalization', () => {
  it('accepts roman numerals, ANEXO prefix, and digit aliases', () => {
    expect(getSimplesAnexo('i')?.id).toBe('I');
    expect(getSimplesAnexo('II')?.id).toBe('II');
    expect(getSimplesAnexo('ANEXO III')?.id).toBe('III');
    expect(getSimplesAnexo('3')?.id).toBe('III');
    expect(getSimplesAnexo('5')?.id).toBe('V');
  });

  it('rejects invalid ANEXO roman numerals and multi-digit aliases', () => {
    expect(getSimplesAnexo('ANEXO VI')).toBeUndefined();
    expect(getSimplesAnexo('6')).toBeUndefined();
    expect(getSimplesAnexo('10')).toBeUndefined();
  });

  it('returns undefined for unknown annexes', () => {
    expect(getSimplesAnexo('VI')).toBeUndefined();
    expect(getSimplesAnexo('')).toBeUndefined();
    expect(getSimplesAnexo('abc')).toBeUndefined();
  });

  it('returns undefined for invalid or out-of-range receita bruta', () => {
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: 0 })).toBeUndefined();
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: -1 })).toBeUndefined();
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: Number.NaN })).toBeUndefined();
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: SIMPLES_MAX_RBT12 + 1 })).toBeUndefined();
    expect(computeSimplesAliquotaEfetiva({ anexo: 'I', receitaBruta: 0 })).toBeUndefined();
  });

  it('maps each RBT12 boundary to the correct faixa', () => {
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: 180_000.01 })?.faixa).toBe(2);
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: 360_000.01 })?.faixa).toBe(3);
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: 1_500_000 })?.faixa).toBe(4);
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: 2_500_000 })?.faixa).toBe(5);
    expect(getSimplesFaixa({ anexo: 'I', receitaBruta: 4_500_000 })?.faixa).toBe(6);
  });
});

describe('Simples Nacional — coverage and metadata', () => {
  it('lists five annexes with six progressive faixas each', () => {
    const list = getSimplesAnexos();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minAnexos);
    expect(list.length).toBeLessThanOrEqual(vectors.maxAnexos);
    for (const anexo of list) {
      expect(anexo.faixas).toHaveLength(SIMPLES_FAIXAS_POR_ANEXO);
      expect(anexo.faixas).toHaveLength(vectors.faixasPorAnexo);
    }
  });

  it('exposes official Planalto and Receita endpoints in metadata', () => {
    expect(SIMPLES_NACIONAL_DATA_VERSION.id).toBe('simples-nacional');
    expect(SIMPLES_NACIONAL_DATA_VERSION.endpoints).toContain(PLANALTO_LC123_URL);
    expect(SIMPLES_NACIONAL_DATA_VERSION.endpoints).toContain(RECEITA_SIMPLES_ANEXO_I_URL);
    expect(SIMPLES_NACIONAL_DATA_VERSION.endpoints).toContain(CGSN_RESOLUCAO_140_URL);
    expect(SIMPLES_NACIONAL_DATA_VERSION.endpoints).toContain(vectors.receitaAnexoIUrl);
    expect(SIMPLES_NACIONAL_DATA_VERSION.contagens.anexos).toBe(getSimplesAnexos().length);
    expect(SIMPLES_NACIONAL_DATA_VERSION.verificacao.agendamento).toBe('manual');
    expect(simplesNacionalBarrel.getSimplesAnexos).toBe(getSimplesAnexos);
  });
});
