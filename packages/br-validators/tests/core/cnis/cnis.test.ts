import { describe, expect, it } from 'vitest';

import {
  CNIS_GOLDEN_CAIXA_PIS,
  CNIS_GOLDEN_INSS_NIT,
  CNIS_OFFICIAL_VALIDATION_URL,
  inferNitIssuer,
  inferNitTipo,
  isValidNit,
  resolveNitMetadata,
  validateNit,
} from '../../../src/core/cnis/index.js';
import { validatePisPasep } from '../../../src/core/pis-pasep/index.js';
import { formatNit } from '../../../src/format/cnis.js';
import { stripNit } from '../../../src/strip/cnis.js';
import vectors from '../../vectors/cnis.official.json';

describe('CNIS / NIT — official golden vectors', () => {
  it('validates Caixa PIS golden with issuer caixa / tipo pis', () => {
    const result = validateNit(vectors.caixaPis.canonical);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CNIS_GOLDEN_CAIXA_PIS);
      expect(result.issuer).toBe('caixa');
      expect(result.tipo).toBe('pis');
    }
  });

  it('validates masked Caixa PIS golden', () => {
    expect(isValidNit(vectors.caixaPis.formatted)).toBe(true);
  });

  it('validates INSS NIT golden with issuer inss / tipo nit', () => {
    const result = validateNit(vectors.inssNit.canonical);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CNIS_GOLDEN_INSS_NIT);
      expect(result.issuer).toBe('inss');
      expect(result.tipo).toBe('nit');
    }
  });

  it('validates Caixa NIS series heuristic (leading digit 4)', () => {
    const result = validateNit(vectors.caixaNis.canonical);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.issuer).toBe('caixa');
      expect(result.tipo).toBe('nis');
    }
  });

  it('accepts explicit issuer override without changing checksum', () => {
    const result = validateNit(CNIS_GOLDEN_CAIXA_PIS, { issuer: 'inss', tipo: 'nit' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.issuer).toBe('inss');
      expect(result.tipo).toBe('nit');
    }
  });

  it('exports official RV_03 validation URL', () => {
    expect(CNIS_OFFICIAL_VALIDATION_URL).toBe(vectors.validationUrl);
  });
});

describe('CNIS / NIT — issuer inference', () => {
  it('infers inss for leading zero', () => {
    expect(inferNitIssuer(CNIS_GOLDEN_INSS_NIT)).toBe('inss');
    expect(inferNitTipo(CNIS_GOLDEN_INSS_NIT)).toBe('nit');
  });

  it('infers caixa/pis for CLT series digits 1–3', () => {
    expect(inferNitIssuer(CNIS_GOLDEN_CAIXA_PIS)).toBe('caixa');
    expect(inferNitTipo(CNIS_GOLDEN_CAIXA_PIS)).toBe('pis');
    expect(inferNitTipo('12056456402')).toBe('pis');
  });

  it('infers caixa/nis for digits 4–9', () => {
    expect(inferNitIssuer(vectors.caixaNis.canonical)).toBe('caixa');
    expect(inferNitTipo(vectors.caixaNis.canonical)).toBe('nis');
  });

  it('resolveNitMetadata merges explicit options', () => {
    expect(resolveNitMetadata(CNIS_GOLDEN_CAIXA_PIS)).toEqual({ issuer: 'caixa', tipo: 'pis' });
    expect(resolveNitMetadata(CNIS_GOLDEN_CAIXA_PIS, { issuer: 'inss' })).toEqual({
      issuer: 'inss',
      tipo: 'pis',
    });
  });
});

describe('CNIS / NIT — checksum parity with PIS/PASEP', () => {
  it('shares modulo-11 acceptance with validatePisPasep for golden PIS', () => {
    expect(validatePisPasep(CNIS_GOLDEN_CAIXA_PIS).ok).toBe(true);
    expect(validateNit(CNIS_GOLDEN_CAIXA_PIS).ok).toBe(true);
  });
});

describe('CNIS / NIT — negative vectors', () => {
  it.each([
    ['emptyInput', vectors.negative.emptyInput],
    ['whitespaceOnly', vectors.negative.whitespaceOnly],
    ['wrongLength', vectors.negative.wrongLength],
    ['invalidCheckDigit', vectors.negative.invalidCheckDigit],
    ['invalidCharacter', vectors.negative.invalidCharacter],
    ['allIdenticalDigits', vectors.negative.allIdenticalDigits],
  ] as const)('rejects %s from official vector', (_label, vector) => {
    const result = validateNit(vector.input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe(vector.code);
    }
  });
});

describe('stripNit and formatNit', () => {
  it('strips mask characters', () => {
    expect(stripNit(vectors.caixaPis.formatted)).toBe(CNIS_GOLDEN_CAIXA_PIS);
  });

  it('isValidNit shorthand', () => {
    expect(isValidNit(CNIS_GOLDEN_INSS_NIT)).toBe(true);
    expect(isValidNit('bad')).toBe(false);
  });

  it('formats INSS NIT golden to official mask', () => {
    const result = formatNit(CNIS_GOLDEN_INSS_NIT);
    expect(result).toEqual({ ok: true, formatted: vectors.inssNit.formatted });
  });

  it('formatNit returns error for invalid input', () => {
    const result = formatNit('1002723088');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });
});
