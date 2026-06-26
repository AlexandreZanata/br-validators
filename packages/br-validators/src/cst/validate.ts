/**
 * CST format + embedded SPED table validation.
 * @see http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal
 */

import { fiscalValidationFromLookup } from '../lookup/fiscal-validation.js';
import type { FiscalCodeValidationResult } from '../types/fiscal-code-result.js';
import {
  lookupCstCofinsPorCodigo,
  lookupCstIcmsPorCodigo,
  lookupCstIpiPorCodigo,
  lookupCstPisPorCodigo,
} from './lookup.js';
import type { LookupResult } from '../types/lookup-result.js';
import type { Cst } from './types.js';

export type CstTax = 'icms' | 'ipi' | 'pis' | 'cofins';

function lookupCstByTax(tax: CstTax, raw: string): LookupResult<Cst> {
  switch (tax) {
    case 'icms':
      return lookupCstIcmsPorCodigo(raw);
    case 'ipi':
      return lookupCstIpiPorCodigo(raw);
    case 'pis':
      return lookupCstPisPorCodigo(raw);
    case 'cofins':
      return lookupCstCofinsPorCodigo(raw);
  }
}

export function validateCst(raw: string, options: { tax: CstTax }): FiscalCodeValidationResult {
  return fiscalValidationFromLookup(lookupCstByTax(options.tax, raw));
}

export function isValidCst(raw: string, options: { tax: CstTax }): boolean {
  return validateCst(raw, options).ok;
}
