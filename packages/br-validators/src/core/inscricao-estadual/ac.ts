/**
 * Acre IE validation — 13 digits, prefix 01, dual mod11 DVs.
 * @see BR-IE-AC-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_AC_PREFIX } from './constants.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeAcCheckDigit } from './modulo-ie.js';

const UF = 'AC' as const;
const LENGTH = 13;

export function stripIeAc(input: string): string {
  return stripIeDigits(input);
}

export function validateIeAc(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeAc(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `AC Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  if (!stripped.startsWith(IE_AC_PREFIX)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'AC Inscrição Estadual must start with prefix 01');
  }

  const body = stripped.slice(0, 11);
  const firstDig = computeIeAcCheckDigit(body);
  const secondDig = computeIeAcCheckDigit(body + String(firstDig));
  const checkDigits = `${firstDig}${secondDig}`;

  if (stripped.slice(-2) !== checkDigits) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'AC Inscrição Estadual check digits are invalid');
  }

  return ieSuccess(stripped, UF);
}
