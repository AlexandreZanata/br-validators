import { computeModulo10FieldDv } from './modulo10.js';

/**
 * FEBRABAN arrecadação modulo 11 — Layout v7 §09–10.
 * @see BOLETO_ARRECADACAO_OFFICIAL_SOURCE_URL
 *
 * Multipliers 2,3,4,5,6,7,8,9,2,3,4… from right; remainder 0|1 → DV 0; remainder 10 → DV 1.
 */
export function computeArrecadacaoModulo11Dv(digits: string): number {
  const multipliers = [2, 3, 4, 5, 6, 7, 8, 9];
  let sum = 0;

  for (let i = digits.length - 1, m = 0; i >= 0; i--, m++) {
    sum += Number(digits[i]) * multipliers[m % multipliers.length];
  }

  const remainder = sum % 11;
  if (remainder === 0 || remainder === 1) {
    return 0;
  }
  if (remainder === 10) {
    return 1;
  }
  return 11 - remainder;
}

export function isArrecadacaoValueType(valueType: string): valueType is ArrecadacaoValueType {
  return valueType === '6' || valueType === '7' || valueType === '8' || valueType === '9';
}

export type ArrecadacaoValueType = '6' | '7' | '8' | '9';

export function getArrecadacaoDvCalculator(
  valueType: string,
): (digits: string) => number {
  if (valueType === '6' || valueType === '7') {
    return computeModulo10FieldDv;
  }
  if (valueType === '8' || valueType === '9') {
    return computeArrecadacaoModulo11Dv;
  }
  throw new Error(`Unsupported arrecadação value type: ${valueType}`);
}

/** Re-export cobrança-compatible modulo 10 (Layout v7 §07 — same algorithm). */
export { computeModulo10FieldDv as computeArrecadacaoModulo10Dv } from './modulo10.js';
