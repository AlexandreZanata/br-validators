import { stripCnpj } from '../../strip/cnpj.js';
import type { Cnpj, DocumentFormat, ValidationResult } from '../../types/validation-result.js';
import { brandCnpj } from '../../types/validation-result.js';
import { isValidCnpjAlphanumeric } from './alphanumeric.js';
import { CNPJ_LENGTH } from './constants.js';
import { containsLetter, detectCnpjFormat } from './detect.js';
import { isValidCnpjNumeric } from './numeric.js';

export { detectCnpjFormat, containsLetter } from './detect.js';
export { isValidCnpjAlphanumeric } from './alphanumeric.js';
export { isValidCnpjNumeric } from './numeric.js';
export {
  CNPJ_GOLDEN_ALPHANUMERIC,
  CNPJ_GOLDEN_ALPHANUMERIC_MASKED,
  CNPJ_GOLDEN_NUMERIC,
  CNPJ_GOLDEN_NUMERIC_MASKED,
  CNPJ_OFFICIAL_SOURCE_URL,
} from './constants.js';

type FailedResult = Extract<ValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function validateStructure(
  input: string,
  stripped: string,
): FailedResult | { format: DocumentFormat } {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'CNPJ input is empty');
  }

  const withoutMask = input.replace(/[.\-/]/g, '');
  if (/[^A-Za-z0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'CNPJ contains invalid characters');
  }

  if (stripped.length !== CNPJ_LENGTH) {
    return failure('INVALID_LENGTH', `CNPJ must have ${CNPJ_LENGTH} characters after normalization`);
  }

  const format = detectCnpjFormat(stripped);
  if (format === 'unknown') {
    return failure('UNSUPPORTED_FORMAT', 'CNPJ format is not numeric or alphanumeric');
  }

  return { format };
}

export function isValidCnpj(input: string): boolean {
  return validateCnpj(input).ok;
}

export function validateCnpj(input: string): ValidationResult<Cnpj> {
  const stripped = stripCnpj(input);
  const structural = validateStructure(input, stripped);
  if ('ok' in structural) {
    return structural;
  }

  const { format } = structural;

  if (format === 'numeric' || !containsLetter(stripped)) {
    if (isValidCnpjNumeric(stripped)) {
      return { ok: true, value: brandCnpj(stripped), format: 'numeric' };
    }
    if (format === 'numeric') {
      if (/^(\d)\1{13}$/.test(stripped)) {
        return failure('KNOWN_INVALID_PATTERN', 'CNPJ with all identical digits is invalid');
      }
      return failure('INVALID_CHECK_DIGIT', 'CNPJ check digits are invalid');
    }
  }

  if (isValidCnpjAlphanumeric(stripped)) {
    return { ok: true, value: brandCnpj(stripped), format: 'alphanumeric' };
  }

  return failure('INVALID_CHECK_DIGIT', 'CNPJ check digits are invalid');
}
