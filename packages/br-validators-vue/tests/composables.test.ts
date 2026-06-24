import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import {
  CEP_GOLDEN_PRIMARY,
  CNPJ_GOLDEN_ALPHANUMERIC,
  CPF_GOLDEN_PRIMARY,
  IE_SP_GOLDEN,
  PIX_GOLDEN_EMAIL,
  TELEFONE_GOLDEN_CELULAR_MASKED,
} from '@br-validators/core';
import {
  useBrValidator,
  useCep,
  useCnpj,
  useCpf,
  useInscricaoEstadual,
  usePix,
  useTelefone,
} from '../src/index.js';
import { setValue, withComposableScope } from './test-helpers.js';

describe('useBrValidator', () => {
  it('exposes reactive state for valid CPF', () => {
    const cpf = withComposableScope(() => {
      const composable = useBrValidator('cpf', { initialValue: CPF_GOLDEN_PRIMARY });
      return composable;
    });

    expect(cpf.isValid.value).toBe(true);
    expect(cpf.error.value).toBeNull();
    expect(cpf.formatted.value).toBeTruthy();
    expect(cpf.validate()).toBe(true);
  });

  it('updates when value changes', () => {
    const cpf = withComposableScope(() => useBrValidator('cpf'));
    setValue(cpf, CPF_GOLDEN_PRIMARY);
    expect(cpf.isValid.value).toBe(true);
    setValue(cpf, '00000000000');
    expect(cpf.isValid.value).toBe(false);
    expect(cpf.error.value).toBeTruthy();
  });

  it('reacts to UF ref changes for IE', () => {
    const uf = ref<'SP' | 'RJ'>('SP');
    const ie = withComposableScope(() => useBrValidator('inscricao-estadual', { uf }));
    setValue(ie, IE_SP_GOLDEN);
    expect(ie.isValid.value).toBe(true);

    uf.value = 'RJ';
    expect(ie.isValid.value).toBe(false);
  });

  it('reacts to pixType ref changes', () => {
    const pixType = ref<'email' | 'cpf'>('email');
    const pix = withComposableScope(() => useBrValidator('pix', { pixType }));
    setValue(pix, PIX_GOLDEN_EMAIL);
    expect(pix.isValid.value).toBe(true);

    pixType.value = 'cpf';
    expect(pix.isValid.value).toBe(false);
  });
});

describe('named composables — golden vectors', () => {
  it('useCpf accepts golden CPF', () => {
    const cpf = withComposableScope(() => useCpf());
    setValue(cpf, CPF_GOLDEN_PRIMARY);
    expect(cpf.isValid.value).toBe(true);
  });

  it('useCnpj accepts golden CNPJ', () => {
    const cnpj = withComposableScope(() => useCnpj());
    setValue(cnpj, CNPJ_GOLDEN_ALPHANUMERIC);
    expect(cnpj.isValid.value).toBe(true);
  });

  it('useCep accepts golden CEP', () => {
    const cep = withComposableScope(() => useCep());
    setValue(cep, CEP_GOLDEN_PRIMARY);
    expect(cep.isValid.value).toBe(true);
  });

  it('useTelefone accepts golden celular', () => {
    const telefone = withComposableScope(() => useTelefone());
    setValue(telefone, TELEFONE_GOLDEN_CELULAR_MASKED);
    expect(telefone.isValid.value).toBe(true);
  });

  it('usePix accepts golden email key without type constraint', () => {
    const pix = withComposableScope(() => usePix());
    setValue(pix, PIX_GOLDEN_EMAIL);
    expect(pix.isValid.value).toBe(true);
  });

  it('usePix accepts golden email key', () => {
    const pix = withComposableScope(() => usePix({ pixType: 'email' }));
    setValue(pix, PIX_GOLDEN_EMAIL);
    expect(pix.isValid.value).toBe(true);
  });

  it('useInscricaoEstadual accepts golden SP IE', () => {
    const ie = withComposableScope(() => useInscricaoEstadual({ uf: 'SP' }));
    setValue(ie, IE_SP_GOLDEN);
    expect(ie.isValid.value).toBe(true);
  });
});

describe('empty input', () => {
  it('returns neutral invalid state without error message', () => {
    const cpf = withComposableScope(() => useCpf());
    expect(cpf.isValid.value).toBe(false);
    expect(cpf.error.value).toBeNull();
    expect(cpf.formatted.value).toBeNull();
    expect(cpf.validate()).toBe(false);
  });
});
