/**
 * CFOP format + embedded table validation.
 * @see https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente
 */

import { fiscalValidationFromLookup } from '../lookup/fiscal-validation.js';
import type { FiscalCodeValidationResult } from '../types/fiscal-code-result.js';
import { lookupCfopPorCodigo } from './lookup.js';

/** Common CFOP display — X.XXX (4 digits). */
export function formatCfopDisplay(codigo: string): string {
  return `${codigo.slice(0, 1)}.${codigo.slice(1)}`;
}

export function validateCfop(raw: string): FiscalCodeValidationResult {
  return fiscalValidationFromLookup(lookupCfopPorCodigo(raw), formatCfopDisplay);
}

export function isValidCfop(raw: string): boolean {
  return validateCfop(raw).ok;
}
