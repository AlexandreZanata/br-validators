import { describe, expect, it } from 'vitest';

import { fiscalValidationFromLookup } from '../../../src/lookup/fiscal-validation.js';
import { lookupFound, lookupInvalidFormat, lookupNotFound } from '../../../src/types/lookup-result.js';
import {
  formatNcmDisplay,
  isValidNcm,
  validateNcm,
} from '../../../src/ncm/validate.js';
import vectors from '../../vectors/ncm.official.json';

describe('validateNcm — official golden vectors', () => {
  it('accepts golden purebred horse code with description and mask', () => {
    const result = validateNcm(vectors.golden.cavalosReprodutores.codigo);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toBe('01012100');
    expect(result.description).toContain(vectors.golden.cavalosReprodutores.descricaoContains);
    expect(result.format).toBe('0101.21.00');
  });

  it('strips punctuation from dotted input', () => {
    const result = validateNcm(vectors.negative.punctuationInput);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toBe('01012100');
    expect(result.format).toBe('0101.21.00');
  });

  it('returns NOT_FOUND for valid format missing from table', () => {
    const result = validateNcm(vectors.negative.notFound);
    expect(result).toEqual({
      ok: false,
      code: 'NOT_FOUND',
      message: 'NCM 99999999 not in embedded table',
    });
  });

  it('returns INVALID_FORMAT for non-numeric garbage', () => {
    const result = validateNcm(vectors.negative.invalidFormat);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe('INVALID_FORMAT');
  });

  it('returns NOT_FOUND for short numeric code padded to 8 digits', () => {
    const result = validateNcm(vectors.negative.shortCode);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe('NOT_FOUND');
    expect(result.message).toContain('00000123');
  });

  it('isValidNcm mirrors validateNcm ok', () => {
    expect(isValidNcm(vectors.golden.sojaSementes.codigo)).toBe(true);
    expect(isValidNcm(vectors.negative.notFound)).toBe(false);
  });

  it('formatNcmDisplay applies XXXX.XX.XX mask', () => {
    expect(formatNcmDisplay('12011000')).toBe('1201.10.00');
  });
});

describe('fiscalValidationFromLookup', () => {
  it('maps lookup hit to fiscal success', () => {
    const result = fiscalValidationFromLookup(
      lookupFound({ codigo: '5102', descricao: 'Venda' }),
      (codigo) => `fmt:${codigo}`,
    );
    expect(result).toEqual({
      ok: true,
      value: '5102',
      description: 'Venda',
      format: 'fmt:5102',
    });
  });

  it('maps lookup miss without optional format', () => {
    expect(fiscalValidationFromLookup(lookupNotFound('missing'))).toEqual({
      ok: false,
      code: 'NOT_FOUND',
      message: 'missing',
    });
  });

  it('maps lookup format failure', () => {
    expect(fiscalValidationFromLookup(lookupInvalidFormat('bad'))).toEqual({
      ok: false,
      code: 'INVALID_FORMAT',
      message: 'bad',
    });
  });
});
