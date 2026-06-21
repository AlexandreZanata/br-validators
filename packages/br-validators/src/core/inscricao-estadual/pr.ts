/**
 * Paraná IE validation — 10 digits, dual mod11 DVs.
 * @see BR-IE-PR-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIePrStyleCheckDigit } from './modulo-ie.js';

const UF = 'PR' as const;
const LENGTH = 10;

export function stripIePr(input: string): string {
  return stripIeDigits(input);
}

export function validateIePr(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIePr(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `PR Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const body = stripped.slice(0, 8);
  const firstDig = computeIePrStyleCheckDigit(body);
  const secondDig = computeIePrStyleCheckDigit(body + String(firstDig));
  const checkDigits = `${firstDig}${secondDig}`;

  if (stripped.slice(-2) !== checkDigits) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'PR Inscrição Estadual check digits are invalid');
  }

  return ieSuccess(stripped, UF);
}
