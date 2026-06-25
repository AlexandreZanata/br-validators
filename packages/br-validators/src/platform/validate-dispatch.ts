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
import { validateRg } from '../core/rg/index.js';
import type { RgUfCode } from '../types/validation-result.js';
import { validateTituloEleitor } from '../core/titulo-eleitor/index.js';
import type { UfCode, ValidationErrorCode } from '../types/validation-result.js';
import type { PlatformDocumentType, PlatformOptions } from './types.js';

export type ValidateDispatchSuccess = { ok: true; value: string };
export type ValidateDispatchFailure = {
  ok: false;
  code: ValidationErrorCode;
  message: string;
};
export type ValidateDispatchResult = ValidateDispatchSuccess | ValidateDispatchFailure;

export function validateForPlatform(
  input: string,
  type: PlatformDocumentType,
  options: PlatformOptions = {},
): ValidateDispatchResult {
  if (type === 'inscricao-estadual' && !options.uf) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'UF is required for inscricao-estadual validation',
    };
  }

  if (type === 'rg' && !options.uf) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'UF is required for RG validation',
    };
  }

  switch (type) {
    case 'cpf': {
      const result = validateCpf(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'cnpj': {
      const result = validateCnpj(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'cep': {
      const result = validateCep(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'placa': {
      const result = validatePlaca(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'pis-pasep': {
      const result = validatePisPasep(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'telefone': {
      const result = validateTelefone(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'cnh': {
      const result = validateCnh(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'renavam': {
      const result = validateRenavam(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'titulo-eleitor': {
      const result = validateTituloEleitor(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'processo-judicial': {
      const result = validateProcessoJudicial(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'rg': {
      const result = validateRg(input, { uf: options.uf as RgUfCode });
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'nfe-chave': {
      const result = validateNfeChave(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'boleto': {
      const result = validateBoleto(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'cartao-credito': {
      const result = validateCartaoCredito(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'ean': {
      const result = validateEan(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'inscricao-estadual': {
      const result = validateInscricaoEstadual(input, { uf: options.uf as UfCode });
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'inscricao-estadual-produtor-rural': {
      const result = validateIeSpRural(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'pix': {
      const result = validatePixKey(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
    case 'brcode': {
      const result = validateBrCode(input);
      return result.ok ? { ok: true, value: result.value } : result;
    }
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
