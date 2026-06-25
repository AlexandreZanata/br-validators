import { BOLETO_CODIGO_BARRAS_LENGTH, BOLETO_LINHA_LENGTH } from '../core/boleto/constants.js';
import { CARTAO_PAN_MAX_LENGTH, CARTAO_PAN_MIN_LENGTH } from '../core/cartao-credito/constants.js';
import { EAN_13_LENGTH, EAN_8_LENGTH } from '../core/ean/constants.js';
import { CNPJ_LENGTH } from '../core/cnpj/constants.js';
import { NFE_CHAVE_LENGTH } from '../core/nfe-chave/constants.js';
import { PROCESSO_JUDICIAL_LENGTH, PROCESSO_JUDICIAL_MASKED_PATTERN } from '../core/processo-judicial/constants.js';
import { PLACA_LENGTH } from '../core/placa/constants.js';
import { detectBoletoInputKind } from '../core/boleto/detect.js';
import { isSpRuralIeInput } from '../core/inscricao-estadual/sp-rural.js';

export function stripDigits(input: string): string {
  return input.replace(/\D/g, '');
}

export function stripAlnumUpper(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function hasLetters(input: string): boolean {
  return /[A-Za-z]/.test(input);
}

export function looksLikeBrCode(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.startsWith('00020') && trimmed.length > 20;
}

export function looksLikeBoleto(input: string): boolean {
  const kind = detectBoletoInputKind(input);
  return kind === 'linha-digitavel' || kind === 'codigo-barras';
}

export function isBoletoArrecadacao(input: string): boolean {
  return detectBoletoInputKind(input) === 'arrecadacao';
}

export function looksLikeNfeChave(input: string): boolean {
  const digits = stripDigits(input);
  return digits.length === NFE_CHAVE_LENGTH && /^\d+$/.test(digits);
}

export function looksLikeCnpjNumeric(input: string): boolean {
  const digits = stripDigits(input);
  return digits.length === CNPJ_LENGTH && /^\d+$/.test(digits);
}

export function looksLikeCnpjAlphanumeric(input: string): boolean {
  const stripped = stripAlnumUpper(input);
  return stripped.length === CNPJ_LENGTH && hasLetters(input);
}

export function looksLikeElevenDigits(input: string): boolean {
  const digits = stripDigits(input);
  return digits.length === 11 && /^\d+$/.test(digits);
}

export function looksLikeTituloEleitor(input: string): boolean {
  const digits = stripDigits(input);
  return digits.length === 12 && /^\d+$/.test(digits);
}

export function looksLikeCep(input: string): boolean {
  const digits = stripDigits(input);
  return digits.length === 8 && /^\d+$/.test(digits);
}

export function looksLikePlaca(input: string): boolean {
  const stripped = stripAlnumUpper(input);
  return stripped.length === PLACA_LENGTH && /^[A-Z0-9]+$/.test(stripped);
}

export function looksLikeCartao(input: string): boolean {
  const withoutMask = input.replace(/[\s-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return false;
  }
  const digits = stripDigits(input);
  return digits.length >= CARTAO_PAN_MIN_LENGTH && digits.length <= CARTAO_PAN_MAX_LENGTH;
}

export function looksLikeEan(input: string): boolean {
  const withoutMask = input.replace(/[\s-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return false;
  }
  const digits = stripDigits(input);
  return digits.length === EAN_8_LENGTH || digits.length === EAN_13_LENGTH;
}

export function looksLikeIe(input: string, uf?: string): boolean {
  if (!uf) {
    return false;
  }
  if (uf === 'SP' && isSpRuralIeInput(input)) {
    return true;
  }
  const digits = stripDigits(input);
  return digits.length >= 8 && digits.length <= 14;
}

export function looksLikePix(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return true;
  }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return true;
  }
  if (/^\+?\d/.test(trimmed)) {
    const digits = stripDigits(trimmed);
    return digits.length === 11 || digits.length === 14;
  }
  return false;
}

export function looksLikeTelefone(input: string): boolean {
  const digits = stripDigits(input);
  return digits.length >= 10 && digits.length <= 13;
}

export function looksLikeProcessoJudicial(input: string): boolean {
  const trimmed = input.trim();
  if (PROCESSO_JUDICIAL_MASKED_PATTERN.test(trimmed)) {
    return true;
  }
  const digits = stripDigits(trimmed);
  return digits.length === PROCESSO_JUDICIAL_LENGTH && /^\d+$/.test(digits);
}

export {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_LINHA_LENGTH,
};
