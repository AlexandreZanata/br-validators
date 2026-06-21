/**
 * Bahia IE validation — 8 or 9 digits, dual DV, mod10/mod11 by reference digit.
 * @see BR-IE-BA-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeBaCheckDigit, computeIeBaModule } from './modulo-ie.js';

const UF = 'BA' as const;

export function stripIeBa(input: string): string {
  return stripIeDigits(input);
}

export function validateIeBa(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeBa(trimmed);
  if (stripped.length !== 8 && stripped.length !== 9) {
    return ieFailure(UF, 'INVALID_LENGTH', 'BA Inscrição Estadual must have 8 or 9 digits after normalization');
  }

  const body = stripped.slice(0, stripped.length - 2);
  const mod = computeIeBaModule(stripped);
  const secondDig = computeIeBaCheckDigit(body, mod);
  const firstDig = computeIeBaCheckDigit(body + String(secondDig), mod);
  const checkDigits = `${firstDig}${secondDig}`;

  if (stripped.slice(-2) !== checkDigits) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'BA Inscrição Estadual check digits are invalid');
  }

  return ieSuccess(stripped, UF);
}
