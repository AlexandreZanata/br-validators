import { describe, expect, it } from 'vitest';
import { diff } from '../../src/diff/index.js';
import cpfVectors from '../vectors/cpf.official.json';
import cnpjVectors from '../vectors/cnpj.official.json';
import cepVectors from '../vectors/cep.official.json';

describe('diff()', () => {
  it('returns no changes for equal CPF values', () => {
    expect(diff(cpfVectors.primary.formatted, cpfVectors.primary.canonical, 'cpf')).toEqual({
      changed: false,
      fields: [],
    });
  });

  it('reports CPF check-digit field change', () => {
    const result = diff(cpfVectors.primary.canonical, cpfVectors.secondary.canonical, 'cpf');
    expect(result.changed).toBe(true);
    expect(result.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'base' }),
        expect.objectContaining({ field: 'dv' }),
      ]),
    );
  });

  it('reports single CNPJ dv change when only dv differs', () => {
    const a = cnpjVectors.numeric.canonical;
    const b = `${a.slice(0, 12)}00`;
    const result = diff(a, b, 'cnpj');
    expect(result.changed).toBe(true);
    expect(result.fields).toContainEqual({ field: 'dv', a: a.slice(12), b: '00' });
  });

  it('reports CEP prefix/suffix changes', () => {
    const result = diff(cepVectors.primary.canonical, cepVectors.secondary.canonical, 'cep');
    expect(result.changed).toBe(true);
    expect(result.fields.length).toBeGreaterThan(0);
  });

  it('returns value field for opaque types', () => {
    const result = diff('ABC1D23', 'ABC1D24', 'placa');
    expect(result).toEqual({
      changed: true,
      fields: [{ field: 'value', a: 'ABC1D23', b: 'ABC1D24' }],
    });
  });
});
