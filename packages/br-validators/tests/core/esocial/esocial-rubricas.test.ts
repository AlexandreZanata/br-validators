import { describe, expect, it } from 'vitest';

import {
  ESOCIAL_DATA_VERSION,
  ESOCIAL_GOLDEN_13_SALARIO,
  ESOCIAL_GOLDEN_FERIAS,
  ESOCIAL_GOLDEN_FGTS,
  ESOCIAL_GOLDEN_SALARIO,
  ESOCIAL_TABELAS_URL,
  getAllEsocialRubricas,
  getEsocialRubricaPorCodigo,
  searchEsocialRubricas,
} from '../../../src/esocial/index.js';
import vectors from '../../vectors/esocial-rubricas.official.json';

describe('eSocial rubricas — official golden vectors', () => {
  it('resolves rubrica 1000 — salário base', () => {
    const item = getEsocialRubricaPorCodigo(vectors.golden.salario.codigo);
    expect(item?.codigo).toBe(ESOCIAL_GOLDEN_SALARIO);
    expect(item?.natureza.toLowerCase()).toContain(vectors.golden.salario.naturezaContains);
    expect(item?.descricao.toLowerCase()).toContain(vectors.golden.salario.descricaoContains);
    expect(item?.termino).toBeNull();
  });

  it('resolves rubrica 5001 — 13º salário', () => {
    const item = getEsocialRubricaPorCodigo(vectors.golden.decimoTerceiro.codigo);
    expect(item?.codigo).toBe(ESOCIAL_GOLDEN_13_SALARIO);
    expect(item?.natureza.toLowerCase()).toContain(vectors.golden.decimoTerceiro.naturezaContains);
  });

  it('resolves rubrica 1016 — férias', () => {
    const item = getEsocialRubricaPorCodigo(vectors.golden.ferias.codigo);
    expect(item?.codigo).toBe(ESOCIAL_GOLDEN_FERIAS);
    expect(item?.natureza.toLowerCase()).toContain(vectors.golden.ferias.naturezaContains);
  });

  it('resolves rubrica 9908 — FGTS depósito', () => {
    const item = getEsocialRubricaPorCodigo(vectors.golden.fgts.codigo);
    expect(item?.codigo).toBe(ESOCIAL_GOLDEN_FGTS);
    expect(item?.natureza.toLowerCase()).toContain(vectors.golden.fgts.naturezaContains);
  });

  it('normalizes rubrica lookup with leading zeros', () => {
    expect(getEsocialRubricaPorCodigo('01000')?.codigo).toBe('1000');
    expect(getEsocialRubricaPorCodigo('05001')?.codigo).toBe('5001');
  });
});

describe('eSocial rubricas — negative vectors', () => {
  it.each([
    ['unknownCode', vectors.negative.unknownCode],
    ['emptyCode', vectors.negative.emptyCode],
    ['nonNumeric', vectors.negative.nonNumeric],
    ['whitespaceCode', vectors.negative.whitespaceCode],
  ] as const)('returns undefined for %s lookup', (_label, vector) => {
    expect(getEsocialRubricaPorCodigo(vector.codigo)).toBeUndefined();
  });

  it('returns empty search results for nonexistent query', () => {
    expect(searchEsocialRubricas(vectors.negative.searchNoMatch.query)).toEqual([]);
  });

  it('returns empty search results for blank query from official vector', () => {
    expect(searchEsocialRubricas(vectors.negative.emptySearch.query)).toEqual([]);
    expect(searchEsocialRubricas('   ')).toEqual([]);
  });
});

describe('eSocial rubricas — coverage and search', () => {
  it('lists rubricas within expected federal range', () => {
    const list = getAllEsocialRubricas();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minRubricas);
    expect(list.length).toBeLessThanOrEqual(vectors.maxRubricas);
    expect(new Set(list.map((entry) => entry.codigo)).size).toBe(list.length);
  });

  it('searches eSocial rubricas by natureza with limit', () => {
    const results = searchEsocialRubricas(vectors.golden.searchSalario.query, { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((entry) => entry.codigo === vectors.golden.searchSalario.expectedCodigo)).toBe(
      true,
    );
  });

  it('stops search at limit when many rows match', () => {
    const results = searchEsocialRubricas('salário', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchEsocialRubricas('salário');
    expect(results.length).toBe(10);
  });

  it('exposes official eSocial endpoint and rubricas count in metadata', () => {
    expect(ESOCIAL_DATA_VERSION.id).toBe('esocial');
    expect(ESOCIAL_DATA_VERSION.endpoints).toContain(ESOCIAL_TABELAS_URL);
    expect(ESOCIAL_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(ESOCIAL_DATA_VERSION.contagens.rubricas).toBe(getAllEsocialRubricas().length);
    expect(ESOCIAL_DATA_VERSION.verificacao.agendamento).toBe('manual');
  });
});
