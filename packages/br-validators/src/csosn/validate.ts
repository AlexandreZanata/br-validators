/**
 * CSOSN format + embedded table validation.
 * @see https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/a03_10
 */

import { fiscalValidationFromLookup } from '../lookup/fiscal-validation.js';
import type { FiscalCodeValidationResult } from '../types/fiscal-code-result.js';
import { lookupCsosnPorCodigo } from './lookup.js';

export function validateCsosn(raw: string): FiscalCodeValidationResult {
  return fiscalValidationFromLookup(lookupCsosnPorCodigo(raw), (codigo) => codigo);
}

export function isValidCsosn(raw: string): boolean {
  return validateCsosn(raw).ok;
}
