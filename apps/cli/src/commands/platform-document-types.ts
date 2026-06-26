/** Mirrors `@br-validators/core` `PLATFORM_DOCUMENT_TYPES` for CLI guards. */
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
  'processo-judicial',
  'rg',
  'nfe-chave',
  'boleto',
  'cartao-credito',
  'ean',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'pix',
  'brcode',
] as const;

export type PlatformDocumentType = (typeof PLATFORM_DOCUMENT_TYPES)[number];

export function isPlatformDocumentType(type: string): type is PlatformDocumentType {
  return (PLATFORM_DOCUMENT_TYPES as readonly string[]).includes(type);
}
