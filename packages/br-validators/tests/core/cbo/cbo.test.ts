import { describe, expect, it } from 'vitest';

import {
  CBO_DATA_VERSION,
  CBO_GOLDEN_ANALISTA_SISTEMAS,
  CBO_GOLDEN_OFICIAL_AERONAUTICA,
  CBO_OCUPACAO_CSV_URL,
  getCboPorCodigo,
  getAllCbo,
  searchCbo,
} from '../../../src/cbo/index.js';
import vectors from '../../vectors/cbo.official.json';

describe('CBO — official golden vectors', () => {
  it('resolves systems analyst occupation 212405', () => {
    const cbo = getCboPorCodigo(vectors.golden.analistaSistemas.codigo);
    expect(cbo?.codigo).toBe(CBO_GOLDEN_ANALISTA_SISTEMAS);
    expect(cbo?.descricao.toLowerCase()).toContain(vectors.golden.analistaSistemas.descricaoContains);
  });

  it('resolves air force general officer 010105', () => {
    const cbo = getCboPorCodigo(vectors.golden.oficialAeronautica.codigo);
    expect(cbo?.codigo).toBe(CBO_GOLDEN_OFICIAL_AERONAUTICA);
    expect(cbo?.descricao.toLowerCase()).toContain(vectors.golden.oficialAeronautica.descricaoContains);
  });

  it('normalizes CBO lookup without leading zeros', () => {
    expect(getCboPorCodigo('10105')?.codigo).toBe('010105');
  });

  it('returns undefined for unknown or invalid CBO codes', () => {
    expect(getCboPorCodigo('999999')).toBeUndefined();
    expect(getCboPorCodigo('')).toBeUndefined();
    expect(getCboPorCodigo('abc')).toBeUndefined();
  });
});

describe('CBO — coverage and search', () => {
  it('lists occupations within expected MTE range', () => {
    const list = getAllCbo();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minOcupacoes);
    expect(list.length).toBeLessThanOrEqual(vectors.maxOcupacoes);
    expect(new Set(list.map((cbo) => cbo.codigo)).size).toBe(list.length);
  });

  it('searches CBO by description with limit', () => {
    const results = searchCbo('desenvolvimento de sistemas', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((cbo) => cbo.codigo === CBO_GOLDEN_ANALISTA_SISTEMAS)).toBe(true);
  });

  it('stops search at limit when many rows match', () => {
    const results = searchCbo('de', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchCbo('de');
    expect(results.length).toBe(10);
  });

  it('returns empty search results for blank query', () => {
    expect(searchCbo('')).toEqual([]);
    expect(searchCbo('   ')).toEqual([]);
  });

  it('exposes official MTE endpoint in metadata', () => {
    expect(CBO_DATA_VERSION.id).toBe('cbo');
    expect(CBO_DATA_VERSION.endpoints).toContain(CBO_OCUPACAO_CSV_URL);
    expect(CBO_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(CBO_DATA_VERSION.contagens.cbo).toBe(getAllCbo().length);
  });
});
