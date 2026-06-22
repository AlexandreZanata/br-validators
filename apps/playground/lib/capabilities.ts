import type { DocumentSlug } from './nav';

export type ActionTab = 'validate' | 'format' | 'strip' | 'sanitize' | 'generate';

export type DocumentCapabilities = {
  validate: boolean;
  format: boolean;
  strip: boolean;
  sanitize: boolean;
  generate: boolean;
  parse?: boolean;
  convert?: boolean;
  qrCode?: boolean;
  ufSelector?: boolean;
  multiline?: boolean;
  generateFormats?: readonly string[];
};

export const CAPABILITIES: Record<DocumentSlug, DocumentCapabilities> = {
  cpf: { validate: true, format: true, strip: true, sanitize: true, generate: true },
  cnpj: {
    validate: true,
    format: true,
    strip: true,
    sanitize: true,
    generate: true,
    generateFormats: ['numeric', 'alphanumeric'],
  },
  cep: { validate: true, format: true, strip: true, sanitize: true, generate: true },
  telefone: {
    validate: true,
    format: true,
    strip: true,
    sanitize: true,
    generate: true,
    generateFormats: ['celular', 'fixo'],
  },
  placa: {
    validate: true,
    format: true,
    strip: true,
    sanitize: true,
    generate: true,
    convert: true,
    generateFormats: ['mercosul', 'legacy'],
  },
  pis: { validate: true, format: true, strip: true, sanitize: true, generate: true },
  cnh: { validate: true, format: true, strip: true, sanitize: true, generate: true },
  renavam: { validate: true, format: true, strip: true, sanitize: true, generate: true },
  'titulo-eleitor': { validate: true, format: true, strip: true, sanitize: true, generate: false },
  'nfe-chave': { validate: true, format: true, strip: true, sanitize: true, generate: false, parse: true },
  ie: { validate: true, format: true, strip: true, sanitize: true, generate: true, ufSelector: true },
  pix: { validate: true, format: true, strip: false, sanitize: false, generate: true },
  brcode: { validate: true, format: false, strip: false, sanitize: false, generate: false, parse: true, multiline: true },
  boleto: { validate: true, format: true, strip: true, sanitize: true, generate: false, convert: true, multiline: true },
  cartao: { validate: true, format: true, strip: true, sanitize: true, generate: true },
};

export function enabledTabs(capabilities: DocumentCapabilities): ActionTab[] {
  const tabs: ActionTab[] = [];
  if (capabilities.validate) tabs.push('validate');
  if (capabilities.format) tabs.push('format');
  if (capabilities.strip) tabs.push('strip');
  if (capabilities.sanitize) tabs.push('sanitize');
  if (capabilities.generate) tabs.push('generate');
  return tabs;
}
