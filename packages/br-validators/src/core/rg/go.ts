/**
 * Goiás RG — format-only (legacy PCGO numbering: 9 digits).
 * Superintendência de Identificação Humana does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://identificacao.policiacivil.go.gov.br/1a-via-do-rg-goias/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'GO' as const;
const RULES = RG_UF_RULES.GO;

export function stripRgGo(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgGo(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'GO RG contains invalid characters');
  }

  const canonical = stripRgGo(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `GO RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
