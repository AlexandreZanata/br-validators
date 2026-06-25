import { describe, expect, it } from 'vitest';
import { compareRuntime } from '../../src/compare/index.js';
import { diff } from '../../src/diff/index.js';
import { batch } from '../../src/batch/index.js';
import { isPlatformDocumentType, PLATFORM_DOCUMENT_TYPES } from '../../src/platform/types.js';
import { normalizeForPlatform } from '../../src/platform/normalize.js';
import { validateForPlatform } from '../../src/platform/validate-dispatch.js';
import type { PlatformDocumentType, PlatformOptions } from '../../src/platform/types.js';
import cpfVectors from '../vectors/cpf.official.json';
import cnpjVectors from '../vectors/cnpj.official.json';
import cepVectors from '../vectors/cep.official.json';
import placaVectors from '../vectors/placa.official.json';
import pisVectors from '../vectors/pis-pasep.official.json';
import telefoneVectors from '../vectors/telefone.official.json';
import cnhVectors from '../vectors/cnh.official.json';
import renavamVectors from '../vectors/renavam.official.json';
import tituloVectors from '../vectors/titulo-eleitor.official.json';
import processoVectors from '../vectors/processo-judicial.official.json';
import nfeVectors from '../vectors/nfe-chave.official.json';
import boletoVectors from '../vectors/boleto.official.json';
import cartaoVectors from '../vectors/cartao-credito.official.json';
import eanVectors from '../vectors/ean.official.json';
import pixVectors from '../vectors/pix.official.json';
import brcodeVectors from '../vectors/brcode.official.json';
import ieSpVectors from '../vectors/ie.sp.official.json';
import ieSpRuralVectors from '../vectors/inscricao-estadual-produtor-rural.official.json';
import rgSpVectors from '../vectors/rg.sp.official.json';
import arrecadacaoVectors from '../vectors/boleto-arrecadacao.official.json';

describe('platform types', () => {
  it('lists all platform document types', () => {
    for (const type of PLATFORM_DOCUMENT_TYPES) {
      expect(isPlatformDocumentType(type)).toBe(true);
    }
    expect(isPlatformDocumentType('unknown')).toBe(false);
  });
});

describe('normalizeForPlatform + validateForPlatform', () => {
  it('normalizes and validates CPF', () => {
    expect(normalizeForPlatform(cpfVectors.primary.formatted, 'cpf')).toBe(cpfVectors.primary.canonical);
    expect(validateForPlatform(cpfVectors.primary.formatted, 'cpf').ok).toBe(true);
  });

  it('normalizes CNPJ, CEP, placa, PIS, telefone', () => {
    expect(normalizeForPlatform(cnpjVectors.alphanumeric.formatted, 'cnpj')).toBe(
      cnpjVectors.alphanumeric.canonical,
    );
    expect(normalizeForPlatform(cepVectors.primary.formatted, 'cep')).toBe(cepVectors.primary.canonical);
    expect(normalizeForPlatform(placaVectors.mercosul.canonical, 'placa')).toBe(placaVectors.mercosul.canonical);
    expect(normalizeForPlatform(pisVectors.primary.formatted, 'pis-pasep')).toBe(pisVectors.primary.canonical);
    expect(normalizeForPlatform(telefoneVectors.celular.formatted, 'telefone')).toBe(
      telefoneVectors.celular.canonical,
    );
  });

  it('normalizes CNH, RENAVAM, título, NF-e, boleto, cartão', () => {
    expect(normalizeForPlatform(cnhVectors.primary.canonical, 'cnh')).toBe(cnhVectors.primary.canonical);
    expect(normalizeForPlatform(renavamVectors.primary.canonical, 'renavam')).toBe(
      renavamVectors.primary.canonical,
    );
    expect(normalizeForPlatform(tituloVectors.primary.canonical, 'titulo-eleitor')).toBe(
      tituloVectors.primary.canonical,
    );
    expect(normalizeForPlatform(processoVectors.primary.masked, 'processo-judicial')).toBe(
      processoVectors.primary.canonical,
    );
    expect(normalizeForPlatform(nfeVectors.primary.canonical, 'nfe-chave')).toBe(nfeVectors.primary.canonical);
    expect(normalizeForPlatform(boletoVectors.golden.santander.linhaStripped, 'boleto')).toBe(
      boletoVectors.golden.santander.linhaStripped,
    );
    expect(normalizeForPlatform(cartaoVectors.visa.canonical, 'cartao-credito')).toBe(cartaoVectors.visa.canonical);
    expect(normalizeForPlatform(eanVectors.ean13.canonical, 'ean')).toBe(eanVectors.ean13.canonical);
  });

  it('normalizes IE, IE rural, PIX, BR Code, arrecadação', () => {
    expect(
      normalizeForPlatform(ieSpVectors.golden.masked, 'inscricao-estadual', { uf: 'SP' }),
    ).toBe(ieSpVectors.golden.stripped);
    expect(normalizeForPlatform(ieSpRuralVectors.golden.masked, 'inscricao-estadual-produtor-rural')).toBe(
      ieSpRuralVectors.golden.canonical,
    );
    expect(normalizeForPlatform(pixVectors.email.primary, 'pix')).toBe(pixVectors.email.primary);
    expect(normalizeForPlatform(brcodeVectors.staticEvp.payload, 'brcode')).toBe(brcodeVectors.staticEvp.payload);
    expect(normalizeForPlatform(arrecadacaoVectors.primary.linha, 'boleto')).toBe(arrecadacaoVectors.primary.linha);
  });

  it('falls back to stripped value when invalid', () => {
    expect(normalizeForPlatform('123', 'cpf')).toBe('123');
    expect(normalizeForPlatform('bad', 'cnpj')).toBe('BAD');
    expect(normalizeForPlatform('12345', 'cep')).toBe('12345');
    expect(normalizeForPlatform('bad', 'placa')).toBe('BAD');
    expect(normalizeForPlatform('12bad34', 'pis-pasep')).toBe('1234');
    expect(normalizeForPlatform('11bad', 'telefone')).toBe('11');
  });

  it('returns validation success for remaining platform types', () => {
    expect(validateForPlatform(cnpjVectors.alphanumeric.canonical, 'cnpj').ok).toBe(true);
    expect(validateForPlatform(cepVectors.primary.canonical, 'cep').ok).toBe(true);
    expect(validateForPlatform(placaVectors.mercosul.canonical, 'placa').ok).toBe(true);
    expect(validateForPlatform(pisVectors.primary.canonical, 'pis-pasep').ok).toBe(true);
    expect(validateForPlatform(telefoneVectors.celular.canonical, 'telefone').ok).toBe(true);
    expect(validateForPlatform(cnhVectors.primary.canonical, 'cnh').ok).toBe(true);
    expect(validateForPlatform(renavamVectors.primary.canonical, 'renavam').ok).toBe(true);
    expect(validateForPlatform(tituloVectors.primary.canonical, 'titulo-eleitor').ok).toBe(true);
    expect(validateForPlatform(processoVectors.primary.masked, 'processo-judicial').ok).toBe(true);
    expect(validateForPlatform(nfeVectors.primary.canonical, 'nfe-chave').ok).toBe(true);
    expect(
      validateForPlatform(ieSpVectors.golden.stripped, 'inscricao-estadual', { uf: 'SP' }).ok,
    ).toBe(true);
    expect(validateForPlatform(boletoVectors.golden.santander.linhaStripped, 'boleto').ok).toBe(true);
    expect(validateForPlatform(cartaoVectors.visa.canonical, 'cartao-credito').ok).toBe(true);
    expect(validateForPlatform(eanVectors.ean13.canonical, 'ean').ok).toBe(true);
    expect(
      validateForPlatform(ieSpRuralVectors.golden.canonical, 'inscricao-estadual-produtor-rural').ok,
    ).toBe(true);
    expect(validateForPlatform(pixVectors.email.primary, 'pix').ok).toBe(true);
    expect(validateForPlatform(brcodeVectors.staticEvp.payload, 'brcode').ok).toBe(true);
    expect(validateForPlatform(arrecadacaoVectors.primary.linha, 'boleto').ok).toBe(true);
  });

  it('requires uf for inscricao-estadual validation', () => {
    expect(validateForPlatform(ieSpVectors.golden.stripped, 'inscricao-estadual').ok).toBe(false);
  });

  it('normalizes and validates RG with uf', () => {
    expect(normalizeForPlatform(rgSpVectors.valid.masked, 'rg', { uf: 'SP' })).toBe(rgSpVectors.valid.raw);
    expect(validateForPlatform(rgSpVectors.valid.raw, 'rg', { uf: 'SP' }).ok).toBe(true);
    expect(validateForPlatform(rgSpVectors.valid.raw, 'rg').ok).toBe(false);
    expect(normalizeForPlatform(rgSpVectors.valid.masked, 'rg')).toBe(
      rgSpVectors.valid.raw.replace(/[.-]/g, ''),
    );
  });

  it('returns validation failures per platform type', () => {
    const failures: Array<[PlatformDocumentType, string, PlatformOptions?]> = [
      ['cpf', 'bad'],
      ['cnpj', 'bad'],
      ['cep', 'bad'],
      ['placa', 'bad'],
      ['pis-pasep', 'bad'],
      ['telefone', 'bad'],
      ['cnh', 'bad'],
      ['renavam', 'bad'],
      ['titulo-eleitor', 'bad'],
      ['processo-judicial', 'bad'],
      ['nfe-chave', 'bad'],
      ['boleto', 'bad'],
      ['cartao-credito', 'bad'],
      ['ean', eanVectors.modulo10Walkthrough.invalid],
      ['inscricao-estadual', 'bad', { uf: 'SP' }],
      ['inscricao-estadual-produtor-rural', 'bad'],
      ['rg', 'bad', { uf: 'SP' }],
      ['pix', 'bad'],
      ['brcode', 'bad'],
    ];
    for (const [type, input, options] of failures) {
      expect(validateForPlatform(input, type, options).ok).toBe(false);
    }
  });

  it('normalize default branch', () => {
    const badType = 'unsupported' as PlatformDocumentType;
    expect(normalizeForPlatform('x', badType)).toBe('x');
  });

  it('normalize inscricao-estadual without uf falls back to stripped', () => {
    expect(normalizeForPlatform(ieSpVectors.golden.masked, 'inscricao-estadual')).toBe(
      ieSpVectors.golden.stripped,
    );
  });

  it('validateForPlatform default branch', () => {
    const badType = 'unsupported' as PlatformDocumentType;
    expect(validateForPlatform('x', badType)).toEqual({
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'Unsupported type: unsupported',
    });
  });
});

describe('diff default branch', () => {
  it('handles unsupported type via cast', () => {
    const badType = 'unsupported' as PlatformDocumentType;
    expect(diff('a', 'b', badType)).toEqual({ changed: true, fields: [{ field: 'value', a: 'a', b: 'b' }] });
  });
});

describe('compareRuntime success', () => {
  it('delegates known types', () => {
    expect(compareRuntime(cpfVectors.primary.formatted, cpfVectors.primary.canonical, 'cpf')).toEqual({
      equal: true,
    });
  });
});

describe('diff field coverage', () => {
  it('splits telefone, pis, cnh, renavam, titulo, nfe fields', () => {
    expect(diff(telefoneVectors.celular.canonical, '11999999998', 'telefone').fields).toEqual(
      expect.arrayContaining([{ field: 'subscriber', a: '999999999', b: '999999998' }]),
    );
    expect(diff(pisVectors.primary.canonical, `${pisVectors.primary.canonical.slice(0, 10)}0`, 'pis-pasep').fields).toEqual(
      expect.arrayContaining([{ field: 'dv', a: pisVectors.primary.canonical.slice(10), b: '0' }]),
    );
    expect(diff(cnhVectors.primary.canonical, `${cnhVectors.primary.canonical.slice(0, 9)}00`, 'cnh').fields.length).toBeGreaterThan(0);
    expect(diff(renavamVectors.primary.canonical, `${renavamVectors.primary.canonical.slice(0, 10)}0`, 'renavam').fields).toEqual(
      expect.arrayContaining([{ field: 'dv', a: renavamVectors.primary.canonical.slice(10), b: '0' }]),
    );
    expect(diff(tituloVectors.primary.canonical, `${tituloVectors.primary.canonical.slice(0, 8)}000000`, 'titulo-eleitor').fields.length).toBeGreaterThan(0);
    expect(
      diff(
        processoVectors.primary.canonical,
        `${processoVectors.primary.canonical.slice(0, 7)}35${processoVectors.primary.canonical.slice(9)}`,
        'processo-judicial',
      ).fields,
    ).toEqual(expect.arrayContaining([{ field: 'checkDigits', a: '34', b: '35' }]));
    expect(diff(nfeVectors.primary.canonical, `${nfeVectors.primary.canonical.slice(0, 43)}0`, 'nfe-chave').fields).toEqual(
      expect.arrayContaining([{ field: 'cDV', a: nfeVectors.primary.canonical.slice(43), b: '0' }]),
    );
  });

  it('diffs opaque platform types', () => {
    expect(diff('4111111111111111', '4111111111111112', 'cartao-credito').changed).toBe(true);
    expect(diff(eanVectors.ean13.canonical, eanVectors.modulo10Walkthrough.invalid, 'ean').changed).toBe(true);
    expect(diff('x', 'y', 'pix').fields).toEqual([{ field: 'value', a: 'x', b: 'y' }]);
    expect(diff('a', 'b', 'brcode').changed).toBe(true);
    expect(diff('1', '2', 'boleto').changed).toBe(true);
    expect(diff('1', '2', 'inscricao-estadual', { uf: 'SP' }).changed).toBe(true);
    expect(diff('P1', 'P2', 'inscricao-estadual-produtor-rural').changed).toBe(true);
    expect(diff(rgSpVectors.valid.raw, '120300012', 'rg', { uf: 'SP' }).changed).toBe(true);
  });
});

describe('batch extra types', () => {
  it('validates a PIX row', () => {
    const result = batch([pixVectors.email.primary], 'pix');
    expect(result.summary.valid).toBe(1);
  });
});
