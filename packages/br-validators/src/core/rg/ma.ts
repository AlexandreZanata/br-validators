/**
 * Maranhão RG — format-only (legacy Ident-MA numbering: 9 digits).
 * Ident-MA does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://www.ma.gov.br/servicos/obter-1-via-do-rg-agendamento-on-line
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'MA' as const;
const RULES = RG_UF_RULES.MA;

export function stripRgMa(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgMa(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'MA RG contains invalid characters');
  }

  const canonical = stripRgMa(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `MA RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
