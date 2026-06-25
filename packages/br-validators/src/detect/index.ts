/**
 * Unified document type detection — delegates to existing validators (BR-DETECT-001).
 * @see docs/VALIDATION-RULES.md
 */
import { validateArrecadacao } from '../core/boleto/arrecadacao.js';
import { validateBoleto } from '../core/boleto/index.js';
import { validateBrCode } from '../core/brcode/index.js';
import { validateCartaoCredito } from '../core/cartao-credito/index.js';
import { validateEan } from '../core/ean/index.js';
import { validateCep } from '../core/cep/index.js';
import { validateCnh } from '../core/cnh/index.js';
import { validateCnpj } from '../core/cnpj/index.js';
import { validateCpf } from '../core/cpf/index.js';
import { validateInscricaoEstadual } from '../core/inscricao-estadual/index.js';
import { validateIeProdutorRural } from '../core/inscricao-estadual/validate-produtor-rural.js';
import { isSpRuralIeInput } from '../core/inscricao-estadual/sp-rural.js';
import { validateNfeChave } from '../core/nfe-chave/index.js';
import { validatePisPasep } from '../core/pis-pasep/index.js';
import { validatePlaca } from '../core/placa/index.js';
import { validatePixKey } from '../core/pix/index.js';
import { validateTelefone } from '../core/telefone/index.js';
import { validateProcessoJudicial } from '../core/processo-judicial/index.js';
import { validateTituloEleitor } from '../core/titulo-eleitor/index.js';
import {
  isBoletoArrecadacao,
  looksLikeBoleto,
  looksLikeBrCode,
  looksLikeCartao,
  looksLikeCep,
  looksLikeEan,
  looksLikeCnpjAlphanumeric,
  looksLikeCnpjNumeric,
  looksLikeElevenDigits,
  looksLikeIe,
  looksLikeNfeChave,
  looksLikePix,
  looksLikePlaca,
  looksLikeTelefone,
  looksLikeProcessoJudicial,
  looksLikeTituloEleitor,
} from './helpers.js';
import type { DocumentFormat, UfCode, ValidationErrorCode } from '../types/validation-result.js';

export type DetectableDocumentType =
  | 'cpf'
  | 'cnpj'
  | 'cep'
  | 'placa'
  | 'pis-pasep'
  | 'pix'
  | 'telefone'
  | 'boleto'
  | 'cartao-credito'
  | 'ean'
  | 'cnh'
  | 'renavam'
  | 'nfe-chave'
  | 'titulo-eleitor'
  | 'processo-judicial'
  | 'inscricao-estadual'
  | 'inscricao-estadual-produtor-rural'
  | 'brcode'
  | 'unknown';

export type DetectOptions = {
  uf?: UfCode;
};

export type DetectSuccess = {
  type: DetectableDocumentType;
  ok: true;
  value: string;
  format?: DocumentFormat;
  meta?: Record<string, unknown>;
};

export type DetectFailure = {
  type: DetectableDocumentType;
  ok: false;
  code: ValidationErrorCode;
  message: string;
};

export type DetectResult = DetectSuccess | DetectFailure;

type Candidate = {
  canTry: (raw: string, options: DetectOptions) => boolean;
  detect: (raw: string, options: DetectOptions) => DetectResult | null;
};

/** @internal Test hook for success result branches. */
export function buildDetectSuccess(
  type: DetectableDocumentType,
  value: string,
  format?: DocumentFormat,
  meta?: Record<string, unknown>,
): DetectResult {
  return success(type, value, format, meta);
}

function success(
  type: DetectableDocumentType,
  value: string,
  format?: DocumentFormat,
  meta?: Record<string, unknown>,
): DetectResult {
  return { type, ok: true, value, ...(format ? { format } : {}), ...(meta ? { meta } : {}) };
}

function tryValidators(attempts: Array<() => DetectResult | null>): DetectResult | null {
  for (const attempt of attempts) {
    const result = attempt();
    if (result) {
      return result;
    }
  }
  return null;
}

const CANDIDATES: Candidate[] = [
  {
    canTry: (raw) => isBoletoArrecadacao(raw),
    detect: (raw) => {
      const result = validateArrecadacao(raw);
      if (!result.ok) {
        return null;
      }
      return success('boleto', result.value, 'arrecadacao', {
        inputKind: result.inputKind,
        segment: result.segment,
        valueType: result.valueType,
      });
    },
  },
  {
    canTry: (raw) => looksLikeBoleto(raw) && !isBoletoArrecadacao(raw),
    detect: (raw) => {
      const result = validateBoleto(raw);
      if (!result.ok || result.format === 'arrecadacao') {
        return null;
      }
      return success('boleto', result.value, result.format, {
        inputKind: result.inputKind,
        situacao: result.situacao,
      });
    },
  },
  {
    canTry: (raw) => looksLikeNfeChave(raw),
    detect: (raw) => {
      const result = validateNfeChave(raw);
      if (!result.ok) {
        return null;
      }
      return success('nfe-chave', result.value, result.format, {
        parsed: result.parsed,
        uf: result.uf,
      });
    },
  },
  {
    canTry: (raw) => looksLikeBrCode(raw),
    detect: (raw) => {
      const result = validateBrCode(raw);
      if (!result.ok) {
        return null;
      }
      return success('brcode', result.value, result.format, {
        merchantName: result.merchantName,
        merchantCity: result.merchantCity,
        pixKey: result.pixKey,
        pixKeyType: result.pixKeyType,
      });
    },
  },
  {
    canTry: (raw) => looksLikeCnpjAlphanumeric(raw),
    detect: (raw) => {
      const result = validateCnpj(raw);
      if (!result.ok) {
        return null;
      }
      return success('cnpj', result.value, result.format);
    },
  },
  {
    canTry: (raw) => looksLikeCnpjNumeric(raw),
    detect: (raw) => {
      const result = validateCnpj(raw);
      if (!result.ok) {
        return null;
      }
      return success('cnpj', result.value, result.format);
    },
  },
  {
    canTry: (raw) => looksLikeElevenDigits(raw),
    detect: (raw) =>
      tryValidators([
        () => {
          const result = validateCpf(raw);
          return result.ok ? success('cpf', result.value, result.format) : null;
        },
        () => {
          const result = validateCnh(raw);
          return result.ok ? success('cnh', result.value, result.format) : null;
        },
        () => {
          const result = validatePisPasep(raw);
          return result.ok ? success('pis-pasep', result.value, result.format) : null;
        },
      ]),
  },
  {
    canTry: (raw) => looksLikeProcessoJudicial(raw),
    detect: (raw) => {
      const result = validateProcessoJudicial(raw);
      if (!result.ok) {
        return null;
      }
      return success('processo-judicial', result.value, result.format, {
        segments: result.segments,
      });
    },
  },
  {
    canTry: (raw) => looksLikeTituloEleitor(raw),
    detect: (raw) => {
      const result = validateTituloEleitor(raw);
      if (!result.ok) {
        return null;
      }
      return success('titulo-eleitor', result.value, result.format, {
        ufCode: result.ufCode,
        ...(result.uf ? { uf: result.uf } : {}),
        ...(result.exterior ? { exterior: result.exterior } : {}),
      });
    },
  },
  {
    canTry: (raw) => looksLikeCep(raw),
    detect: (raw) => {
      const result = validateCep(raw);
      if (!result.ok) {
        return null;
      }
      return success('cep', result.value, result.format);
    },
  },
  {
    canTry: (raw) => looksLikePlaca(raw),
    detect: (raw) => {
      const result = validatePlaca(raw);
      if (!result.ok) {
        return null;
      }
      return success('placa', result.value, result.format);
    },
  },
  {
    canTry: (raw) => looksLikePix(raw),
    detect: (raw) => {
      const result = validatePixKey(raw);
      if (!result.ok) {
        return null;
      }
      return success('pix', result.value, result.format, { keyType: result.keyType });
    },
  },
  {
    canTry: (raw) => looksLikeTelefone(raw),
    detect: (raw) => {
      const result = validateTelefone(raw);
      if (!result.ok) {
        return null;
      }
      return success('telefone', result.value, result.format, { tipo: result.tipo });
    },
  },
  {
    canTry: (raw) => looksLikeEan(raw),
    detect: (raw) => {
      const result = validateEan(raw);
      if (!result.ok) {
        return null;
      }
      return success('ean', result.value, result.format);
    },
  },
  {
    canTry: (raw) => looksLikeCartao(raw),
    detect: (raw) => {
      const result = validateCartaoCredito(raw);
      if (!result.ok) {
        return null;
      }
      return success('cartao-credito', result.value, result.format, { brand: result.brand });
    },
  },
  {
    canTry: (raw, options) => looksLikeIe(raw, options.uf),
    detect: (raw, options) => {
      const uf = options.uf as UfCode;
      if (uf === 'SP' && isSpRuralIeInput(raw)) {
        const result = validateIeProdutorRural(uf, raw);
        if (!result.ok) {
          return null;
        }
        return success('inscricao-estadual-produtor-rural', result.value, result.format, { uf: result.uf });
      }
      const result = validateInscricaoEstadual(raw, { uf });
      if (!result.ok) {
        return null;
      }
      return success('inscricao-estadual', result.value, result.format, { uf: result.uf });
    },
  },
];

export function detect(raw: string, options: DetectOptions = {}): DetectResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {
      type: 'unknown',
      ok: false,
      code: 'EMPTY_INPUT',
      message: 'Input is empty',
    };
  }

  for (const candidate of CANDIDATES) {
    if (!candidate.canTry(trimmed, options)) {
      continue;
    }
    const result = candidate.detect(trimmed, options);
    if (result?.ok) {
      return result;
    }
  }

  return {
    type: 'unknown',
    ok: false,
    code: 'UNSUPPORTED_FORMAT',
    message: options.uf
      ? 'No supported document type matched the input'
      : 'No supported document type matched the input; provide options.uf for Inscrição Estadual detection',
  };
}
