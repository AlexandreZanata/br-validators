import { describe, expect, it } from 'vitest';
import {
  computeArrecadacaoModulo11Dv,
  getArrecadacaoDvCalculator,
  isArrecadacaoValueType,
} from '../../../src/core/boleto/arrecadacao-modulo.js';

describe('arrecadacao modulo helpers', () => {
  it('identifies value types', () => {
    expect(isArrecadacaoValueType('6')).toBe(true);
    expect(isArrecadacaoValueType('5')).toBe(false);
  });

  it('returns modulo calculators per value type', () => {
    expect(getArrecadacaoDvCalculator('6')('01230067896')).toBe(3);
    expect(getArrecadacaoDvCalculator('8')('01230067896')).toBe(0);
  });

  it('throws for unsupported value type', () => {
    expect(() => getArrecadacaoDvCalculator('5')).toThrow('Unsupported arrecadação value type');
  });

  it('handles modulo 11 remainder 10', () => {
    expect(computeArrecadacaoModulo11Dv('01230067896')).toBe(0);
    expect(computeArrecadacaoModulo11Dv('00000000005')).toBe(1);
  });
});
