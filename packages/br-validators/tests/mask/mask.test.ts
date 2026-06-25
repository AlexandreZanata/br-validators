import { describe, expect, it } from 'vitest';
import {
  isMaskableDocumentType,
  mask,
  maskRuntime,
  MASKABLE_DOCUMENT_TYPES,
} from '../../src/mask/index.js';
import type { MaskableDocumentType } from '../../src/mask/index.js';
import boletoVectors from '../vectors/boleto.official.json';
import cartaoVectors from '../vectors/cartao-credito.official.json';
import eanVectors from '../vectors/ean.official.json';
import cepVectors from '../vectors/cep.official.json';
import cnhVectors from '../vectors/cnh.official.json';
import cnpjVectors from '../vectors/cnpj.official.json';
import cpfVectors from '../vectors/cpf.official.json';
import ieSpRuralVectors from '../vectors/inscricao-estadual-produtor-rural.official.json';
import rgSpVectors from '../vectors/rg.sp.official.json';
import ieSpVectors from '../vectors/ie.sp.official.json';
import nfeVectors from '../vectors/nfe-chave.official.json';
import pisVectors from '../vectors/pis-pasep.official.json';
import pixVectors from '../vectors/pix.official.json';
import placaVectors from '../vectors/placa.official.json';
import renavamVectors from '../vectors/renavam.official.json';
import telefoneVectors from '../vectors/telefone.official.json';
import tituloVectors from '../vectors/titulo-eleitor.official.json';
import processoVectors from '../vectors/processo-judicial.official.json';

describe('mask()', () => {
  it('masks CPF golden vector', () => {
    const result = mask(cpfVectors.primary.canonical, 'cpf');
    expect(result).toEqual({ ok: true, formatted: cpfVectors.primary.formatted });
  });

  it('masks CNPJ alphanumeric golden vector', () => {
    const result = mask(cnpjVectors.alphanumeric.canonical, 'cnpj');
    expect(result).toEqual({ ok: true, formatted: cnpjVectors.alphanumeric.formatted });
  });

  it('masks CEP golden vector', () => {
    const result = mask(cepVectors.primary.canonical, 'cep');
    expect(result).toEqual({ ok: true, formatted: cepVectors.primary.formatted });
  });

  it('masks placa golden vector', () => {
    const result = mask(placaVectors.mercosul.canonical, 'placa');
    expect(result).toEqual({ ok: true, formatted: placaVectors.mercosul.canonical });
  });

  it('masks PIS/PASEP golden vector', () => {
    const result = mask(pisVectors.primary.canonical, 'pis-pasep');
    expect(result).toEqual({ ok: true, formatted: pisVectors.primary.formatted });
  });

  it('masks telefone celular golden vector', () => {
    const result = mask(telefoneVectors.celular.canonical, 'telefone');
    expect(result).toEqual({ ok: true, formatted: telefoneVectors.celular.formatted });
  });

  it('masks CNH golden vector', () => {
    const result = mask(cnhVectors.primary.canonical, 'cnh');
    expect(result).toEqual({ ok: true, formatted: cnhVectors.primary.officialFormatted });
  });

  it('masks RENAVAM golden vector', () => {
    const result = mask(renavamVectors.primary.canonical, 'renavam');
    expect(result).toEqual({ ok: true, formatted: renavamVectors.primary.officialFormatted });
  });

  it('masks título eleitor golden vector', () => {
    const result = mask(tituloVectors.primary.canonical, 'titulo-eleitor');
    expect(result).toEqual({ ok: true, formatted: tituloVectors.primary.officialFormatted });
  });

  it('masks processo judicial CNJ golden vector', () => {
    const result = mask(processoVectors.primary.canonical, 'processo-judicial');
    expect(result).toEqual({ ok: true, formatted: processoVectors.primary.masked });
  });

  it('masks NF-e chave golden vector', () => {
    const result = mask(nfeVectors.primary.canonical, 'nfe-chave');
    expect(result).toEqual({ ok: true, formatted: nfeVectors.primary.officialFormatted });
  });

  it('masks boleto linha digitável golden vector', () => {
    const result = mask(boletoVectors.golden.santander.linhaStripped, 'boleto');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.formatted).toBe(boletoVectors.golden.santander.linhaMasked);
    }
  });

  it('masks cartão de crédito golden vector', () => {
    const result = mask(cartaoVectors.visa.canonical, 'cartao-credito');
    expect(result).toEqual({ ok: true, formatted: cartaoVectors.visa.masked });
    const eanResult = mask(eanVectors.ean13.canonical, 'ean');
    expect(eanResult).toEqual({ ok: true, formatted: eanVectors.ean13.masked });
  });

  it('masks IE SP golden vector with uf', () => {
    const result = mask(ieSpVectors.golden.stripped, 'inscricao-estadual', { uf: 'SP' });
    expect(result).toEqual({ ok: true, formatted: ieSpVectors.golden.masked });
  });

  it('masks IE produtor rural golden vector', () => {
    const result = mask(ieSpRuralVectors.golden.canonical, 'inscricao-estadual-produtor-rural');
    expect(result).toEqual({ ok: true, formatted: ieSpRuralVectors.golden.masked });
  });

  it('masks PIX email golden vector', () => {
    const result = mask(pixVectors.email.primary, 'pix');
    expect(result).toEqual({ ok: true, formatted: pixVectors.email.primary });
  });

  it('requires uf for inscricao-estadual', () => {
    const result = mask(ieSpVectors.golden.stripped, 'inscricao-estadual');
    expect(result).toMatchObject({ ok: false, code: 'UNSUPPORTED_FORMAT' });
  });

  it('masks RG SP golden vector with uf', () => {
    const result = mask(rgSpVectors.valid.raw, 'rg', { uf: 'SP' });
    expect(result).toEqual({ ok: true, formatted: rgSpVectors.valid.masked });
  });

  it('requires uf for rg', () => {
    const result = mask(rgSpVectors.valid.raw, 'rg');
    expect(result).toMatchObject({ ok: false, code: 'UNSUPPORTED_FORMAT' });
  });

  it('rejects invalid input without partial mask', () => {
    const result = mask('invalid', 'cpf');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result).not.toHaveProperty('formatted');
    }
  });

  it('returns validation failure per type', () => {
    expect(mask('bad', 'cnpj').ok).toBe(false);
    expect(mask('bad', 'cep').ok).toBe(false);
    expect(mask('bad', 'placa').ok).toBe(false);
    expect(mask('bad', 'telefone').ok).toBe(false);
    expect(mask('bad', 'cnh').ok).toBe(false);
    expect(mask('bad', 'renavam').ok).toBe(false);
    expect(mask('bad', 'titulo-eleitor').ok).toBe(false);
    expect(mask('bad', 'processo-judicial').ok).toBe(false);
    expect(mask('bad', 'nfe-chave').ok).toBe(false);
    expect(mask('bad', 'boleto').ok).toBe(false);
    expect(mask('bad', 'cartao-credito').ok).toBe(false);
    expect(mask('bad', 'ean').ok).toBe(false);
    expect(mask('bad', 'pis-pasep').ok).toBe(false);
    expect(mask('bad', 'pix').ok).toBe(false);
    expect(mask('bad', 'inscricao-estadual-produtor-rural').ok).toBe(false);
    expect(mask('bad', 'inscricao-estadual', { uf: 'SP' }).ok).toBe(false);
    expect(mask('bad', 'rg', { uf: 'SP' }).ok).toBe(false);
  });

  it('unsupported type hits default branch', () => {
    const badType = 'unsupported' as MaskableDocumentType;
    expect(mask('x', badType).ok).toBe(false);
  });
});

describe('maskRuntime()', () => {
  it('delegates known types', () => {
    expect(maskRuntime('cpf', cpfVectors.primary.canonical)).toEqual({
      ok: true,
      formatted: cpfVectors.primary.formatted,
    });
  });

  it('rejects unknown document type', () => {
    expect(maskRuntime('phone', '11999999999')).toMatchObject({
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'Unknown document type: phone',
    });
  });
});

describe('isMaskableDocumentType()', () => {
  it('recognizes all maskable types', () => {
    for (const type of MASKABLE_DOCUMENT_TYPES) {
      expect(isMaskableDocumentType(type)).toBe(true);
    }
    expect(isMaskableDocumentType('phone')).toBe(false);
  });
});
