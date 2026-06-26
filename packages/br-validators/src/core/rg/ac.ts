/**
 * Acre RG — format-only (legacy SSP-AC numbering: 6 digits).
 * SSP-AC does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.policiacivil.ac.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'AC' as const;
const RULES = RG_UF_RULES.AC;

export function stripRgAc(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgAc(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'AC RG contains invalid characters');
  }

  const canonical = stripRgAc(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `AC RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
