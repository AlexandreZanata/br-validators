/**
 * Rio Grande do Norte IE validation — 9 digits, prefix 20, fixed weights 9..2.
 * @see BR-IE-RN-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_RN_PREFIX } from './constants.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';

const UF = 'RN' as const;
const LENGTH = 9;
const RN_WEIGHTS = [9, 8, 7, 6, 5, 4, 3, 2] as const;

export function stripIeRn(input: string): string {
  return stripIeDigits(input);
}

function computeRnCheckDigit(body8: string): number {
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += Number(body8[i]) * RN_WEIGHTS[i];
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

export function validateIeRn(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeRn(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `RN Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  if (!stripped.startsWith(IE_RN_PREFIX)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'RN Inscrição Estadual must start with prefix 20');
  }

  const body = stripped.slice(0, 8);
  const expected = computeRnCheckDigit(body);
  if (Number(stripped.charAt(8)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'RN Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
