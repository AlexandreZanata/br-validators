import { describe, expect, it } from 'vitest';

import {
  ESOCIAL_DATA_VERSION,
  ESOCIAL_GOLDEN_APRENDIZ,
  ESOCIAL_GOLDEN_EMPREGADO_GERAL,
  ESOCIAL_GOLDEN_ESTAGIARIO,
  ESOCIAL_TABELAS_URL,
  getEsocialCategoriaPorCodigo,
  getAllEsocialCategorias,
  searchEsocialCategorias,
} from '../../../src/esocial/index.js';
import vectors from '../../vectors/esocial.official.json';

describe('eSocial — official golden vectors', () => {
  it('resolves category 101 — empregado geral', () => {
    const item = getEsocialCategoriaPorCodigo(vectors.golden.empregadoGeral.codigo);
    expect(item?.codigo).toBe(ESOCIAL_GOLDEN_EMPREGADO_GERAL);
    expect(item?.grupo.toLowerCase()).toContain(vectors.golden.empregadoGeral.grupoContains.toLowerCase());
    expect(item?.descricao.toLowerCase()).toContain(vectors.golden.empregadoGeral.descricaoContains);
    expect(item?.termino).toBeNull();
  });

  it('resolves category 103 — aprendiz', () => {
    const item = getEsocialCategoriaPorCodigo(vectors.golden.aprendiz.codigo);
    expect(item?.codigo).toBe(ESOCIAL_GOLDEN_APRENDIZ);
    expect(item?.descricao.toLowerCase()).toContain(vectors.golden.aprendiz.descricaoContains);
  });

  it('resolves category 901 — estagiário', () => {
    const item = getEsocialCategoriaPorCodigo(vectors.golden.estagiario.codigo);
    expect(item?.codigo).toBe(ESOCIAL_GOLDEN_ESTAGIARIO);
    expect(item?.grupo.toLowerCase()).toContain(vectors.golden.estagiario.grupoContains);
    expect(item?.descricao.toLowerCase()).toContain(vectors.golden.estagiario.descricaoContains);
  });

  it('normalizes category lookup with leading zeros', () => {
    expect(getEsocialCategoriaPorCodigo('0103')?.codigo).toBe('103');
    expect(getEsocialCategoriaPorCodigo('0101')?.codigo).toBe('101');
  });
});

describe('eSocial — negative vectors', () => {
  it.each([
    ['unknownCode', vectors.negative.unknownCode],
    ['emptyCode', vectors.negative.emptyCode],
    ['nonNumeric', vectors.negative.nonNumeric],
    ['whitespaceCode', vectors.negative.whitespaceCode],
  ] as const)('returns undefined for %s lookup', (_label, vector) => {
    expect(getEsocialCategoriaPorCodigo(vector.codigo)).toBeUndefined();
  });

  it('returns empty search results for nonexistent query', () => {
    expect(searchEsocialCategorias(vectors.negative.searchNoMatch.query)).toEqual([]);
  });

  it('returns empty search results for blank query from official vector', () => {
    expect(searchEsocialCategorias(vectors.negative.emptySearch.query)).toEqual([]);
    expect(searchEsocialCategorias('   ')).toEqual([]);
  });
});

describe('eSocial — coverage and search', () => {
  it('lists categories within expected federal range', () => {
    const list = getAllEsocialCategorias();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minCategorias);
    expect(list.length).toBeLessThanOrEqual(vectors.maxCategorias);
    expect(new Set(list.map((entry) => entry.codigo)).size).toBe(list.length);
  });

  it('searches eSocial categories by description with limit', () => {
    const results = searchEsocialCategorias(vectors.golden.searchAprendiz.query, { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((entry) => entry.codigo === vectors.golden.searchAprendiz.expectedCodigo)).toBe(
      true,
    );
  });

  it('stops search at limit when many rows match', () => {
    const results = searchEsocialCategorias('empregado', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchEsocialCategorias('empregado');
    expect(results.length).toBe(10);
  });

  it('exposes official eSocial endpoint in metadata', () => {
    expect(ESOCIAL_DATA_VERSION.id).toBe('esocial');
    expect(ESOCIAL_DATA_VERSION.endpoints).toContain(ESOCIAL_TABELAS_URL);
    expect(ESOCIAL_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(ESOCIAL_DATA_VERSION.contagens.categorias).toBe(getAllEsocialCategorias().length);
    expect(ESOCIAL_DATA_VERSION.contagens.rubricas).toBeGreaterThan(0);
    expect(ESOCIAL_DATA_VERSION.verificacao.agendamento).toBe('manual');
  });
});
