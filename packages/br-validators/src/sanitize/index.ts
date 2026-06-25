/**
 * ETL-style document sanitization — applies fixes then validates (BR-SANITIZE-001).
 * @see docs/VALIDATION-RULES.md
 */
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
import { validateProcessoJudicial } from '../core/processo-judicial/index.js';
import { validateRg } from '../core/rg/index.js';
import type { RgUfCode } from '../types/validation-result.js';
import { validateRenavam } from '../core/renavam/index.js';
import { validateTelefone } from '../core/telefone/index.js';
import { validateTituloEleitor } from '../core/titulo-eleitor/index.js';
import type { UfCode, ValidationErrorCode } from '../types/validation-result.js';
import { applyFixes } from './fixes.js';

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
  | 'inscricao-estadual-produtor-rural';

export type SanitizeOptions = {
  uf?: UfCode;
};

export type SanitizeSuccess = {
  ok: true;
  value: string;
  fixes: string[];
};

export type SanitizeFailure = {
  ok: false;
  code: ValidationErrorCode;
  message: string;
};

export type SanitizeResult = SanitizeSuccess | SanitizeFailure;

export type { FixResult } from './fixes.js';

type ValidateFixedResult =
  | { ok: true; value: string }
  | { ok: false; code: ValidationErrorCode; message: string };

export function sanitize(
  raw: string,
  type: SanitizableDocumentType,
  options: SanitizeOptions = {},
): SanitizeResult {
  const { value: fixed, fixes } = applyFixes(raw, type);

  if (type === 'inscricao-estadual' && !options.uf) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'UF is required for inscricao-estadual sanitization',
    };
  }

  if (type === 'rg' && !options.uf) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'UF is required for RG sanitization',
    };
  }

  const validation = validateFixed(fixed, type, options.uf);
  if (!validation.ok) {
    return { ok: false, code: validation.code, message: validation.message };
  }

  return { ok: true, value: validation.value, fixes };
}

function validateFixed(value: string, type: SanitizableDocumentType, uf?: UfCode): ValidateFixedResult {
  switch (type) {
    case 'cpf': {
      const result = validateCpf(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'cnpj': {
      const result = validateCnpj(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'cep': {
      const result = validateCep(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'placa': {
      const result = validatePlaca(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'pis-pasep': {
      const result = validatePisPasep(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'telefone': {
      const result = validateTelefone(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'cnh': {
      const result = validateCnh(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'renavam': {
      const result = validateRenavam(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'titulo-eleitor': {
      const result = validateTituloEleitor(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'processo-judicial': {
      const result = validateProcessoJudicial(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'rg': {
      const result = validateRg(value, { uf: uf as RgUfCode });
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'nfe-chave': {
      const result = validateNfeChave(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'boleto': {
      const result = validateBoleto(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'cartao-credito': {
      const result = validateCartaoCredito(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'ean': {
      const result = validateEan(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'inscricao-estadual': {
      const result = validateInscricaoEstadual(value, { uf: uf as UfCode });
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'inscricao-estadual-produtor-rural': {
      const result = validateIeSpRural(value);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    default: {
      const _exhaustive: never = type;
      return { ok: false, code: 'UNSUPPORTED_FORMAT', message: `Unsupported type: ${String(_exhaustive)}` };
    }
  }
}
