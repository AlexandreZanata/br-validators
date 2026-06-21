/**
 * Ceará IE validation — 9 digits, mod11 (weights 9..2).
 * @see BR-IE-CE-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { computeIeCeCheckDigit } from './modulo-ie.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';

const UF = 'CE' as const;
const LENGTH = 9;

export function stripIeCe(input: string): string {
  return stripIeDigits(input);
}

export function validateIeCe(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeCe(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `CE Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const body = stripped.slice(0, 8);
  const expected = computeIeCeCheckDigit(body);
  if (Number(stripped.charAt(8)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'CE Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
