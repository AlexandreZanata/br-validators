import type { PixKeyType, UfCode } from '@br-validators/core';
import type { MaybeRef } from 'vue';

/** Document types supported by `useBrValidator()` v1. */
export type BrValidatorV1TypeId =
  | 'cpf'
  | 'cnpj'
  | 'cep'
  | 'telefone'
  | 'pix'
  | 'inscricao-estadual';

export const BR_VALIDATOR_V1_TYPE_IDS = [
  'cpf',
  'cnpj',
  'cep',
  'telefone',
  'pix',
  'inscricao-estadual',
] as const satisfies readonly BrValidatorV1TypeId[];

export type ValidatorContext = {
  uf?: UfCode;
  pixType?: PixKeyType;
};

export type UseBrValidatorOptions = {
  initialValue?: string;
  /** Required for `inscricao-estadual`. Accepts a ref for reactive UF changes. */
  uf?: MaybeRef<UfCode | undefined>;
  /** Optional PIX key type constraint for `pix`. */
  pixType?: MaybeRef<PixKeyType | undefined>;
};

export type BrValidatorEvaluation = {
  isValid: boolean;
  error: string | null;
  formatted: string | null;
};

export type UseBrValidatorReturn = {
  value: import('vue').Ref<string>;
  isValid: import('vue').ComputedRef<boolean>;
  error: import('vue').ComputedRef<string | null>;
  formatted: import('vue').ComputedRef<string | null>;
  validate: () => boolean;
};

export function isBrValidatorV1TypeId(value: string): value is BrValidatorV1TypeId {
  return (BR_VALIDATOR_V1_TYPE_IDS as readonly string[]).includes(value);
}
