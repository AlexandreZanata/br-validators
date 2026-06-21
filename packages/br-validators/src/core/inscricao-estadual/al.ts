/**
 * Alagoas IE validation — 9 digits, prefix 24, mod11 (SEFAZ-AL).
 * @see BR-IE-AL-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_AL_PREFIX } from './constants.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeAlCheckDigit } from './modulo-ie.js';

const UF = 'AL' as const;
const LENGTH = 9;

export function stripIeAl(input: string): string {
  return stripIeDigits(input);
}

export function validateIeAl(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeAl(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `AL Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  if (!stripped.startsWith(IE_AL_PREFIX)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'AL Inscrição Estadual must start with prefix 24');
  }

  const body = stripped.slice(0, 8);
  const expected = computeIeAlCheckDigit(body);
  if (Number(stripped.charAt(8)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'AL Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
