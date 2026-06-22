import { describe, expect, it } from 'vitest';
import {
  BRCODE_GOLDEN_STATIC_EVP,
  BOLETO_GOLDEN_LINHA_MASKED,
  IE_SUPPORTED_UFS,
  parseBrCode,
  validateBoleto,
  validateCartaoCredito,
  validateCep,
  validateCnpj,
  validateCpf,
  validateInscricaoEstadual,
  validatePisPasep,
  validatePixKey,
  validatePlaca,
  validateTelefone,
} from '@br-validators/core';
import { generateCep } from '../lib/generators/cep';
import { generateCnpj } from '../lib/generators/cnpj';
import { generateCpf } from '../lib/generators/cpf';
import { generateCreditCard } from '../lib/generators/cartao';
import { generateIe as generateIeSample } from '../lib/generators/ie';
import { generatePixEvp as generatePixEvpSample } from '../lib/generators/pix';
import { generatePisPasep as generatePisPasepSample } from '../lib/generators/pis-pasep';
import { generatePlaca as generatePlacaSample } from '../lib/generators/placa';
import { generateTelefone as generateTelefoneSample } from '../lib/generators/telefone';

describe('playground generators', () => {
  it('generates valid CPF', () => {
    const value = generateCpf();
    expect(validateCpf(value).ok).toBe(true);
  });

  it('generates valid CNPJ', () => {
    const value = generateCnpj();
    expect(validateCnpj(value).ok).toBe(true);
  });

  it('generates valid CEP format', () => {
    const value = generateCep();
    expect(validateCep(value).ok).toBe(true);
  });

  it('generates valid PIS/PASEP', () => {
    const value = generatePisPasepSample();
    expect(validatePisPasep(value).ok).toBe(true);
  });

  it('generates valid PIX EVP key', () => {
    const value = generatePixEvpSample();
    expect(validatePixKey(value).ok).toBe(true);
  });

  it('generates valid Mercosul plate', () => {
    const value = generatePlacaSample('mercosul');
    expect(validatePlaca(value).ok).toBe(true);
  });

  it('generates valid phone', () => {
    const value = generateTelefoneSample();
    expect(validateTelefone(value).ok).toBe(true);
  });

  it('generates valid credit card', () => {
    const value = generateCreditCard();
    expect(validateCartaoCredito(value).ok).toBe(true);
  });

  it('returns valid IE sample for each UF', () => {
    for (const uf of IE_SUPPORTED_UFS) {
      const value = generateIeSample(uf);
      expect(validateInscricaoEstadual(value, { uf }).ok).toBe(true);
    }
  });

  it('keeps supported BR Code and boleto samples valid', () => {
    expect(parseBrCode(BRCODE_GOLDEN_STATIC_EVP).ok).toBe(true);
    expect(validateBoleto(BOLETO_GOLDEN_LINHA_MASKED).ok).toBe(true);
  });
});
