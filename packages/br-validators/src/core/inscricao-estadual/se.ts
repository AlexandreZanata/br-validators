/** Sergipe — CE mod11 roteiro. */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { validateIeCe } from './ce.js';
import { checkDigitChars, checkTrimmedEmpty, stripIeDigits } from './ie-common.js';

const UF = 'SE' as const;

export function stripIeSe(input: string): string {
  return stripIeDigits(input);
}

export function validateIeSe(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;
  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;
  const ceResult = validateIeCe(stripIeSe(trimmed));
  if (!ceResult.ok) return { ...ceResult, uf: UF };
  return { ...ceResult, uf: UF };
}
