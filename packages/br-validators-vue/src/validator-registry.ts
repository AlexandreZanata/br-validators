import {
  formatCep,
  formatCnpj,
  formatCpf,
  formatInscricaoEstadual,
  formatPixKey,
  formatTelefone,
  validateCep,
  validateCnpj,
  validateCpf,
  validateInscricaoEstadual,
  validatePixKey,
  validateTelefone,
  type FormatResult,
  type ValidationErrorCode,
} from '@br-validators/core';
import type { BrValidatorV1TypeId, ValidatorContext } from './types.js';

export type ValidatorOutcome =
  | { ok: true }
  | { ok: false; code: ValidationErrorCode; message: string };

type ValidatorRunner = (value: string, context: ValidatorContext) => ValidatorOutcome;
type FormatterRunner = (value: string, context: ValidatorContext) => FormatResult;

function missingUfFailure(): ValidatorOutcome {
  return {
    ok: false,
    code: 'UNSUPPORTED_FORMAT',
    message: 'UF is required for inscricao-estadual — pass { uf } to useBrValidator() or useInscricaoEstadual()',
  };
}

function runPixValidate(value: string, context: ValidatorContext): ValidatorOutcome {
  const options = context.pixType ? { type: context.pixType } : undefined;
  return validatePixKey(value, options);
}

function runPixFormat(value: string, context: ValidatorContext): FormatResult {
  const options = context.pixType ? { type: context.pixType } : undefined;
  return formatPixKey(value, options);
}

function runIeValidate(value: string, context: ValidatorContext): ValidatorOutcome {
  const uf = context.uf;
  if (!uf) {
    return missingUfFailure();
  }
  return validateInscricaoEstadual(value, { uf });
}

function runIeFormat(value: string, context: ValidatorContext): FormatResult {
  const uf = context.uf;
  if (!uf) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'UF is required for inscricao-estadual — pass { uf } to useBrValidator() or useInscricaoEstadual()',
    };
  }
  return formatInscricaoEstadual(value, { uf });
}

const VALIDATORS: Record<BrValidatorV1TypeId, ValidatorRunner> = {
  cpf: (value) => validateCpf(value),
  cnpj: (value) => validateCnpj(value),
  cep: (value) => validateCep(value),
  telefone: (value) => validateTelefone(value),
  pix: runPixValidate,
  'inscricao-estadual': runIeValidate,
};

const FORMATTERS: Record<BrValidatorV1TypeId, FormatterRunner> = {
  cpf: (value) => formatCpf(value),
  cnpj: (value) => formatCnpj(value),
  cep: (value) => formatCep(value),
  telefone: (value) => formatTelefone(value),
  pix: runPixFormat,
  'inscricao-estadual': runIeFormat,
};

export function runBrValidator(
  typeId: BrValidatorV1TypeId,
  value: string,
  context: ValidatorContext,
): ValidatorOutcome {
  return VALIDATORS[typeId](value, context);
}

export function runBrFormatter(
  typeId: BrValidatorV1TypeId,
  value: string,
  context: ValidatorContext,
): FormatResult {
  return FORMATTERS[typeId](value, context);
}
