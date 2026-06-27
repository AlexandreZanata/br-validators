/**
 * Canonical normalization for platform compare/diff (BR-PLATFORM-001).
 * @see docs/OFFICIAL-SOURCES.md
 */
import { validateBrCode } from '../core/brcode/index.js';
import { validateBoleto } from '../core/boleto/index.js';
import { validateCartaoCredito } from '../core/cartao-credito/index.js';
import { validateEan } from '../core/ean/index.js';
import { validateCep } from '../core/cep/index.js';
import { validateCnh } from '../core/cnh/index.js';
import { validateCnpj } from '../core/cnpj/index.js';
import { validateCpf } from '../core/cpf/index.js';
import { validateInscricaoEstadual } from '../core/inscricao-estadual/index.js';
import { validateIeSpRural } from '../core/inscricao-estadual/sp-rural.js';
import { validateNfeChave } from '../core/nfe-chave/index.js';
import { validatePisPasep } from '../core/pis-pasep/index.js';
import { validatePlaca } from '../core/placa/index.js';
import { validatePixKey } from '../core/pix/index.js';
import { validateRenavam } from '../core/renavam/index.js';
import { validateTelefone } from '../core/telefone/index.js';
import { validateProcessoJudicial } from '../core/processo-judicial/index.js';
import { validateRg, isRgUfImplemented } from '../core/rg/index.js';
import { validateTituloEleitor } from '../core/titulo-eleitor/index.js';
import { stripForType } from '../sanitize/fixes.js';
import { stripPixKey } from '../strip/pix.js';
import type { SanitizableDocumentType } from '../sanitize/index.js';
import type { UfCode } from '../types/validation-result.js';
import type { PlatformDocumentType, PlatformOptions } from './types.js';

const SANITIZABLE_PLATFORM_TYPES = new Set<PlatformDocumentType>([
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
]);

function isSanitizablePlatformType(type: PlatformDocumentType): type is SanitizableDocumentType {
  return SANITIZABLE_PLATFORM_TYPES.has(type);
}

function stripForPlatform(raw: string, type: PlatformDocumentType): string {
  if (type === 'pix') {
    return stripPixKey(raw);
  }
  if (type === 'brcode') {
    return raw;
  }
  if (isSanitizablePlatformType(type)) {
    return stripForType(raw, type);
  }
  return raw;
}

export function normalizeForPlatform(
  raw: string,
  type: PlatformDocumentType,
  options: PlatformOptions = {},
): string {
  const trimmed = raw.trim();
  const stripped = stripForPlatform(trimmed, type);
  const validated = tryValidatedCanonical(stripped, type, options.uf);
  return validated ?? stripped;
}

function tryValidatedCanonical(
  value: string,
  type: PlatformDocumentType,
  uf?: UfCode,
): string | null {
  switch (type) {
    case 'cpf': {
      const result = validateCpf(value);
      return result.ok ? result.value : null;
    }
    case 'cnpj': {
      const result = validateCnpj(value);
      return result.ok ? result.value : null;
    }
    case 'cep': {
      const result = validateCep(value);
      return result.ok ? result.value : null;
    }
    case 'placa': {
      const result = validatePlaca(value);
      return result.ok ? result.value : null;
    }
    case 'pis-pasep': {
      const result = validatePisPasep(value);
      return result.ok ? result.value : null;
    }
    case 'telefone': {
      const result = validateTelefone(value);
      return result.ok ? result.value : null;
    }
    case 'cnh': {
      const result = validateCnh(value);
      return result.ok ? result.value : null;
    }
    case 'renavam': {
      const result = validateRenavam(value);
      return result.ok ? result.value : null;
    }
    case 'titulo-eleitor': {
      const result = validateTituloEleitor(value);
      return result.ok ? result.value : null;
    }
    case 'processo-judicial': {
      const result = validateProcessoJudicial(value);
      return result.ok ? result.value : null;
    }
    case 'rg': {
      if (!uf || !isRgUfImplemented(uf)) {
        return null;
      }
      const result = validateRg(value, { uf });
      return result.ok ? result.value : null;
    }
    case 'nfe-chave': {
      const result = validateNfeChave(value);
      return result.ok ? result.value : null;
    }
    case 'boleto': {
      const result = validateBoleto(value);
      return result.ok ? result.value : null;
    }
    case 'cartao-credito': {
      const result = validateCartaoCredito(value);
      return result.ok ? result.value : null;
    }
    case 'ean': {
      const result = validateEan(value);
      return result.ok ? result.value : null;
    }
    case 'inscricao-estadual': {
      if (!uf) {
        return null;
      }
      const result = validateInscricaoEstadual(value, { uf });
      return result.ok ? result.value : null;
    }
    case 'inscricao-estadual-produtor-rural': {
      const result = validateIeSpRural(value);
      return result.ok ? result.value : null;
    }
    case 'pix': {
      const result = validatePixKey(value);
      return result.ok ? result.value : null;
    }
    case 'brcode': {
      const result = validateBrCode(value);
      return result.ok ? result.value : null;
    }
    default: {
      return null;
    }
  }
}
