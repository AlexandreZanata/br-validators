import type { UfCode } from '@br-validators/core';
import type { MaybeRef } from 'vue';
import type { UseBrValidatorOptions, UseBrValidatorReturn } from './types.js';
import { useBrValidator } from './use-br-validator.js';

export type UseInscricaoEstadualOptions = Omit<UseBrValidatorOptions, 'pixType'> & {
  uf: MaybeRef<UfCode>;
};

export function useInscricaoEstadual(options: UseInscricaoEstadualOptions): UseBrValidatorReturn {
  return useBrValidator('inscricao-estadual', options);
}

export type { UfCode };
