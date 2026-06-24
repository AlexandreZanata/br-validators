import type { UseBrValidatorOptions, UseBrValidatorReturn } from './types.js';
import { useBrValidator } from './use-br-validator.js';

export function useCnpj(options?: Omit<UseBrValidatorOptions, 'uf' | 'pixType'>): UseBrValidatorReturn {
  return useBrValidator('cnpj', options);
}
