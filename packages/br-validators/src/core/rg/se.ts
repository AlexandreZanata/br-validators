/**
 * Sergipe RG — format-only (legacy IIRSE numbering: 9 digits).
 * IIRSE does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.policiacivil.se.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'SE' as const;
const RULES = RG_UF_RULES.SE;

export function stripRgSe(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgSe(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'SE RG contains invalid characters');
  }

  const canonical = stripRgSe(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `SE RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
