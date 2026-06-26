/**
 * Mato Grosso RG — format-only (legacy POLITEC numbering: 9 digits).
 * POLITEC does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.politec.mt.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'MT' as const;
const RULES = RG_UF_RULES.MT;

export function stripRgMt(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgMt(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'MT RG contains invalid characters');
  }

  const canonical = stripRgMt(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `MT RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
