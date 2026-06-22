import { describe, expect, it } from 'vitest';
import { batch } from '../../src/batch/index.js';
import cpfVectors from '../vectors/cpf.official.json';

describe('batch()', () => {
  it('partitions valid and invalid CPF rows', () => {
    const result = batch(
      [cpfVectors.primary.formatted, 'invalid', cpfVectors.secondary.formatted],
      'cpf',
    );
    expect(result.summary).toEqual({ total: 3, valid: 2, invalid: 1 });
    expect(result.valid).toHaveLength(2);
    expect(result.invalid[0]).toMatchObject({ index: 1, code: expect.any(String) });
  });

  it('never throws on invalid rows', () => {
    expect(() => batch(['', 'bad', 'worse'], 'cep')).not.toThrow();
    expect(batch(['', 'bad'], 'cep').summary.invalid).toBe(2);
  });

  it('handles 1K inputs within reasonable time', () => {
    const inputs = Array.from({ length: 1000 }, () => cpfVectors.primary.canonical);
    const start = performance.now();
    const result = batch(inputs, 'cpf');
    const elapsed = performance.now() - start;
    expect(result.summary.valid).toBe(1000);
    expect(elapsed).toBeLessThan(2000);
  });

  it('requires uf for inscricao-estadual rows', () => {
    const result = batch(['110042490114'], 'inscricao-estadual');
    expect(result.summary.invalid).toBe(1);
  });
});
