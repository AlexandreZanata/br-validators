/**
 * Amapá IE validation — 9 digits, prefix 03, range-based constants.
 * @see BR-IE-AP-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_AP_PREFIX } from './constants.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeApCheckDigit } from './modulo-ie.js';

const UF = 'AP' as const;
const LENGTH = 9;

export function stripIeAp(input: string): string {
  return stripIeDigits(input);
}

export function validateIeAp(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeAp(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `AP Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  if (!stripped.startsWith(IE_AP_PREFIX)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'AP Inscrição Estadual must start with prefix 03');
  }

  const body = stripped.slice(0, 8);
  const expected = computeIeApCheckDigit(body);
  if (Number(stripped.charAt(8)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'AP Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
