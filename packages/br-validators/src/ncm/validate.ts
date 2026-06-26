/**
 * NCM format + embedded table validation.
 * @see https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias
 */

import { fiscalValidationFromLookup } from '../lookup/fiscal-validation.js';
import type { FiscalCodeValidationResult } from '../types/fiscal-code-result.js';
import { lookupNcmPorCodigo } from './lookup.js';

/** Official NCM display mask — XXXX.XX.XX (8 digits). */
export function formatNcmDisplay(codigo: string): string {
  return `${codigo.slice(0, 4)}.${codigo.slice(4, 6)}.${codigo.slice(6, 8)}`;
}

export function validateNcm(raw: string): FiscalCodeValidationResult {
  return fiscalValidationFromLookup(lookupNcmPorCodigo(raw), formatNcmDisplay);
}

export function isValidNcm(raw: string): boolean {
  return validateNcm(raw).ok;
}
