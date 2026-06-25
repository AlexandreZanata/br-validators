import { describe, expect, it } from 'vitest';
import { sanitize } from '../../src/sanitize/index.js';
import { applyFixes, stripForType } from '../../src/sanitize/fixes.js';
import type { SanitizableDocumentType } from '../../src/sanitize/index.js';
import cpfVectors from '../vectors/cpf.official.json';
import placaVectors from '../vectors/placa.official.json';
import cepVectors from '../vectors/cep.official.json';
import cnpjVectors from '../vectors/cnpj.official.json';
import telefoneVectors from '../vectors/telefone.official.json';
import cnhVectors from '../vectors/cnh.official.json';
import renavamVectors from '../vectors/renavam.official.json';
import tituloVectors from '../vectors/titulo-eleitor.official.json';
import processoVectors from '../vectors/processo-judicial.official.json';
import nfeVectors from '../vectors/nfe-chave.official.json';
import boletoVectors from '../vectors/boleto.official.json';
import cartaoVectors from '../vectors/cartao-credito.official.json';
import eanVectors from '../vectors/ean.official.json';
import pisVectors from '../vectors/pis-pasep.official.json';

import ieSpRuralVectors from '../vectors/inscricao-estadual-produtor-rural.official.json';
import ieSpVectors from '../vectors/ie.sp.official.json';
import rgSpVectors from '../vectors/rg.sp.official.json';

describe('sanitize()', () => {
  it('sanitizes masked CPF with fixes', () => {
    const result = sanitize(`  ${cpfVectors.primary.formatted} `, 'cpf');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(cpfVectors.primary.canonical);
      expect(result.fixes).toContain('trimmed');
      expect(result.fixes).toContain('removed_non_digits');
    }
  });

  it('sanitizes placa from messy input', () => {
    const result = sanitize('abc-1234', 'placa');
    expect(result).toMatchObject({ ok: true, value: placaVectors.legacy.canonical });
  });

  it('sanitizes CEP with spaces', () => {
    const result = sanitize(' 01310 100 ', 'cep');
    expect(result).toMatchObject({ ok: true, value: cepVectors.primary.canonical });
  });

  it('sanitizes CNPJ alphanumeric', () => {
    const result = sanitize(cnpjVectors.alphanumeric.formatted.toLowerCase(), 'cnpj');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fixes).toContain('uppercased');
    }
  });

  it('sanitizes telefone with national normalization', () => {
    const result = sanitize(telefoneVectors.withCountryCode.input, 'telefone');
    expect(result.ok).toBe(true);
  });

  it('sanitizes IE produtor rural masked golden', () => {
    const result = sanitize(ieSpRuralVectors.golden.masked, 'inscricao-estadual-produtor-rural');
    expect(result).toMatchObject({ ok: true, value: ieSpRuralVectors.golden.canonical });
  });

  it('sanitizes IE with uf', () => {
    const result = sanitize(ieSpVectors.golden.masked, 'inscricao-estadual', { uf: 'SP' });
    expect(result).toMatchObject({ ok: true, value: ieSpVectors.golden.stripped });
  });

  it('requires uf for inscricao-estadual', () => {
    const result = sanitize(ieSpVectors.golden.masked, 'inscricao-estadual');
    expect(result).toMatchObject({ ok: false, code: 'UNSUPPORTED_FORMAT' });
  });

  it('sanitizes RG with uf', () => {
    const result = sanitize(rgSpVectors.valid.masked, 'rg', { uf: 'SP' });
    expect(result).toMatchObject({ ok: true, value: rgSpVectors.valid.raw });
  });

  it('requires uf for rg', () => {
    const result = sanitize(rgSpVectors.valid.masked, 'rg');
    expect(result).toMatchObject({ ok: false, code: 'UNSUPPORTED_FORMAT' });
  });

  it('returns validation failure for bad CPF', () => {
    const result = sanitize('bad', 'cpf');
    expect(result.ok).toBe(false);
  });

  it('applyFixes covers all document types', () => {
    const types = [
      'cpf',
      'cnpj',
      'cep',
      'placa',
      'pis-pasep',
      'telefone',
      'cnh',
      'renavam',
      'titulo-eleitor',
      'processo-judicial',
      'rg',
      'nfe-chave',
      'boleto',
      'cartao-credito',
      'ean',
      'inscricao-estadual',
      'inscricao-estadual-produtor-rural',
    ] as const;
    for (const type of types) {
      const fixed = applyFixes('  test-value  ', type);
      expect(fixed.fixes).toContain('trimmed');
      expect(stripForType(fixed.value, type)).toBeDefined();
    }
  });

  it('sanitizes remaining document types', () => {
    expect(sanitize(cnhVectors.primary.officialFormatted, 'cnh').ok).toBe(true);
    expect(sanitize(renavamVectors.primary.canonical, 'renavam').ok).toBe(true);
    expect(sanitize(tituloVectors.primary.officialFormatted, 'titulo-eleitor').ok).toBe(true);
    expect(sanitize(processoVectors.primary.masked, 'processo-judicial').ok).toBe(true);
    expect(sanitize(nfeVectors.primary.officialFormatted, 'nfe-chave').ok).toBe(true);
    expect(sanitize(boletoVectors.golden.santander.linhaMasked, 'boleto').ok).toBe(true);
    expect(sanitize(cartaoVectors.visa.masked, 'cartao-credito').ok).toBe(true);
    expect(sanitize(eanVectors.ean13.masked, 'ean').ok).toBe(true);
    expect(sanitize(eanVectors.modulo10Walkthrough.invalid, 'ean').ok).toBe(false);
    expect(sanitize(pisVectors.primary.formatted, 'pis-pasep').ok).toBe(true);
  });

  it('placa fix tracks removed_separators when needed', () => {
    const fixed = applyFixes('abc-1234', 'placa');
    expect(fixed.fixes).toContain('removed_separators');
  });

  it('stripForType default branch', () => {
    expect(stripForType('x', 'unsupported' as SanitizableDocumentType)).toBe('unsupported');
  });

  it('returns validation failure per type', () => {
    expect(sanitize('bad', 'cnpj').ok).toBe(false);
    expect(sanitize('bad', 'cep').ok).toBe(false);
    expect(sanitize('bad', 'placa').ok).toBe(false);
    expect(sanitize('bad', 'telefone').ok).toBe(false);
    expect(sanitize('bad', 'cnh').ok).toBe(false);
    expect(sanitize('bad', 'renavam').ok).toBe(false);
    expect(sanitize('bad', 'titulo-eleitor').ok).toBe(false);
    expect(sanitize('bad', 'processo-judicial').ok).toBe(false);
    expect(sanitize('bad', 'nfe-chave').ok).toBe(false);
    expect(sanitize('bad', 'boleto').ok).toBe(false);
    expect(sanitize('bad', 'cartao-credito').ok).toBe(false);
    expect(sanitize('bad', 'pis-pasep').ok).toBe(false);
    expect(sanitize('bad', 'inscricao-estadual-produtor-rural').ok).toBe(false);
    expect(sanitize('bad', 'inscricao-estadual', { uf: 'SP' }).ok).toBe(false);
    expect(sanitize('bad', 'rg', { uf: 'SP' }).ok).toBe(false);
  });

  it('unsupported type hits default branch', () => {
    const badType = 'unsupported' as SanitizableDocumentType;
    expect(applyFixes('x', badType).value).toBe('unsupported');
    expect(sanitize('x', badType).ok).toBe(false);
  });
});
