import { describe, expect, it } from 'vitest';

import { isValidCst, validateCst } from '../../../src/cst/validate.js';
import vectors from '../../vectors/cst.official.json';

describe('validateCst — official golden vectors', () => {
  it('accepts ICMS tributada integralmente', () => {
    const result = validateCst(vectors.golden.icmsTributada.codigo, { tax: 'icms' });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toBe('00');
    expect(result.description.toLowerCase()).toContain(
      vectors.golden.icmsTributada.descricaoContains,
    );
  });

  it('accepts ICMS ST code', () => {
    const result = validateCst(vectors.golden.icmsSt.codigo, { tax: 'icms' });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toBe('10');
  });

  it('accepts IPI, PIS, and COFINS golden codes', () => {
    expect(validateCst(vectors.golden.ipiSaida.codigo, { tax: 'ipi' }).ok).toBe(true);
    expect(validateCst(vectors.golden.pisTributavel.codigo, { tax: 'pis' }).ok).toBe(true);
    expect(validateCst(vectors.golden.cofinsIsenta.codigo, { tax: 'cofins' }).ok).toBe(true);
  });

  it('returns NOT_FOUND per tax when code missing from table', () => {
    const icms = validateCst(vectors.negative.icmsNotFound.codigo, { tax: 'icms' });
    expect(icms.ok).toBe(false);
    if (!icms.ok) {
      expect(icms.code).toBe('NOT_FOUND');
    }
    const ipi = validateCst(vectors.negative.ipiNotFound.codigo, { tax: 'ipi' });
    expect(ipi.ok).toBe(false);
    if (!ipi.ok) {
      expect(ipi.code).toBe('NOT_FOUND');
    }
    const pis = validateCst(vectors.negative.pisNotFound.codigo, { tax: 'pis' });
    expect(pis.ok).toBe(false);
    if (!pis.ok) {
      expect(pis.code).toBe('NOT_FOUND');
    }
    const cofins = validateCst(vectors.negative.cofinsNotFound.codigo, { tax: 'cofins' });
    expect(cofins.ok).toBe(false);
    if (!cofins.ok) {
      expect(cofins.code).toBe('NOT_FOUND');
    }
  });

  it('returns INVALID_FORMAT for non-numeric ICMS code', () => {
    const result = validateCst(vectors.negative.icmsInvalidFormat.codigo, { tax: 'icms' });
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe('INVALID_FORMAT');
  });

  it('returns INVALID_INPUT for empty IPI code', () => {
    const result = validateCst(vectors.negative.ipiEmptyCode.codigo, { tax: 'ipi' });
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe('INVALID_INPUT');
  });

  it('isValidCst mirrors validateCst ok', () => {
    expect(isValidCst(vectors.golden.pisTributavel.codigo, { tax: 'pis' })).toBe(true);
    expect(isValidCst(vectors.negative.pisNotFound.codigo, { tax: 'pis' })).toBe(false);
  });
});
