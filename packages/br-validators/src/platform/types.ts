import type { SanitizableDocumentType } from '../sanitize/index.js';

/** Document types supported by compare, batch, and diff platform APIs. */
export type PlatformDocumentType = SanitizableDocumentType | 'pix' | 'brcode';

export const PLATFORM_DOCUMENT_TYPES = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'telefone',
  'cnh',
  'renavam',
  'titulo-eleitor',
  'nfe-chave',
  'boleto',
  'cartao-credito',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'pix',
  'brcode',
] as const satisfies readonly PlatformDocumentType[];

export type PlatformOptions = {
  uf?: import('../types/validation-result.js').UfCode;
};

export function isPlatformDocumentType(type: string): type is PlatformDocumentType {
  return (PLATFORM_DOCUMENT_TYPES as readonly string[]).includes(type);
}
