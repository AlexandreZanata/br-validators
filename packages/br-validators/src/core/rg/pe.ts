/**
 * Pernambuco RG — format-only (legacy IIP-PE numbering: 9 digits).
 * IIP-PE does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.policiacivil.pe.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'PE' as const;
const RULES = RG_UF_RULES.PE;

export function stripRgPe(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgPe(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'PE RG contains invalid characters');
  }

  const canonical = stripRgPe(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `PE RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
