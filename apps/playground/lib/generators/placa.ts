import { generate } from '@br-validators/core';

export function generatePlaca(format: 'legacy' | 'mercosul' = 'mercosul') {
  return generate('placa', { format });
}
