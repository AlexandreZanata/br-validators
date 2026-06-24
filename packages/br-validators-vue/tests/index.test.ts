import { describe, expect, it } from 'vitest';
import { CPF_GOLDEN_PRIMARY } from '@br-validators/core';
import { BR_VALIDATOR_V1_TYPE_IDS, isBrValidatorV1TypeId } from '../src/index.js';
import { setValue, withComposableScope } from './test-helpers.js';

describe('package exports', () => {
  it('lists v1 validator type ids', () => {
    expect(BR_VALIDATOR_V1_TYPE_IDS).toContain('cpf');
    expect(BR_VALIDATOR_V1_TYPE_IDS).toHaveLength(6);
  });

  it('narrows validator type ids', () => {
    expect(isBrValidatorV1TypeId('cpf')).toBe(true);
    expect(isBrValidatorV1TypeId('rg')).toBe(false);
  });
});

describe('subpath exports', () => {
  it('imports useCpf from subpath', async () => {
    const { useCpf } = await import('../src/cpf.js');
    const cpf = withComposableScope(() => useCpf());
    setValue(cpf, CPF_GOLDEN_PRIMARY);
    expect(cpf.isValid.value).toBe(true);
  });
});

describe('test helpers', () => {
  it('throws when composable scope returns undefined', () => {
    expect(() => withComposableScope(() => undefined as never)).toThrow('Composable scope returned undefined');
  });
});
