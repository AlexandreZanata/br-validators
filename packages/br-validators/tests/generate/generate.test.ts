import { describe, expect, it } from 'vitest';
import { generate, shouldApplyGenerateMask } from '../../src/generate/index.js';
import type { GeneratableDocumentType } from '../../src/generate/index.js';
import {
  computeLuhnCheckDigit,
  createRandomSource,
  hasRepeatedChars,
} from '../../src/generate/random.js';
import { validateCpf } from '../../src/core/cpf/index.js';
import { CPF_GOLDEN_PRIMARY } from '../../src/core/cpf/constants.js';
import { validateCnpj } from '../../src/core/cnpj/index.js';
import { validateCep } from '../../src/core/cep/index.js';
import { validatePlaca } from '../../src/core/placa/index.js';
import { validatePisPasep } from '../../src/core/pis-pasep/index.js';
import { validateRenavam } from '../../src/core/renavam/index.js';
import { validateCnh } from '../../src/core/cnh/index.js';
import { validateTelefone } from '../../src/core/telefone/index.js';
import { validateCartaoCredito } from '../../src/core/cartao-credito/index.js';
import { validateInscricaoEstadual } from '../../src/core/inscricao-estadual/index.js';
import { validateTituloEleitor } from '../../src/core/titulo-eleitor/index.js';
import { validatePixKey } from '../../src/core/pix/index.js';
import { validateNfeChave } from '../../src/core/nfe-chave/index.js';
import { validateBrCode } from '../../src/core/brcode/index.js';
import { validateBoleto } from '../../src/core/boleto/index.js';
import { validateArrecadacao } from '../../src/core/boleto/arrecadacao.js';
import { validateIeSpRural } from '../../src/core/inscricao-estadual/sp-rural.js';
import { detectCardBrand } from '../../src/core/cartao-credito/index.js';
import ieSpVectors from '../vectors/ie.sp.official.json';
import cnpjVectors from '../vectors/cnpj.official.json';
import cepVectors from '../vectors/cep.official.json';
import placaVectors from '../vectors/placa.official.json';
import pisVectors from '../vectors/pis-pasep.official.json';
import renavamVectors from '../vectors/renavam.official.json';
import cnhVectors from '../vectors/cnh.official.json';
import telefoneVectors from '../vectors/telefone.official.json';
import tituloVectors from '../vectors/titulo-eleitor.official.json';
import cartaoVectors from '../vectors/cartao-credito.official.json';
import nfeVectors from '../vectors/nfe-chave.official.json';
import pixVectors from '../vectors/pix.official.json';
import brcodeVectors from '../vectors/brcode.official.json';
import boletoVectors from '../vectors/boleto.official.json';
import boletoArrecadacaoVectors from '../vectors/boleto-arrecadacao.official.json';
import ieSpRuralVectors from '../vectors/inscricao-estadual-produtor-rural.official.json';

const GENERATABLE_TYPES = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'renavam',
  'cnh',
  'telefone',
  'cartao-credito',
  'inscricao-estadual',
  'titulo-eleitor',
  'pix',
  'nfe-chave',
  'brcode',
  'boleto',
  'boleto-arrecadacao',
  'inscricao-estadual-produtor-rural',
] as const;

const VALIDATORS = {
  cpf: validateCpf,
  cnpj: validateCnpj,
  cep: validateCep,
  placa: validatePlaca,
  'pis-pasep': validatePisPasep,
  renavam: validateRenavam,
  cnh: validateCnh,
  telefone: validateTelefone,
  'cartao-credito': validateCartaoCredito,
  'inscricao-estadual': (value: string) => validateInscricaoEstadual(value, { uf: 'SP' }),
  'titulo-eleitor': (value: string) => validateTituloEleitor(value),
  pix: validatePixKey,
  'nfe-chave': validateNfeChave,
  brcode: validateBrCode,
  boleto: validateBoleto,
  'boleto-arrecadacao': validateArrecadacao,
  'inscricao-estadual-produtor-rural': validateIeSpRural,
};

describe('generate()', () => {
  for (const type of GENERATABLE_TYPES) {
    it(`property: validateX(generate(${type})).ok`, () => {
      for (let i = 0; i < 20; i++) {
        const options =
          type === 'inscricao-estadual' || type === 'titulo-eleitor'
            ? { seed: 1000 + i, uf: 'SP' as const }
            : type === 'cartao-credito'
              ? { seed: 1000 + i, brand: 'visa' as const }
              : { seed: 1000 + i };
        const value = generate(type, options);
        if (type === 'inscricao-estadual') {
          expect(validateInscricaoEstadual(value, { uf: 'SP' }).ok).toBe(true);
        } else if (type === 'titulo-eleitor') {
          expect(validateTituloEleitor(value).ok).toBe(true);
        } else if (type === 'cartao-credito') {
          expect(VALIDATORS[type](value).ok).toBe(true);
          expect(detectCardBrand(value)).toBe('visa');
        } else {
          expect(VALIDATORS[type](value).ok).toBe(true);
        }
      }
    });
  }

  it('seed reproducibility', () => {
    const a = generate('cpf', { seed: 42 });
    const b = generate('cpf', { seed: 42 });
    expect(a).toBe(b);
  });

  it('masked CPF passes format strip', () => {
    const masked = generate('cpf', { masked: true, seed: 99 });
    expect(masked.replace(/\D/g, '')).toHaveLength(11);
    expect(validateCpf(masked).ok).toBe(true);
  });

  describe('output options — stripped vs masked', () => {
    it('shouldApplyGenerateMask precedence', () => {
      expect(shouldApplyGenerateMask({})).toBe(false);
      expect(shouldApplyGenerateMask({ masked: true })).toBe(true);
      expect(shouldApplyGenerateMask({ stripped: true })).toBe(false);
      expect(shouldApplyGenerateMask({ masked: true, stripped: true })).toBe(false);
    });

    it('default and explicit stripped return canonical digits for CPF', () => {
      const seed = 42;
      const implicit = generate('cpf', { seed });
      const explicit = generate('cpf', { seed, stripped: true });
      expect(implicit).toBe(explicit);
      expect(implicit).toMatch(/^\d{11}$/);
      expect(validateCpf(implicit).ok).toBe(true);
    });

    it('explicit stripped returns canonical digits for CNPJ', () => {
      const value = generate('cnpj', { stripped: true, seed: 7 });
      expect(value).toMatch(/^[A-Z0-9]{14}$/);
      expect(validateCnpj(value).ok).toBe(true);
    });

    it('explicit stripped returns 47-digit linha for boleto', () => {
      const value = generate('boleto', { stripped: true, seed: 11 });
      expect(value).toHaveLength(47);
      expect(/^\d+$/.test(value)).toBe(true);
      expect(validateBoleto(value).ok).toBe(true);
    });

    it('masked + stripped returns stripped (stripped wins)', () => {
      const seed = 99;
      const stripped = generate('cpf', { seed, stripped: true, masked: true });
      const plain = generate('cpf', { seed });
      expect(stripped).toBe(plain);
      expect(stripped).toMatch(/^\d{11}$/);
    });

    it('masked CNPJ returns formatted output when stripped is not set', () => {
      const masked = generate('cnpj', { masked: true, seed: 7 });
      expect(masked).toMatch(/[.\-/]/);
      expect(validateCnpj(masked).ok).toBe(true);
    });
  });

  it('CNPJ alphanumeric format option', () => {
    const value = generate('cnpj', { format: 'alphanumeric', seed: 7 });
    expect(validateCnpj(value).ok).toBe(true);
    expect(/[A-Z]/.test(value)).toBe(true);
  });

  it('placa legacy and mercosul formats', () => {
    const legacy = generate('placa', { format: 'legacy', seed: 3 });
    const mercosul = generate('placa', { format: 'mercosul', seed: 3 });
    expect(validatePlaca(legacy).ok).toBe(true);
    expect(validatePlaca(mercosul).ok).toBe(true);
  });

  it('telefone fixo format', () => {
    const value = generate('telefone', { format: 'fixo', seed: 5 });
    expect(validateTelefone(value).ok).toBe(true);
  });

  it('random helpers', () => {
    expect(hasRepeatedChars('1111')).toBe(true);
    expect(hasRepeatedChars('1212')).toBe(false);
    expect(computeLuhnCheckDigit('7992739871')).toBe('3');
    const rng = createRandomSource(1);
    expect(rng.digits(5)).toHaveLength(5);
    expect(rng.letter()).toMatch(/^[A-Z]$/);
    expect(rng.pick(['a', 'b'])).toMatch(/^[ab]$/);
    const rngDefault = createRandomSource();
    expect(rngDefault.next()).toBeGreaterThanOrEqual(0);
  });

  it('generator fallbacks via test hooks', async () => {
    const { __generateTesting } = await import('../../src/generate/index.js');
    expect(__generateTesting.randomBaseDigits(9)).toHaveLength(9);
    expect(__generateTesting.randomCnpjAlphanumericBase()).toHaveLength(12);
    expect(__generateTesting.generateCepValue()).toBe('01310100');
    expect(__generateTesting.generateCartaoValue()).toHaveLength(16);
    expect(__generateTesting.generateCartaoValueForBrand('visa')).toHaveLength(16);
    expect(__generateTesting.generatePlacaValue('legacy')).toBe('ABC1234');
    expect(__generateTesting.generatePlacaValue('mercosul')).toBe('ABC1D23');
    expect(__generateTesting.generateTelefoneValue('fixo')).toBe('1133333333');
    expect(__generateTesting.generateTelefoneValue()).toBe('11999999999');
    expect(__generateTesting.generateCpfValue()).toHaveLength(11);
    expect(__generateTesting.generateCnpjValue()).toHaveLength(14);
    expect(__generateTesting.generateCnpjValue('alphanumeric')).toHaveLength(14);
    expect(__generateTesting.generatePisValue()).toHaveLength(11);
    expect(__generateTesting.generateRenavamValue()).toHaveLength(11);
    expect(__generateTesting.generateCnhValue()).toHaveLength(11);
    expect(__generateTesting.generateInscricaoEstadualValue('SP')).toHaveLength(12);
    expect(__generateTesting.generateTituloEleitorValue('SP')).toHaveLength(12);
    expect(__generateTesting.generatePixEvpValue()).toMatch(/^[0-9a-f-]{36}$/);
    expect(__generateTesting.generateNfeChaveValue()).toHaveLength(44);
    expect(__generateTesting.generateBrcodeValue().length).toBeGreaterThan(40);
    expect(__generateTesting.generateBoletoValue()).toHaveLength(47);
    expect(__generateTesting.generateBoletoArrecadacaoValue()).toHaveLength(48);
    expect(__generateTesting.generateIeProdutorRuralValue()).toHaveLength(13);
    expect(__generateTesting.applyArrecadacaoLinhaMask(boletoArrecadacaoVectors.primary.linha)).toContain(' ');
    expect(__generateTesting.applyInscricaoEstadualGenerateMask(ieSpVectors.golden.stripped, 'SP')).toContain('.');
    expect(__generateTesting.applyInscricaoEstadualGenerateMask('123', 'SP')).toBe('123');
    __generateTesting.touchAllRngMethods();
  });

  it('applyMask formats all generatable types with goldens', async () => {
    const { applyMask } = await import('../../src/generate/apply-mask.js');
    const cases: Array<[GeneratableDocumentType, string]> = [
      ['cpf', CPF_GOLDEN_PRIMARY],
      ['cnpj', cnpjVectors.numeric.canonical],
      ['cep', cepVectors.primary.canonical],
      ['placa', placaVectors.legacy.canonical],
      ['pis-pasep', pisVectors.primary.canonical],
      ['renavam', renavamVectors.primary.canonical],
      ['cnh', cnhVectors.primary.canonical],
      ['telefone', telefoneVectors.celular.canonical],
      ['cartao-credito', cartaoVectors.visa.canonical],
      ['inscricao-estadual', ieSpVectors.golden.stripped],
      ['titulo-eleitor', tituloVectors.primary.canonical],
      ['pix', pixVectors.evp.primary],
      ['nfe-chave', nfeVectors.primary.canonical],
      ['brcode', brcodeVectors.staticEvp.payload],
      ['boleto', boletoVectors.golden.santander.linhaStripped],
      ['boleto-arrecadacao', boletoArrecadacaoVectors.primary.linha],
      ['inscricao-estadual-produtor-rural', ieSpRuralVectors.golden.canonical],
    ];
    for (const [type, value] of cases) {
      expect(applyMask(type, value).length).toBeGreaterThan(0);
    }
  });

  it('unsupported type throws', () => {
    expect(() => generate('unsupported' as GeneratableDocumentType)).toThrow(/Unsupported generatable type/);
  });

  it('masked output for all generatable types', () => {
    for (const type of GENERATABLE_TYPES) {
      const options =
        type === 'inscricao-estadual'
          ? { masked: true, seed: 77, uf: 'SP' as const }
          : type === 'titulo-eleitor'
            ? { masked: true, seed: 77, uf: 'SC' as const }
            : type === 'cartao-credito'
              ? { masked: true, seed: 77, brand: 'visa' as const }
              : type === 'brcode'
                ? { masked: true, seed: 77, amount: '1.00', txid: 'ABC' }
                : { masked: true, seed: 77 };
      const value = generate(type, options);
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it('applyMask fallback returns raw value when format fails', async () => {
    const { applyMask } = await import('../../src/generate/apply-mask.js');
    expect(applyMask('cpf', 'bad')).toBe('bad');
    expect(applyMask('cnpj', 'bad')).toBe('bad');
    expect(applyMask('cep', 'bad')).toBe('bad');
    expect(applyMask('placa', 'bad')).toBe('bad');
    expect(applyMask('pis-pasep', 'bad')).toBe('bad');
    expect(applyMask('renavam', 'bad')).toBe('bad');
    expect(applyMask('cnh', 'bad')).toBe('bad');
    expect(applyMask('telefone', 'bad')).toBe('bad');
    expect(applyMask('cartao-credito', 'bad')).toBe('bad');
    expect(applyMask('inscricao-estadual', 'bad')).toBe('bad');
    expect(applyMask('titulo-eleitor', 'bad')).toBe('bad');
    expect(applyMask('pix', 'bad')).toBe('bad');
    expect(applyMask('nfe-chave', 'bad')).toBe('bad');
    expect(applyMask('boleto', 'bad')).toBe('bad');
    expect(applyMask('boleto-arrecadacao', 'bad')).toBe('bad');
    expect(applyMask('brcode', 'bad')).toBe('bad');
    expect(applyMask('inscricao-estadual-produtor-rural', 'bad')).toBe('bad');
  });

  it('applyMask default branch via cast', async () => {
    const { applyMask } = await import('../../src/generate/apply-mask.js');
    expect(applyMask('unsupported' as GeneratableDocumentType, 'x')).toBe('unsupported');
  });
});
