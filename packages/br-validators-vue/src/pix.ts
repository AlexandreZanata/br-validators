import type { UseBrValidatorOptions, UseBrValidatorReturn } from './types.js';
import { useBrValidator } from './use-br-validator.js';

export function usePix(options?: Omit<UseBrValidatorOptions, 'uf'>): UseBrValidatorReturn {
  return useBrValidator('pix', options);
}
