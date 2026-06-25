/**
 * Format decorator — union entrypoint (UC-003).
 * @see docs/use-cases/UC-003-format-document.md
 */
import type { FormatResult } from '../types/validation-result.js';
import { formatBoleto } from './boleto.js';
import { formatCartaoCredito } from './cartao-credito.js';
import { formatEan } from './ean.js';
import { formatCep } from './cep.js';
import { formatCnpj } from './cnpj.js';
import { formatCpf } from './cpf.js';
import { formatPisPasep } from './pis-pasep.js';
import { formatPixKey } from './pix.js';
import { formatPlaca } from './placa.js';

export type FormattableDocumentType =
  | 'cpf'
  | 'cnpj'
  | 'cep'
  | 'placa'
  | 'pis-pasep'
  | 'pix'
  | 'boleto'
  | 'cartao-credito'
  | 'ean';

export const FORMATTABLE_DOCUMENT_TYPES = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'pix',
  'boleto',
  'cartao-credito',
  'ean',
] as const satisfies readonly FormattableDocumentType[];

export function isFormattableDocumentType(type: string): type is FormattableDocumentType {
  return (FORMATTABLE_DOCUMENT_TYPES as readonly string[]).includes(type);
}

export function formatDocument(type: FormattableDocumentType, input: string): FormatResult {
  switch (type) {
    case 'cpf':
      return formatCpf(input);
    case 'cnpj':
      return formatCnpj(input);
    case 'cep':
      return formatCep(input);
    case 'placa':
      return formatPlaca(input);
    case 'pis-pasep':
      return formatPisPasep(input);
    case 'pix':
      return formatPixKey(input);
    case 'boleto':
      return formatBoleto(input);
    case 'cartao-credito':
      return formatCartaoCredito(input);
    case 'ean':
      return formatEan(input);
  }
}

/** Runtime guard for dynamic callers (non-exhaustive type string). */
export function formatDocumentRuntime(type: string, input: string): FormatResult {
  if (!isFormattableDocumentType(type)) {
    return { ok: false, code: 'UNSUPPORTED_FORMAT', message: `Unknown document type: ${type}` };
  }
  return formatDocument(type, input);
}
