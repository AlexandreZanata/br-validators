import { stripCep } from '../strip/cep.js';
import { stripCnh } from '../strip/cnh.js';
import { stripCnpj } from '../strip/cnpj.js';
import { stripCpf } from '../strip/cpf.js';
import { stripIeSpRural } from '../strip/inscricao-estadual-produtor-rural.js';
import { stripInscricaoEstadual } from '../core/inscricao-estadual/index.js';
import { stripNfeChave } from '../strip/nfe-chave.js';
import { stripPisPasep } from '../strip/pis-pasep.js';
import { stripPlaca } from '../strip/placa.js';
import { stripPixKey } from '../strip/pix.js';
import { stripProcessoJudicial } from '../strip/processo-judicial.js';
import { stripRenavam } from '../strip/renavam.js';
import { stripTituloEleitor } from '../strip/titulo-eleitor.js';
import { extractTelefoneDigits, normalizeTelefoneDigits } from '../strip/telefone.js';

export type SanitizableDocumentType =
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

export type FixResult = {
  value: string;
  fixes: string[];
};

function trimFix(raw: string): FixResult {
  const trimmed = raw.trim();
  const fixes: string[] = [];
  if (trimmed !== raw) {
    fixes.push('trimmed');
  }
  return { value: trimmed, fixes };
}

function digitsFix(value: string, fixes: string[]): FixResult {
  const digits = value.replace(/\D/g, '');
  if (digits !== value) {
    fixes.push('removed_non_digits');
  }
  return { value: digits, fixes };
}

function upperAndStripSeparators(value: string, fixes: string[]): FixResult {
  const upper = value.toUpperCase();
  if (upper !== value) {
    fixes.push('uppercased');
  }
  const stripped = upper.replace(/[^A-Z0-9]/g, '');
  if (stripped !== upper) {
    fixes.push('removed_separators');
  }
  return { value: stripped, fixes };
}

function placaFix(value: string, fixes: string[]): FixResult {
  const upper = value.toUpperCase();
  if (upper !== value) {
    fixes.push('uppercased');
  }
  if (/[-.\s/]/.test(value)) {
    fixes.push('removed_separators');
  }
  return { value: stripPlaca(upper), fixes };
}

function telefoneFix(value: string, fixes: string[]): FixResult {
  if (/[\s()-]/.test(value)) {
    fixes.push('removed_mask_chars');
  }
  const digitsOnly = extractTelefoneDigits(value);
  const normalized = normalizeTelefoneDigits(value);
  if (normalized !== digitsOnly && normalized.length > 0) {
    fixes.push('normalized_national');
  }
  return { value: normalized, fixes };
}

function ieProdutorRuralFix(value: string, fixes: string[]): FixResult {
  const upper = value.toUpperCase();
  if (upper !== value) {
    fixes.push('uppercased');
  }
  if (/^[Pp]/.test(upper)) {
    fixes.push('preserved_p_prefix');
  }
  return { value: stripIeSpRural(upper), fixes };
}

function pixFix(value: string, fixes: string[]): FixResult {
  const stripped = stripPixKey(value);
  if (value !== value.toLowerCase() && stripped === value.toLowerCase()) {
    fixes.push('lowercased');
  }
  if (stripped.replace(/\D/g, '') !== value.replace(/\D/g, '')) {
    fixes.push('removed_non_digits');
  }
  if (/[\s()-]/.test(value)) {
    fixes.push('removed_mask_chars');
  }
  return { value: stripped, fixes };
}

export function applyFixes(raw: string, type: SanitizableDocumentType): FixResult {
  const { value: trimmed, fixes } = trimFix(raw);

  switch (type) {
    case 'cpf':
    case 'cep':
    case 'pis-pasep':
    case 'cnh':
    case 'renavam':
    case 'nfe-chave':
    case 'cartao-credito':
    case 'ean':
    case 'boleto':
    case 'titulo-eleitor':
    case 'processo-judicial':
    case 'inscricao-estadual':
      return digitsFix(trimmed, fixes);
    case 'rg':
      return upperAndStripSeparators(trimmed, fixes);
    case 'cnpj':
      return upperAndStripSeparators(trimmed, fixes);
    case 'placa':
      return placaFix(trimmed, fixes);
    case 'telefone':
      return telefoneFix(trimmed, fixes);
    case 'inscricao-estadual-produtor-rural':
      return ieProdutorRuralFix(trimmed, fixes);
    case 'pix':
      return pixFix(trimmed, fixes);
    default: {
      const _exhaustive: never = type;
      return { value: _exhaustive, fixes };
    }
  }
}

/** Validates canonical strip output matches fix pipeline (used in tests). */
export function stripForType(value: string, type: SanitizableDocumentType): string {
  switch (type) {
    case 'cpf':
      return stripCpf(value);
    case 'cnpj':
      return stripCnpj(value);
    case 'cep':
      return stripCep(value);
    case 'placa':
      return stripPlaca(value);
    case 'pis-pasep':
      return stripPisPasep(value);
    case 'telefone':
      return normalizeTelefoneDigits(value);
    case 'cnh':
      return stripCnh(value);
    case 'renavam':
      return stripRenavam(value);
    case 'titulo-eleitor':
      return stripTituloEleitor(value);
    case 'processo-judicial':
      return stripProcessoJudicial(value);
    case 'rg':
      return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    case 'nfe-chave':
      return stripNfeChave(value);
    case 'boleto':
      return value.replace(/\D/g, '');
    case 'cartao-credito':
    case 'ean':
      return value.replace(/\D/g, '');
    case 'inscricao-estadual':
      return stripInscricaoEstadual(value);
    case 'inscricao-estadual-produtor-rural':
      return stripIeSpRural(value);
    case 'pix':
      return stripPixKey(value);
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
