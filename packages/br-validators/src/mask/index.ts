/**
 * Unified display mask — delegates to existing `format*` (BR-MASK-001).
 * @see docs/use-cases/UC-003-format-document.md
 * @see docs/OFFICIAL-SOURCES.md
 */
import { formatInscricaoEstadual } from '../core/inscricao-estadual/index.js';
import { formatBoleto } from '../format/boleto.js';
import { formatCartaoCredito } from '../format/cartao-credito.js';
import { formatEan } from '../format/ean.js';
import { formatCep } from '../format/cep.js';
import { formatCnh } from '../format/cnh.js';
import { formatCnpj } from '../format/cnpj.js';
import { formatCpf } from '../format/cpf.js';
import { formatIeProdutorRural } from '../format/inscricao-estadual-produtor-rural.js';
import { formatNfeChave } from '../format/nfe-chave.js';
import { formatPisPasep } from '../format/pis-pasep.js';
import { formatPixKey } from '../format/pix.js';
import { formatPlaca } from '../format/placa.js';
import { formatProcessoJudicial } from '../format/processo-judicial.js';
import { formatRg } from '../format/rg.js';
import { formatRenavam } from '../format/renavam.js';
import { formatTelefone } from '../format/telefone.js';
import { formatTituloEleitor } from '../format/titulo-eleitor.js';
import type { FormatResult, RgUfCode, UfCode } from '../types/validation-result.js';

export type MaskableDocumentType =
  | 'cpf'
  | 'cnpj'
  | 'cep'
  | 'placa'
  | 'pis-pasep'
  | 'telefone'
  | 'cnh'
  | 'renavam'
  | 'titulo-eleitor'
  | 'processo-judicial'
  | 'rg'
  | 'nfe-chave'
  | 'boleto'
  | 'cartao-credito'
  | 'ean'
  | 'inscricao-estadual'
  | 'inscricao-estadual-produtor-rural'
  | 'pix';

export const MASKABLE_DOCUMENT_TYPES = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'telefone',
  'cnh',
  'renavam',
  'titulo-eleitor',
  'processo-judicial',
  'rg',
  'nfe-chave',
  'boleto',
  'cartao-credito',
  'ean',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'pix',
] as const satisfies readonly MaskableDocumentType[];

export type MaskOptions = {
  uf?: UfCode;
};

export function isMaskableDocumentType(type: string): type is MaskableDocumentType {
  return (MASKABLE_DOCUMENT_TYPES as readonly string[]).includes(type);
}

export function mask(
  raw: string,
  type: MaskableDocumentType,
  options: MaskOptions = {},
): FormatResult {
  if (type === 'inscricao-estadual' && !options.uf) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'UF is required for inscricao-estadual masking',
    };
  }

  if (type === 'rg' && !options.uf) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'UF is required for RG masking',
    };
  }

  return dispatchMask(raw, type, options);
}

/** Runtime guard for dynamic callers (non-exhaustive type string). */
export function maskRuntime(
  type: string,
  raw: string,
  options: MaskOptions = {},
): FormatResult {
  if (!isMaskableDocumentType(type)) {
    return { ok: false, code: 'UNSUPPORTED_FORMAT', message: `Unknown document type: ${type}` };
  }
  return mask(raw, type, options);
}

function dispatchMask(raw: string, type: MaskableDocumentType, options: MaskOptions): FormatResult {
  switch (type) {
    case 'cpf':
      return formatCpf(raw);
    case 'cnpj':
      return formatCnpj(raw);
    case 'cep':
      return formatCep(raw);
    case 'placa':
      return formatPlaca(raw);
    case 'pis-pasep':
      return formatPisPasep(raw);
    case 'telefone':
      return formatTelefone(raw);
    case 'cnh':
      return formatCnh(raw);
    case 'renavam':
      return formatRenavam(raw);
    case 'titulo-eleitor':
      return formatTituloEleitor(raw);
    case 'processo-judicial':
      return formatProcessoJudicial(raw);
    case 'rg':
      return formatRg(raw, { uf: options.uf as RgUfCode });
    case 'nfe-chave':
      return formatNfeChave(raw);
    case 'boleto':
      return formatBoleto(raw);
    case 'cartao-credito':
      return formatCartaoCredito(raw);
    case 'ean':
      return formatEan(raw);
    case 'inscricao-estadual':
      return formatInscricaoEstadual(raw, { uf: options.uf as UfCode });
    case 'inscricao-estadual-produtor-rural':
      return formatIeProdutorRural(raw);
    case 'pix':
      return formatPixKey(raw);
    default: {
      const _exhaustive: never = type;
      return {
        ok: false,
        code: 'UNSUPPORTED_FORMAT',
        message: `Unsupported type: ${String(_exhaustive)}`,
      };
    }
  }
}
