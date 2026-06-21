/**
 * Rio Grande do Sul IE validation — 10 digits, cyclic weights 2,9,8,7,6,5,4,3,2.
 * @see BR-IE-RS-001
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

const UF = 'RS' as const;
const LENGTH = 10;

export function stripIeRs(input: string): string {
  return stripIeDigits(input);
}

export function validateIeRs(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF, /^[0-9.\-\s/]+$/);
  if (invalidChar) return invalidChar;

  const stripped = stripIeRs(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `RS Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const body = stripped.slice(0, 9);
  const expected = computeIeCyclicMod11CheckDigit(body, 2, 9);
  if (Number(stripped.charAt(9)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'RS Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
