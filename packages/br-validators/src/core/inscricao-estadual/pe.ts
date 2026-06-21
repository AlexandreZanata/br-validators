/**
 * Pernambuco IE validation — 9 digits, dual mod11 DVs.
 * @see BR-IE-PE-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIePeCheckDigit } from './modulo-ie.js';

const UF = 'PE' as const;
const LENGTH = 9;

export function stripIePe(input: string): string {
  return stripIeDigits(input);
}

export function validateIePe(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIePe(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `PE Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const body = stripped.slice(0, 7);
  const firstDig = computeIePeCheckDigit(body);
  const secondDig = computeIePeCheckDigit(body + String(firstDig));
  const checkDigits = `${firstDig}${secondDig}`;

  if (stripped.slice(-2) !== checkDigits) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'PE Inscrição Estadual check digits are invalid');
  }

  return ieSuccess(stripped, UF);
}
