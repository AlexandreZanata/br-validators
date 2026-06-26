/**
 * Ceará RG — format-only (legacy IPC-CE numbering: 9 digits on current cards).
 * IPC-CE does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.policiacivil.ce.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'CE' as const;
const RULES = RG_UF_RULES.CE;

export function stripRgCe(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgCe(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'CE RG contains invalid characters');
  }

  const canonical = stripRgCe(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `CE RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
