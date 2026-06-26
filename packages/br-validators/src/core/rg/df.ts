/**
 * Distrito Federal RG — format-only (legacy PCDF numbering: 7 digits).
 * PCDF does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.nahora.df.gov.br/policia_civil/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'DF' as const;
const RULES = RG_UF_RULES.DF;

export function stripRgDf(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgDf(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'DF RG contains invalid characters');
  }

  const canonical = stripRgDf(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `DF RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
