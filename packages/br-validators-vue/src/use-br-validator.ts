import { computed, ref, toValue } from 'vue';
import { evaluateBrValidator } from './evaluate.js';
import type {
  BrValidatorV1TypeId,
  UseBrValidatorOptions,
  UseBrValidatorReturn,
  ValidatorContext,
} from './types.js';

function resolveContext(options: UseBrValidatorOptions): ValidatorContext {
  return {
    uf: options.uf !== undefined ? toValue(options.uf) : undefined,
    pixType: options.pixType !== undefined ? toValue(options.pixType) : undefined,
  };
}

export function useBrValidator(
  typeId: BrValidatorV1TypeId,
  options: UseBrValidatorOptions = {},
): UseBrValidatorReturn {
  const value = ref(options.initialValue ?? '');

  const context = computed(() => resolveContext(options));
  const evaluation = computed(() => evaluateBrValidator(typeId, value.value, context.value));

  const isValid = computed(() => evaluation.value.isValid);
  const error = computed(() => evaluation.value.error);
  const formatted = computed(() => evaluation.value.formatted);

  const validate = (): boolean => evaluation.value.isValid;

  return { value, isValid, error, formatted, validate };
}
