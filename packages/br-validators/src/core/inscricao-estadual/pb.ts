/** Paraíba — CE mod11 roteiro. */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { validateIeCe } from './ce.js';
import { checkDigitChars, checkTrimmedEmpty, stripIeDigits } from './ie-common.js';

const UF = 'PB' as const;

export function stripIePb(input: string): string {
  return stripIeDigits(input);
}

export function validateIePb(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;
  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;
  const ceResult = validateIeCe(stripIePb(trimmed));
  if (!ceResult.ok) return { ...ceResult, uf: UF };
  return { ...ceResult, uf: UF };
}
