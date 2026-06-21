/**
 * Maranhão IE validation — prefix 12 + CE mod11.
 * @see BR-IE-MA-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_MA_PREFIX } from './constants.js';
import { validateIeCe } from './ce.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  stripIeDigits,
} from './ie-common.js';

const UF = 'MA' as const;

export function stripIeMa(input: string): string {
  return stripIeDigits(input);
}

export function validateIeMa(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeMa(trimmed);
  if (!stripped.startsWith(IE_MA_PREFIX)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'MA Inscrição Estadual must start with prefix 12');
  }

  const ceResult = validateIeCe(stripped);
  if (!ceResult.ok) {
    return { ...ceResult, uf: UF };
  }
  return { ...ceResult, uf: UF };
}
