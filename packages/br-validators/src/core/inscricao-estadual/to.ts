/**
 * Tocantins IE validation — 9 or 11 digits (legacy pre-2003).
 * @see BR-IE-TO-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_TO_LEGACY_PREFIXES } from './constants.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  ieSuccess,
  stripIeDigits,
} from './ie-common.js';
import { computeIeToCheckDigit } from './modulo-ie.js';

const UF = 'TO' as const;

export function stripIeTo(input: string): string {
  return stripIeDigits(input);
}

export function validateIeTo(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeTo(trimmed);
  if (stripped.length !== 9 && stripped.length !== 11) {
    return ieFailure(UF, 'INVALID_LENGTH', 'TO Inscrição Estadual must have 9 or 11 digits after normalization');
  }

  let body: string;
  if (stripped.length === 11) {
    const midPrefix = stripped.slice(2, 4);
    if (!(IE_TO_LEGACY_PREFIXES as readonly string[]).includes(midPrefix)) {
      return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'TO legacy 11-digit IE middle prefix is not supported');
    }
    body = stripped.slice(0, 2) + stripped.slice(4, 10);
  } else {
    body = stripped.slice(0, 8);
  }

  const expected = computeIeToCheckDigit(body);
  if (Number(stripped.slice(-1)) !== expected) {
    return ieFailure(UF, 'INVALID_CHECK_DIGIT', 'TO Inscrição Estadual check digit is invalid');
  }

  return ieSuccess(stripped, UF);
}
