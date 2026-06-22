import { generate } from '@br-validators/core';

export function generateCnpj() {
  return generate('cnpj');
}
