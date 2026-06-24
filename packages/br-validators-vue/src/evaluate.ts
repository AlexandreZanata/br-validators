import { runBrFormatter, runBrValidator } from './validator-registry.js';
import type { BrValidatorEvaluation, BrValidatorV1TypeId, ValidatorContext } from './types.js';

export function isEmptyBrValue(value: string): boolean {
  return value.trim() === '';
}

export function evaluateBrValidator(
  typeId: BrValidatorV1TypeId,
  value: string,
  context: ValidatorContext,
): BrValidatorEvaluation {
  if (isEmptyBrValue(value)) {
    return { isValid: false, error: null, formatted: null };
  }

  const validation = runBrValidator(typeId, value, context);
  if (!validation.ok) {
    return { isValid: false, error: validation.message, formatted: null };
  }

  const formatted = runBrFormatter(typeId, value, context);
  if (!formatted.ok) {
    return { isValid: false, error: formatted.message, formatted: null };
  }

  return { isValid: true, error: null, formatted: formatted.formatted };
}
