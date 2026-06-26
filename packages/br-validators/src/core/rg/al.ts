/**
 * Alagoas RG — format-only (legacy IIEAL numbering: 7 digits).
 * POLCAL / Instituto de Identificação does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://alagoasdigital.al.gov.br/servico/8
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'AL' as const;
const RULES = RG_UF_RULES.AL;

export function stripRgAl(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgAl(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'AL RG contains invalid characters');
  }

  const canonical = stripRgAl(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `AL RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
