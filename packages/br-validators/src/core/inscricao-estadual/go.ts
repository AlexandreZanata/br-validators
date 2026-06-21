/**
 * Goiás IE validation — 9 digits, prefixes 10/11/15/20.
 * @see BR-IE-GO-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_GO_PREFIXES } from './constants.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeGoCheckDigit } from './modulo-ie.js';

const UF = 'GO' as const;
const LENGTH = 9;

export function stripIeGo(input: string): string {
  return stripIeDigits(input);
}

export function validateIeGo(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeGo(trimmed);
  if (stripped.length !== LENGTH) {
    return ieFailure(UF, 'INVALID_LENGTH', `GO Inscrição Estadual must have ${LENGTH} digits after normalization`);
  }

  const prefix = stripped.slice(0, 2);
  if (!(IE_GO_PREFIXES as readonly string[]).includes(prefix)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'GO Inscrição Estadual prefix is not supported');
  }

  const body = stripped.slice(0, 8);
  const expected = computeIeGoCheckDigit(body);
  if (Number(stripped.charAt(8)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'GO Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
