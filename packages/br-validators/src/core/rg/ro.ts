/**
 * Rondônia RG — format-only (legacy IIRP/PC-RO numbering: 9 digits).
 * PC-RO does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.policiacivil.ro.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'RO' as const;
const RULES = RG_UF_RULES.RO;

export function stripRgRo(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgRo(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'RO RG contains invalid characters');
  }

  const canonical = stripRgRo(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `RO RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
