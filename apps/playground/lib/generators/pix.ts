import { validatePixKey } from '@br-validators/core';

export function generatePixEvp() {
  for (;;) {
    const value = globalThis.crypto.randomUUID();
    if (validatePixKey(value).ok) return value;
  }
}
