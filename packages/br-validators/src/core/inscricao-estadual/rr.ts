/**
 * Roraima IE validation — 9 digits, prefix 24, mod9.
 * @see BR-IE-RR-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_RR_PREFIX } from './constants.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeRrCheckDigit } from './modulo-ie.js';

const UF = 'RR' as const;
const LENGTH = 9;

export function stripIeRr(input: string): string {
  return stripIeDigits(input);
}

export function validateIeRr(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeRr(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `RR Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  if (!stripped.startsWith(IE_RR_PREFIX)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'RR Inscrição Estadual must start with prefix 24');
  }

  const body = stripped.slice(0, 8);
  const expected = computeIeRrCheckDigit(body);
  if (Number(stripped.charAt(8)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'RR Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
