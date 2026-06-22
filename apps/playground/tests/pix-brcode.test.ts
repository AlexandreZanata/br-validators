import { describe, expect, it } from 'vitest';
import {
  BRCODE_GOLDEN_STATIC_CPF,
  BRCODE_GOLDEN_STATIC_EMAIL,
  BRCODE_GOLDEN_STATIC_EVP,
  validateBrCode,
} from '@br-validators/core';
import { buildStaticPixBrCode } from '../lib/pix/build-static-brcode';

describe('buildStaticPixBrCode', () => {
  it('matches golden static EVP vector', () => {
    const payload = buildStaticPixBrCode({
      pixKey: '123e4567-e12b-12d1-a456-426655440000',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
    });
    expect(payload).toBe(BRCODE_GOLDEN_STATIC_EVP);
    expect(validateBrCode(payload).ok).toBe(true);
  });

  it('matches golden static email vector', () => {
    const payload = buildStaticPixBrCode({
      pixKey: 'pix@bcb.gov.br',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
    });
    expect(payload).toBe(BRCODE_GOLDEN_STATIC_EMAIL);
    expect(validateBrCode(payload).ok).toBe(true);
  });

  it('matches golden static CPF vector', () => {
    const payload = buildStaticPixBrCode({
      pixKey: '12345678909',
      merchantName: 'NOME DO RECEBEDOR',
      merchantCity: 'SAO PAULO',
    });
    expect(payload).toBe(BRCODE_GOLDEN_STATIC_CPF);
    expect(validateBrCode(payload).ok).toBe(true);
  });

  it('includes optional amount in payload', () => {
    const payload = buildStaticPixBrCode({
      pixKey: 'pix@bcb.gov.br',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA',
      amount: '12.34',
    });
    expect(payload).toContain('540512.34');
    expect(validateBrCode(payload).ok).toBe(true);
  });
});
