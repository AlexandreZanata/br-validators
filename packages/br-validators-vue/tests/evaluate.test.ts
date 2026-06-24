import { describe, expect, it, vi } from 'vitest';
import {
  CEP_GOLDEN_PRIMARY,
  CNPJ_GOLDEN_ALPHANUMERIC,
  CPF_GOLDEN_PRIMARY,
  IE_SP_GOLDEN,
  PIX_GOLDEN_EMAIL,
  TELEFONE_GOLDEN_CELULAR_MASKED,
} from '@br-validators/core';
import { evaluateBrValidator, isEmptyBrValue } from '../src/evaluate.js';
import * as registry from '../src/validator-registry.js';

describe('isEmptyBrValue', () => {
  it('treats blank strings as empty', () => {
    expect(isEmptyBrValue('')).toBe(true);
    expect(isEmptyBrValue('   ')).toBe(true);
    expect(isEmptyBrValue('1')).toBe(false);
  });
});

describe('evaluateBrValidator', () => {
  it('returns neutral state for empty input', () => {
    expect(evaluateBrValidator('cpf', '', {})).toEqual({
      isValid: false,
      error: null,
      formatted: null,
    });
  });

  it('returns error for invalid CPF', () => {
    const result = evaluateBrValidator('cpf', '00000000000', {});
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.formatted).toBeNull();
  });

  it('returns formatted output for valid CPF', () => {
    const result = evaluateBrValidator('cpf', CPF_GOLDEN_PRIMARY, {});
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.formatted).toBeTruthy();
  });

  it('returns format error when formatter fails after validation', () => {
    vi.spyOn(registry, 'runBrValidator').mockReturnValue({ ok: true });
    vi.spyOn(registry, 'runBrFormatter').mockReturnValue({
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'format failed',
    });

    expect(evaluateBrValidator('cpf', CPF_GOLDEN_PRIMARY, {})).toEqual({
      isValid: false,
      error: 'format failed',
      formatted: null,
    });

    vi.restoreAllMocks();
  });

  it('requires UF for inscricao-estadual', () => {
    const result = evaluateBrValidator('inscricao-estadual', IE_SP_GOLDEN, {});
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('UF is required');
  });

  it('validates IE when UF is provided', () => {
    const result = evaluateBrValidator('inscricao-estadual', IE_SP_GOLDEN, { uf: 'SP' });
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBeTruthy();
  });

  it('validates PIX with type constraint', () => {
    const ok = evaluateBrValidator('pix', PIX_GOLDEN_EMAIL, { pixType: 'email' });
    expect(ok.isValid).toBe(true);

    const bad = evaluateBrValidator('pix', CPF_GOLDEN_PRIMARY, { pixType: 'email' });
    expect(bad.isValid).toBe(false);
  });

  it('validates PIX without type constraint', () => {
    const result = evaluateBrValidator('pix', PIX_GOLDEN_EMAIL, {});
    expect(result.isValid).toBe(true);
  });
});

describe('validator registry — golden vectors', () => {
  it('validates CNPJ golden vector', () => {
    const result = evaluateBrValidator('cnpj', CNPJ_GOLDEN_ALPHANUMERIC, {});
    expect(result.isValid).toBe(true);
  });

  it('validates CEP golden vector', () => {
    const result = evaluateBrValidator('cep', CEP_GOLDEN_PRIMARY, {});
    expect(result.isValid).toBe(true);
  });

  it('validates telefone golden vector', () => {
    const result = evaluateBrValidator('telefone', TELEFONE_GOLDEN_CELULAR_MASKED, {});
    expect(result.isValid).toBe(true);
  });
});

describe('runBrFormatter IE without UF', () => {
  it('returns unsupported format when UF is missing', () => {
    const result = registry.runBrFormatter('inscricao-estadual', IE_SP_GOLDEN, {});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('UF is required');
    }
  });
});
