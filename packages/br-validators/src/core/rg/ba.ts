/**
 * Bahia RG — format-only (legacy IIPM numbering: 10 digits).
 * SSP-BA / IIPM does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.ba.gov.br/policiatecnica/972/instituto-de-identificacao-pedro-mello-iipm
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'BA' as const;
const RULES = RG_UF_RULES.BA;

export function stripRgBa(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgBa(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'BA RG contains invalid characters');
  }

  const canonical = stripRgBa(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `BA RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
