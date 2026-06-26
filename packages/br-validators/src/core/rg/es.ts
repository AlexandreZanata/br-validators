/**
 * Espírito Santo RG — format-only (legacy PCIES numbering: 9 digits).
 * PCIES does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://pci.es.gov.br/perguntas-frequentes
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'ES' as const;
const RULES = RG_UF_RULES.ES;

export function stripRgEs(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgEs(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'ES RG contains invalid characters');
  }

  const canonical = stripRgEs(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `ES RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
