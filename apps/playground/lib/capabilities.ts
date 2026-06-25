import { RG_SUPPORTED_UFS, type UfCode } from '@br-validators/core';
import type { DocumentSlug } from './nav';

export type ActionTab = 'validate' | 'format' | 'strip' | 'sanitize';

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
  /** When set, UF dropdown lists only these codes (defaults to all 27 UFs). */
  supportedUfs?: readonly UfCode[];
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
    ufSelector: true,
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
  'titulo-eleitor': { validate: true, format: true, strip: true, sanitize: true, generate: true, ufSelector: true },
  'processo-judicial': { validate: true, format: true, strip: true, sanitize: true, generate: false, parse: true },
  rg: {
    validate: true,
    format: true,
    strip: true,
    sanitize: true,
    generate: false,
    ufSelector: true,
    supportedUfs: RG_SUPPORTED_UFS,
  },
  'nfe-chave': { validate: true, format: true, strip: true, sanitize: true, generate: true, parse: true },
  ie: { validate: true, format: true, strip: true, sanitize: true, generate: true, ufSelector: true },
  pix: { validate: true, format: true, strip: false, sanitize: false, generate: true },
  brcode: { validate: true, format: false, strip: false, sanitize: false, generate: false, parse: true, multiline: true },
  boleto: { validate: true, format: true, strip: true, sanitize: true, generate: true, convert: true, multiline: true },
  cartao: {
    validate: true,
    format: true,
    strip: true,
    sanitize: true,
    generate: true,
    generateFormats: ['visa', 'mastercard', 'amex', 'elo', 'hipercard'],
  },
  ean: {
    validate: true,
    format: true,
    strip: true,
    sanitize: true,
    generate: false,
  },
};

export function enabledTabs(capabilities: DocumentCapabilities): ActionTab[] {
  const tabs: ActionTab[] = [];
  if (capabilities.validate) tabs.push('validate');
  if (capabilities.format) tabs.push('format');
  if (capabilities.strip) tabs.push('strip');
  if (capabilities.sanitize) tabs.push('sanitize');
  return tabs;
}
