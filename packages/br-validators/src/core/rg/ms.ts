/**
 * Mato Grosso do Sul RG — format-only (legacy Instituto de Identificação numbering: 9 digits).
 * SEJUSP/Polícia Científica does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://servicos.sejusp.ms.gov.br/
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'MS' as const;
const RULES = RG_UF_RULES.MS;

export function stripRgMs(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgMs(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'MS RG contains invalid characters');
  }

  const canonical = stripRgMs(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `MS RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
