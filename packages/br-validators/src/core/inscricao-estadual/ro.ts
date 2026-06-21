/**
 * Rondônia IE validation — 14 digits.
 * @see BR-IE-RO-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeRoCheckDigit } from './modulo-ie.js';

const UF = 'RO' as const;
const LENGTH = 14;

export function stripIeRo(input: string): string {
  return stripIeDigits(input);
}

export function validateIeRo(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeRo(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `RO Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const body = stripped.slice(0, 13);
  const expected = computeIeRoCheckDigit(body);
  if (Number(stripped.charAt(13)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'RO Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
