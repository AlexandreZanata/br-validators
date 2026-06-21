/**
 * Amazonas IE validation — 9 digits, prefix 04.
 * @see BR-IE-AM-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeAmCheckDigit } from './modulo-ie.js';

const UF = 'AM' as const;
const LENGTH = 9;

export function stripIeAm(input: string): string {
  return stripIeDigits(input);
}

export function validateIeAm(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeAm(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `AM Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const body = stripped.slice(0, 8);
  const expected = computeIeAmCheckDigit(body);
  if (Number(stripped.charAt(8)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'AM Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
