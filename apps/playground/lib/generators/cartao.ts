import { generate } from '@br-validators/core';

export function generateCreditCard() {
  return generate('cartao-credito');
}
