/**
 * Minas Gerais IE validation — 13 digits, alternate mod11.
 * @see BR-IE-MG-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeMgFirstCheckDigit, computeIeMgSecondCheckDigit } from './modulo-ie.js';

const UF = 'MG' as const;
const LENGTH = 13;

export function stripIeMg(input: string): string {
  return stripIeDigits(input);
}

export function validateIeMg(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeMg(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `MG Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const body = stripped.slice(0, 11);
  const firstDig = computeIeMgFirstCheckDigit(body);
  const secondDig = computeIeMgSecondCheckDigit(body + String(firstDig));
  const checkDigits = `${firstDig}${secondDig}`;

  if (stripped.slice(-2) !== checkDigits) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'MG Inscrição Estadual check digits are invalid');
  }

  return ieSuccess(stripped, UF);
}
