/**
 * Amazonas RG — format-only (legacy IIACM numbering: 9 digits).
 * IIACM/SSP-AM does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.ssp.am.gov.br/instituto-de-identificacao-tira-duvidas-sobre-emissao-de-documentos/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'AM' as const;
const RULES = RG_UF_RULES.AM;

export function stripRgAm(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgAm(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'AM RG contains invalid characters');
  }

  const canonical = stripRgAm(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `AM RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
