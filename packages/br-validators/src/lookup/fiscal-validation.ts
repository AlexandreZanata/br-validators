import type { FiscalCodeRow, FiscalCodeValidationResult } from '../types/fiscal-code-result.js';
import type { LookupResult } from '../types/lookup-result.js';

export function fiscalValidationFromLookup(
  lookup: LookupResult<FiscalCodeRow>,
  formatDisplay?: (codigo: string) => string,
): FiscalCodeValidationResult {
  if (lookup.ok) {
    const format = formatDisplay?.(lookup.value.codigo);
    return {
      ok: true,
      value: lookup.value.codigo,
      description: lookup.value.descricao,
      ...(format !== undefined ? { format } : {}),
    };
  }

  return { ok: false, code: lookup.code, message: lookup.message };
}
