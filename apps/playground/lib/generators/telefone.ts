import { generate } from '@br-validators/core';

export function generateTelefone() {
  return generate('telefone', { format: 'celular' });
}
