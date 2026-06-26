import { describe, expect, it } from 'vitest';

import {
  formatCfopDisplay,
  isValidCfop,
  validateCfop,
} from '../../../src/cfop/validate.js';
import vectors from '../../vectors/cfop.official.json';

describe('validateCfop — official golden vectors', () => {
  it('accepts golden purchase-for-resale code', () => {
    const result = validateCfop(vectors.golden.compraComercializacao.codigo);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toBe('1102');
    expect(result.description.toLowerCase()).toContain(
      vectors.golden.compraComercializacao.descricaoContains,
    );
    expect(result.format).toBe('1.102');
  });

  it('accepts golden third-party sale code', () => {
    const result = validateCfop(vectors.golden.vendaTerceiros.codigo);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toBe('5102');
  });

  it('returns NOT_FOUND for valid format missing from table', () => {
    const result = validateCfop(vectors.negative.notFound);
    expect(result).toEqual({
      ok: false,
      code: 'NOT_FOUND',
      message: 'CFOP 9999 not in embedded table',
    });
  });

  it('returns INVALID_FORMAT for non-numeric garbage', () => {
    const result = validateCfop(vectors.negative.invalidFormat);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe('INVALID_FORMAT');
  });

  it('returns NOT_FOUND for short numeric code padded to 4 digits', () => {
    const result = validateCfop(vectors.negative.shortCode);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe('NOT_FOUND');
    expect(result.message).toContain('0012');
  });

  it('isValidCfop mirrors validateCfop ok', () => {
    expect(isValidCfop(vectors.golden.vendaTerceiros.codigo)).toBe(true);
    expect(isValidCfop(vectors.negative.notFound)).toBe(false);
  });

  it('formatCfopDisplay applies X.XXX mask', () => {
    expect(formatCfopDisplay('5102')).toBe('5.102');
  });
});
