/**
 * GS1 EAN-8 / EAN-13 product barcode validation — modulo-10 weights 1 and 3.
 * @see docs/use-cases/UC-009-validate-ean.md
 */
import { stripEan } from '../../strip/ean.js';
import type { EanValidationResult } from '../../types/validation-result.js';
import { brandEan } from '../../types/validation-result.js';
import { EAN_13_LENGTH, EAN_8_LENGTH, type EanFormat } from './constants.js';
import { passesGs1Modulo10 } from './modulo10.js';

export {
  EAN_8_LENGTH,
  EAN_13_LENGTH,
  EAN_GOLDEN_13,
  EAN_GOLDEN_13_MASKED,
  EAN_GOLDEN_8,
  EAN_GOLDEN_8_MASKED,
  EAN_OFFICIAL_SOURCE_URL,
} from './constants.js';
export type { EanFormat } from './constants.js';
export { detectEanFormat } from './detect-format.js';
export { applyEanMask } from './mask.js';
export { computeGs1Modulo10CheckDigit, computeGs1Modulo10Sum, passesGs1Modulo10 } from './modulo10.js';

type FailedResult = Extract<EanValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
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

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'EAN input is empty');
  }

  const withoutMask = input.replace(/[\s-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return failure('INVALID_CHARACTER', 'EAN contains invalid characters');
  }

  if (stripped.length !== EAN_8_LENGTH && stripped.length !== EAN_13_LENGTH) {
    return failure(
      'INVALID_LENGTH',
      `EAN must have ${EAN_8_LENGTH} (EAN-8) or ${EAN_13_LENGTH} (EAN-13) digits after normalization`,
    );
  }

  if (hasRepeatedDigits(stripped)) {
    return failure('KNOWN_INVALID_PATTERN', 'EAN with all identical digits is invalid');
  }

  return null;
}

export function isValidGs1Modulo10(input: string): boolean {
  const stripped = stripEan(input);
  if (stripped.length !== EAN_8_LENGTH && stripped.length !== EAN_13_LENGTH) {
    return false;
  }
  const withoutMask = input.replace(/[\s-]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return false;
  }
  return passesGs1Modulo10(stripped);
}

export function isValidEan(input: string): boolean {
  return validateEan(input).ok;
}

export function validateEan(input: string): EanValidationResult {
  const stripped = stripEan(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  if (!passesGs1Modulo10(stripped)) {
    return failure('INVALID_CHECK_DIGIT', 'EAN check digit is invalid');
  }

  const format: EanFormat = stripped.length === EAN_13_LENGTH ? 'ean-13' : 'ean-8';

  return {
    ok: true,
    value: brandEan(stripped),
    format,
  };
}
