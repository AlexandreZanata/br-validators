import { describe, expect, it } from 'vitest';

import {
  CNPJ_MOTIVOS_BASE_URL,
  CNPJ_MOTIVOS_DATA_VERSION,
  CNPJ_MOTIVOS_GOLDEN_EXTINCAO_VOLUNTARIA,
  CNPJ_MOTIVOS_GOLDEN_INCORPORACAO,
  CNPJ_MOTIVOS_GOLDEN_SEM_MOTIVO,
  SITUACAO_CADASTRAL_LABELS,
  getMotivoSituacaoCadastralPorCodigo,
  getMotivosSituacaoCadastral,
} from '../../../src/cnpj-motivos/index.js';
import vectors from '../../vectors/cnpj-motivos.official.json';

describe('CNPJ motivos — official golden vectors', () => {
  it('resolves code 01 as extinção por encerramento liquidação voluntária', () => {
    const motivo = getMotivoSituacaoCadastralPorCodigo(vectors.golden.extincaoVoluntaria.codigo);
    expect(motivo?.codigo).toBe(CNPJ_MOTIVOS_GOLDEN_EXTINCAO_VOLUNTARIA);
    expect(motivo?.descricao).toContain(vectors.golden.extincaoVoluntaria.descricaoContains);
  });

  it('resolves code 00 as sem motivo', () => {
    const motivo = getMotivoSituacaoCadastralPorCodigo(vectors.golden.semMotivo.codigo);
    expect(motivo?.codigo).toBe(CNPJ_MOTIVOS_GOLDEN_SEM_MOTIVO);
    expect(motivo?.descricao).toContain(vectors.golden.semMotivo.descricaoContains);
  });

  it('resolves code 02 as incorporação', () => {
    const motivo = getMotivoSituacaoCadastralPorCodigo(vectors.golden.incorporacao.codigo);
    expect(motivo?.codigo).toBe(CNPJ_MOTIVOS_GOLDEN_INCORPORACAO);
    expect(motivo?.descricao).toContain(vectors.golden.incorporacao.descricaoContains);
  });

  it('normalizes lookup with padded numeric input', () => {
    expect(getMotivoSituacaoCadastralPorCodigo('1')?.codigo).toBe('01');
    expect(getMotivoSituacaoCadastralPorCodigo('002')?.codigo).toBe('02');
  });

  it('returns undefined for unknown or invalid codes', () => {
    expect(getMotivoSituacaoCadastralPorCodigo('99')).toBeUndefined();
    expect(getMotivoSituacaoCadastralPorCodigo('')).toBeUndefined();
    expect(getMotivoSituacaoCadastralPorCodigo('abc')).toBeUndefined();
  });
});

describe('CNPJ motivos — coverage and metadata', () => {
  it('lists motivos within expected RFB range', () => {
    const list = getMotivosSituacaoCadastral();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minMotivos);
    expect(list.length).toBeLessThanOrEqual(vectors.maxMotivos);
    expect(new Set(list.map((motivo) => motivo.codigo)).size).toBe(list.length);
  });

  it('exposes official RFB endpoint in metadata', () => {
    expect(CNPJ_MOTIVOS_DATA_VERSION.id).toBe('cnpj-motivos');
    expect(
      CNPJ_MOTIVOS_DATA_VERSION.endpoints.some((endpoint) =>
        endpoint.includes(CNPJ_MOTIVOS_BASE_URL),
      ) ||
        CNPJ_MOTIVOS_DATA_VERSION.endpoints.some((endpoint) =>
          endpoint.includes('Motivos.zip'),
        ),
    ).toBe(true);
    expect(CNPJ_MOTIVOS_DATA_VERSION.contagens.motivos).toBe(getMotivosSituacaoCadastral().length);
  });

  it('documents situacao cadastral status labels for cross-reference', () => {
    expect(SITUACAO_CADASTRAL_LABELS['02']).toBe('Ativa');
    expect(SITUACAO_CADASTRAL_LABELS['08']).toBe('Baixada');
  });
});
