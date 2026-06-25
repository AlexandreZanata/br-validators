import { describe, expect, it } from 'vitest';

import { CMUNFG_DV_EXCEPTIONS } from '../../../src/ibge/cmunfg-exceptions.js';
import {
  CMUNFG_GOLDEN_BASE_SAO_PAULO,
  CMUNFG_GOLDEN_EXCEPTION_BOM_PRINCIPIO,
  CMUNFG_GOLDEN_SAO_PAULO,
  IBGE_GOLDEN_MUNICIPIO_SP,
  IBGE_MUNICIPIO_CODIGOS_URL,
  NFE_MOC_ANEXO_I_URL,
  computeCmunFgCheckDigit,
  getMunicipioPorCodigo,
  parseCmunFg,
  toCmunFg,
} from '../../../src/ibge/index.js';
import vectors from '../../vectors/ibge.cmunfg.official.json';

describe('IBGE cMunFG — official golden vectors', () => {
  it('computes check digit 8 for São Paulo base 355030', () => {
    expect(computeCmunFgCheckDigit(vectors.golden.saoPaulo.base6)).toBe(
      vectors.golden.saoPaulo.checkDigit,
    );
    expect(toCmunFg(vectors.golden.saoPaulo.base6)).toBe(String(vectors.golden.saoPaulo.codigo));
    expect(toCmunFg(vectors.golden.saoPaulo.codigo)).toBe(String(vectors.golden.saoPaulo.codigo));
  });

  it('parses valid cMunFG 3550308 (São Paulo)', () => {
    const parsed = parseCmunFg(String(vectors.golden.saoPaulo.codigo));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.codigo).toBe(CMUNFG_GOLDEN_SAO_PAULO);
      expect(parsed.base6).toBe(CMUNFG_GOLDEN_BASE_SAO_PAULO);
      expect(parsed.checkDigit).toBe(vectors.golden.saoPaulo.checkDigit);
      expect(getMunicipioPorCodigo(parsed.codigo)?.nome).toBe('São Paulo');
    }
  });

  it('builds Sorriso MT cMunFG 5107925 from 6-digit base', () => {
    expect(toCmunFg(vectors.golden.sorriso.base6)).toBe(String(vectors.golden.sorriso.codigo));
    expect(parseCmunFg(String(vectors.golden.sorriso.codigo)).ok).toBe(true);
  });

  it('applies DV exception for Bom Princípio do Piauí (2201919)', () => {
    expect(computeCmunFgCheckDigit(vectors.golden.exceptionBomPrincipio.base6)).not.toBe(
      vectors.golden.exceptionBomPrincipio.checkDigit,
    );
    expect(toCmunFg(vectors.golden.exceptionBomPrincipio.base6)).toBe(
      String(vectors.golden.exceptionBomPrincipio.codigo),
    );
    const municipio = getMunicipioPorCodigo(CMUNFG_GOLDEN_EXCEPTION_BOM_PRINCIPIO);
    expect(municipio?.nome).toContain(vectors.golden.exceptionBomPrincipio.nomeContains);
  });

  it('builds all nine official DV exceptions from 6-digit bases', () => {
    for (const [base6, fullCode] of Object.entries(CMUNFG_DV_EXCEPTIONS)) {
      expect(toCmunFg(base6)).toBe(String(fullCode).padStart(7, '0'));
      expect(parseCmunFg(String(fullCode)).ok).toBe(true);
    }
  });
});

describe('IBGE cMunFG — validation errors', () => {
  it('rejects empty, invalid chars, wrong length, and bad check digit', () => {
    const empty = parseCmunFg('');
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.reason).toBe('EMPTY_INPUT');
    }

    const letters = parseCmunFg(vectors.invalid.withLetters);
    expect(letters.ok).toBe(false);
    if (!letters.ok) {
      expect(letters.reason).toBe('INVALID_CHARS');
    }

    const short = parseCmunFg(vectors.invalid.tooShort);
    expect(short.ok).toBe(false);
    if (!short.ok) {
      expect(short.reason).toBe('INVALID_LENGTH');
    }

    const long = parseCmunFg(vectors.invalid.tooLong);
    expect(long.ok).toBe(false);
    if (!long.ok) {
      expect(long.reason).toBe('INVALID_LENGTH');
    }

    const badDv = parseCmunFg(vectors.invalid.badCheckDigit);
    expect(badDv.ok).toBe(false);
    if (!badDv.ok) {
      expect(badDv.reason).toBe('CHECK_DIGIT_MISMATCH');
    }
  });

  it('returns undefined from toCmunFg for invalid inputs', () => {
    expect(toCmunFg('')).toBeUndefined();
    expect(toCmunFg(vectors.invalid.tooShort)).toBeUndefined();
    expect(toCmunFg(vectors.invalid.badCheckDigit)).toBeUndefined();
    expect(toCmunFg(Number.NaN)).toBeUndefined();
    expect(computeCmunFgCheckDigit('abc')).toBeUndefined();
  });

  it('accepts masked input in parseCmunFg', () => {
    expect(parseCmunFg('355.030-8').ok).toBe(true);
  });

  it('rejects toCmunFg when 7-digit code has wrong check digit', () => {
    expect(toCmunFg(IBGE_GOLDEN_MUNICIPIO_SP)).toBe(String(IBGE_GOLDEN_MUNICIPIO_SP));
    expect(toCmunFg(vectors.invalid.badCheckDigit)).toBeUndefined();
  });
});

describe('IBGE cMunFG — official source constants', () => {
  it('documents IBGE municipality codes and NF-e MOC references', () => {
    expect(IBGE_MUNICIPIO_CODIGOS_URL).toBe(vectors.source);
    expect(NFE_MOC_ANEXO_I_URL).toBe(vectors.nfeMocAnexoIUrl);
  });
});
