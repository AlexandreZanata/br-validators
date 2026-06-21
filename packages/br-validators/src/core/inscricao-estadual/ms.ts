/**
 * Mato Grosso do Sul IE validation — prefix 28 + CE mod11.
 * @see BR-IE-MS-001
 */
import type { InscricaoEstadualValidationResult } from '../../types/validation-result.js';
import { IE_MS_PREFIX } from './constants.js';
import { validateIeCe } from './ce.js';
import {
  checkDigitChars,
  checkTrimmedEmpty,
  ieFailure,
  stripIeDigits,
} from './ie-common.js';

const UF = 'MS' as const;

export function stripIeMs(input: string): string {
  return stripIeDigits(input);
}

export function validateIeMs(input: string): InscricaoEstadualValidationResult {
  const trimmed = input.trim();
  const empty = checkTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  const invalidChar = checkDigitChars(trimmed, UF);
  if (invalidChar) return invalidChar;

  const stripped = stripIeMs(trimmed);
  if (!stripped.startsWith(IE_MS_PREFIX)) {
    return ieFailure(UF, 'UNSUPPORTED_FORMAT', 'MS Inscrição Estadual must start with prefix 28');
  }

  const ceResult = validateIeCe(stripped);
  if (!ceResult.ok) {
    return { ...ceResult, uf: UF };
  }
  return { ...ceResult, uf: UF };
}
