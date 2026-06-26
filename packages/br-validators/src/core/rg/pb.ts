/**
 * Paraíba RG — format-only (legacy IPC-PB numbering: 9 digits).
 * Instituto de Polícia Científica does not publish a check-digit walkthrough (not in Ghiorzi DVnew.htm).
 * @see https://agendamentos.pb.gov.br/SAA/ipc/home
 */
import { RG_UF_RULES } from './constants.js';
import { checkRgTrimmedEmpty, rgFailure, rgSuccess } from './rg-common.js';
import type { RgValidationResult } from './types.js';

const UF = 'PB' as const;
const RULES = RG_UF_RULES.PB;

export function stripRgPb(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateRgPb(input: string): RgValidationResult {
  const trimmed = input.trim();
  const empty = checkRgTrimmedEmpty(trimmed, UF);
  if (empty) return empty;

  if (!/^[0-9.\-\s]+$/.test(trimmed)) {
    return rgFailure(UF, 'INVALID_CHARACTER', 'PB RG contains invalid characters');
  }

  const canonical = stripRgPb(trimmed);
  if (canonical.length !== RULES.canonicalLength) {
    return rgFailure(
      UF,
      'INVALID_LENGTH',
      `PB RG must have ${RULES.canonicalLength} digits after normalization`,
    );
  }

  return rgSuccess(canonical, UF, 'rg', false);
}
