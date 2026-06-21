/**
 * Espírito Santo IE validation — 9 digits, CE mod11 roteiro.
 * @see BR-IE-ES-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { validateIeCe } from './ce.js';
import { checkDigitChars, checkTrimmedEmpty, stripIeDigits } from './ie-common.js';

const UF = 'ES' as const;

export function stripIeEs(input: string): string {
  return stripIeDigits(input);
}

export function validateIeEs(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const ceResult = validateIeCe(stripIeEs(trimmed));
  if (!ceResult.ok) {
    return { ...ceResult, uf: UF };
  }
  return { ...ceResult, uf: UF };
}
