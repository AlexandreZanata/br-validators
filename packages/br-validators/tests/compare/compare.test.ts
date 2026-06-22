import { describe, expect, it } from 'vitest';
import { compare, compareRuntime } from '../../src/compare/index.js';
import cpfVectors from '../vectors/cpf.official.json';
import cnpjVectors from '../vectors/cnpj.official.json';
import cepVectors from '../vectors/cep.official.json';
import ieSpVectors from '../vectors/ie.sp.official.json';

describe('compare()', () => {
  it('matches masked and canonical CPF', () => {
    expect(compare(cpfVectors.primary.formatted, cpfVectors.primary.canonical, 'cpf')).toEqual({
      equal: true,
    });
  });

  it('detects CPF mismatch', () => {
    expect(compare(cpfVectors.primary.canonical, cpfVectors.secondary.canonical, 'cpf')).toEqual({
      equal: false,
    });
  });

  it('matches CNPJ alphanumeric case-insensitive', () => {
    expect(
      compare(cnpjVectors.alphanumeric.formatted.toLowerCase(), cnpjVectors.alphanumeric.canonical, 'cnpj'),
    ).toEqual({ equal: true });
  });

  it('matches CEP with mask', () => {
    expect(compare(cepVectors.primary.formatted, cepVectors.primary.canonical, 'cep')).toEqual({
      equal: true,
    });
  });

  it('treats empty inputs as equal', () => {
    expect(compare('', '', 'cpf')).toEqual({ equal: true });
    expect(compare('', cpfVectors.primary.canonical, 'cpf')).toEqual({ equal: false });
  });

  it('matches IE with uf option', () => {
    expect(
      compare(ieSpVectors.golden.masked, ieSpVectors.golden.stripped, 'inscricao-estadual', { uf: 'SP' }),
    ).toEqual({ equal: true });
  });

  it('compareRuntime rejects unknown type', () => {
    expect(compareRuntime('1', '2', 'phone')).toMatchObject({
      equal: false,
      code: 'UNSUPPORTED_FORMAT',
    });
  });
});
