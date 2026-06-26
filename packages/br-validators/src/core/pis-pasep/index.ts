/**
 * PIS/PASEP validation — modulo 11 (CNIS unified registry).
 * @see https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf — RV_03
 * @see docs/use-cases/UC-006-validate-pis-pasep.md — golden vector 10027230888
 */
import { stripPisPasep } from '../../strip/pis-pasep.js';
import type { PisPasep, ValidationResult } from '../../types/validation-result.js';
import { brandPisPasep } from '../../types/validation-result.js';
import { computeCheckDigit } from '../cnpj/modulo11.js';
import {
  PIS_PASEP_BASE_LENGTH,
  PIS_PASEP_DV_WEIGHTS,
  PIS_PASEP_LENGTH,
} from './constants.js';

export {
  PIS_PASEP_GOLDEN_PRIMARY,
  PIS_PASEP_GOLDEN_PRIMARY_MASKED,
  PIS_PASEP_GOLDEN_SECONDARY,
  PIS_PASEP_OFFICIAL_SOURCE_URL,
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

function isValidPisPasepChecksum(stripped: string): boolean {
  const base = stripped.slice(0, PIS_PASEP_BASE_LENGTH);
  const dvExpected = String(computeCheckDigit(base, PIS_PASEP_DV_WEIGHTS, digitValue));
  return stripped.charAt(PIS_PASEP_BASE_LENGTH) === dvExpected;
}

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'PIS/PASEP input is empty');
  }

  const withoutMask = input.replace(/[.-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'PIS/PASEP contains invalid characters');
  }

  if (stripped.length !== PIS_PASEP_LENGTH) {
    return failure('INVALID_LENGTH', `PIS/PASEP must have ${PIS_PASEP_LENGTH} digits after normalization`);
  }

  if (hasRepeatedDigits(stripped)) {
    return failure('KNOWN_INVALID_PATTERN', 'PIS/PASEP with all identical digits is invalid');
  }

  return null;
}

export function isValidPisPasep(input: string): boolean {
  return validatePisPasep(input).ok;
}

export function validatePisPasep(input: string): ValidationResult<PisPasep> {
  const stripped = stripPisPasep(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  if (isValidPisPasepChecksum(stripped)) {
    return { ok: true, value: brandPisPasep(stripped), format: 'numeric' };
  }

  return failure('INVALID_CHECK_DIGIT', 'PIS/PASEP check digit is invalid');
}
