import { describe, expect, it } from 'vitest';

import {
  BANCOS_DATA_VERSION,
  BANCOS_GOLDEN_COMPE_BB,
  BANCOS_GOLDEN_COMPE_ITAU,
  BANCOS_GOLDEN_COMPE_NUBANK,
  BANCOS_GOLDEN_ISPB_BB,
  BANCOS_GOLDEN_ISPB_ITAU,
  BANCOS_GOLDEN_ISPB_NUBANK,
  BANCOS_STR_URL,
  getBancoPorCodigo,
  getBancoPorIspb,
  getAllBancos,
  lookupBancoPorCodigo,
  lookupBancoPorIspb,
} from '../../../src/bancos/index.js';
import vectors from '../../vectors/bancos.official.json';

describe('Bacen banks — official golden vectors', () => {
  it('resolves Banco do Brasil by COMPE 001', () => {
    const banco = getBancoPorCodigo(vectors.golden.bb.codigo);
    expect(banco?.codigo).toBe(BANCOS_GOLDEN_COMPE_BB);
    expect(banco?.ispb).toBe(BANCOS_GOLDEN_ISPB_BB);
    expect(banco?.nome).toContain(vectors.golden.bb.nomeContains);
  });

  it('resolves Itaú Unibanco by COMPE 341', () => {
    const banco = getBancoPorCodigo(vectors.golden.itau.codigo);
    expect(banco?.codigo).toBe(BANCOS_GOLDEN_COMPE_ITAU);
    expect(banco?.ispb).toBe(BANCOS_GOLDEN_ISPB_ITAU);
    expect(banco?.nome).toContain(vectors.golden.itau.nomeContains);
  });

  it('resolves Nubank by COMPE 260', () => {
    const banco = getBancoPorCodigo(vectors.golden.nubank.codigo);
    expect(banco?.codigo).toBe(BANCOS_GOLDEN_COMPE_NUBANK);
    expect(banco?.ispb).toBe(BANCOS_GOLDEN_ISPB_NUBANK);
    expect(banco?.nome).toContain(vectors.golden.nubank.nomeContains);
  });

  it('normalizes COMPE lookup without leading zeros', () => {
    expect(getBancoPorCodigo('1')?.codigo).toBe('001');
  });

  it('resolves institutions by ISPB', () => {
    expect(getBancoPorIspb(vectors.golden.bb.ispb)?.codigo).toBe('001');
    expect(getBancoPorIspb(vectors.golden.itau.ispb)?.codigo).toBe('341');
    expect(getBancoPorIspb(vectors.golden.nubank.ispb)?.codigo).toBe('260');
  });

  it('returns undefined for unknown COMPE or ISPB', () => {
    expect(getBancoPorCodigo('999')).toBeUndefined();
    expect(getBancoPorIspb('99999999')).toBeUndefined();
    expect(getBancoPorCodigo('')).toBeUndefined();
    expect(getBancoPorIspb('')).toBeUndefined();
    expect(getBancoPorCodigo('abc')).toBeUndefined();
    expect(getBancoPorIspb('abcdefgh')).toBeUndefined();
  });

  it('lookupBancoPorCodigo returns INVALID_FORMAT for letter-only COMPE', () => {
    const result = lookupBancoPorCodigo('abc');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_FORMAT');
    }
    const ispbResult = lookupBancoPorIspb('letters!');
    expect(ispbResult.ok).toBe(false);
  });
});

describe('Bacen banks — national coverage', () => {
  it('lists institutions within expected STR range', () => {
    const list = getAllBancos();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minInstitutions);
    expect(list.length).toBeLessThanOrEqual(vectors.maxInstitutions);
    expect(new Set(list.map((banco) => banco.codigo)).size).toBe(list.length);
    expect(new Set(list.map((banco) => banco.ispb)).size).toBe(list.length);
  });

  it('exposes official STR endpoint in metadata', () => {
    expect(BANCOS_DATA_VERSION.id).toBe('bancos');
    expect(BANCOS_DATA_VERSION.endpoints).toContain(BANCOS_STR_URL);
    expect(BANCOS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(BANCOS_DATA_VERSION.contagens.bancos).toBe(getAllBancos().length);
  });
});
