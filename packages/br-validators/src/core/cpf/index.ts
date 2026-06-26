/**
 * CPF validation — modulo 11 (RFB standard weights).
 * @see https://www.gov.br/receitafederal/pt-br/assuntos/cpf
 * @see docs/use-cases/UC-001-validate-cpf.md — golden vector 12345678909
 */
import { stripCpf } from '../../strip/cpf.js';
import type { Cpf, ValidationResult } from '../../types/validation-result.js';
import { brandCpf } from '../../types/validation-result.js';
import { computeCheckDigit } from '../cnpj/modulo11.js';
import {
  CPF_BASE_LENGTH,
  CPF_DV1_WEIGHTS,
  CPF_DV2_WEIGHTS,
  CPF_LENGTH,
} from './constants.js';

export {
  CPF_GOLDEN_PRIMARY,
  CPF_GOLDEN_PRIMARY_MASKED,
  CPF_GOLDEN_SECONDARY,
  CPF_OFFICIAL_SOURCE_URL,
} from './constants.js';

type FailedResult = Extract<ValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function digitValue(char: string): number {
  return Number(char);
}

function hasRepeatedDigits(value: string): boolean {
  const first = value[0];
  for (let i = 1; i < value.length; i++) {
    if (value[i] !== first) {
      return false;
    }
  }
  return true;
}

function isValidCpfChecksum(stripped: string): boolean {
  const base = stripped.slice(0, CPF_BASE_LENGTH);
  const dv1Expected = String(computeCheckDigit(base, CPF_DV1_WEIGHTS, digitValue));
  const dv2Expected = String(
    computeCheckDigit(base + dv1Expected, CPF_DV2_WEIGHTS, digitValue),
  );

  return stripped.slice(CPF_BASE_LENGTH) === dv1Expected + dv2Expected;
}

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'CPF input is empty');
  }

  const withoutMask = input.replace(/[.-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'CPF contains invalid characters');
  }

  if (stripped.length !== CPF_LENGTH) {
    return failure('INVALID_LENGTH', `CPF must have ${CPF_LENGTH} digits after normalization`);
  }

  if (hasRepeatedDigits(stripped)) {
    return failure('KNOWN_INVALID_PATTERN', 'CPF with all identical digits is invalid');
  }

  return null;
}

export function isValidCpf(input: string): boolean {
  return validateCpf(input).ok;
}

export function validateCpf(input: string): ValidationResult<Cpf> {
  const stripped = stripCpf(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  if (isValidCpfChecksum(stripped)) {
    return { ok: true, value: brandCpf(stripped), format: 'numeric' };
  }

  return failure('INVALID_CHECK_DIGIT', 'CPF check digits are invalid');
}
