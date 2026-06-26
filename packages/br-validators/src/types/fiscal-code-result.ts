import type { LookupErrorCode } from './lookup-result.js';

/** Format + lookup validation for fiscal reference codes (NCM, CFOP, CST). */
export type FiscalCodeValidationResult =
  | { ok: true; value: string; description: string; format?: string }
  | { ok: false; code: LookupErrorCode; message: string };

export type FiscalCodeRow = {
  codigo: string;
  descricao: string;
};
