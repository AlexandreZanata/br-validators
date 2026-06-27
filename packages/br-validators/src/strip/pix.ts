/**
 * PIX key normalization before validate (BR-PIX-001).
 * @see docs/use-cases/UC-005-validate-pix-key.md
 */
import { detectPixKeyType } from '../core/pix/detect.js';
import { PIX_EVP_PATTERN } from '../core/pix/constants.js';
import { stripCnpj } from './cnpj.js';
import { stripCpf } from './cpf.js';

function isEvpShaped(input: string): boolean {
  const trimmed = input.trim();
  if (PIX_EVP_PATTERN.test(trimmed)) {
    return true;
  }
  return /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/.test(trimmed);
}

function stripPixPhone(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }
  return trimmed.replace(/[\s()-]/g, '');
}

export function stripPixKey(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return '';
  }

  if (isEvpShaped(trimmed)) {
    return trimmed.toLowerCase();
  }

  const keyType = detectPixKeyType(trimmed);
  switch (keyType) {
    case 'email':
      return trimmed.toLowerCase();
    case 'phone':
      return stripPixPhone(trimmed);
    case 'cpf':
      return stripCpf(trimmed);
    case 'cnpj':
      return stripCnpj(trimmed);
    default:
      return trimmed;
  }
}
