/**
 * Rio de Janeiro IE validation — 8 digits, cyclic weights 2,7,6,5,4,3,2.
 * @see BR-IE-RJ-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeCyclicMod11CheckDigit } from './modulo-ie.js';

const UF = 'RJ' as const;
const LENGTH = 8;

export function stripIeRj(input: string): string {
  return stripIeDigits(input);
}

export function validateIeRj(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeRj(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `RJ Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const body = stripped.slice(0, 7);
  const expected = computeIeCyclicMod11CheckDigit(body, 2, 7);
  if (Number(stripped.charAt(7)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'RJ Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
