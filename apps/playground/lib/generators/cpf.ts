import { generate } from '@br-validators/core';

export function generateCpf() {
  return generate('cpf');
}
