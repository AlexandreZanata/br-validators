/**
 * Pará IE validation — prefix 15 + CE mod11.
 * @see BR-IE-PA-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_PA_PREFIX } from './constants.js';
import { validateIeCe } from './ce.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  stripIeDigits,
} from './ie-common.js';

const UF = 'PA' as const;

export function stripIePa(input: string): string {
  return stripIeDigits(input);
}

export function validateIePa(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIePa(trimmed);
  if (!stripped.startsWith(IE_PA_PREFIX)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'PA Inscrição Estadual must start with prefix 15');
  }

  const ceResult = validateIeCe(stripped);
  if (!ceResult.ok) {
    return { ...ceResult, uf: UF };
  }
  return { ...ceResult, uf: UF };
}
