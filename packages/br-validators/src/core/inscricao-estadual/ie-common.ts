/**
 * Shared helpers for per-UF IE validators.
 */
import type { InscricaoEstadualValidationResult, UfCode } from '../../types/validation-result.js';
import { brandInscricaoEstadual } from '../../types/validation-result.js';

export type IeFailedResult = Extract<InscricaoEstadualValidationResult, { ok: false }>;

export function stripIeDigits(input: string): string {
  return input.replace(/\D/g, '');
}

export function ieFailure(uf: UfCode, code: IeFailedResult['code'], message: string): IeFailedResult {
  return { ok: false, code, message, uf };
}

export function ieEmptyInput(uf: UfCode): IeFailedResult {
  return { ok: false, code: 'EMPTY_INPUT', message: 'Inscrição Estadual input is empty', uf };
}

export function ieSuccess(stripped: string, uf: UfCode): Extract<InscricaoEstadualValidationResult, { ok: true }> {
  return {
    ok: true,
    value: brandInscricaoEstadual(stripped),
    uf,
    format: 'inscricao-estadual',
  };
}

export function checkTrimmedEmpty(trimmed: string, uf: UfCode): IeFailedResult | null {
  if (trimmed.length === 0) {
    return ieEmptyInput(uf);
  }
  return null;
}

export function checkDigitChars(trimmed: string, uf: UfCode, pattern = /^[0-9.\-\s/]+$/): IeFailedResult | null {
  if (!pattern.test(trimmed)) {
    return ieFailure(uf, 'INVALID_CHARACTER', `${uf} Inscrição Estadual contains invalid characters`);
  }
  return null;
}
