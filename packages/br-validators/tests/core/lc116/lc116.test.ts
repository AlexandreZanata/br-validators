import { describe, expect, it } from 'vitest';

import {
  LC116_DATA_VERSION,
  LC116_GOLDEN_ANALISE_SISTEMAS,
  LC116_GOLDEN_OBRAS_CIVIS,
  NFSE_LC116_LIST_URL,
  PLANALTO_LC116_URL,
  getLc116List,
  getLc116PorCodigo,
  searchLc116,
} from '../../../src/lc116/index.js';
import vectors from '../../vectors/lc116.official.json';

describe('LC 116 — official golden vectors', () => {
  it('resolves item 1.01 — análise e desenvolvimento de sistemas', () => {
    const item = getLc116PorCodigo(vectors.golden.analiseSistemas.codigo);
    expect(item?.codigo).toBe(LC116_GOLDEN_ANALISE_SISTEMAS);
    expect(item?.descricao.toLowerCase()).toContain(vectors.golden.analiseSistemas.descricaoContains);
  });

  it('resolves item 7.02 — execução de obras de construção civil', () => {
    const item = getLc116PorCodigo(vectors.golden.obrasCivis.codigo);
    expect(item?.codigo).toBe(LC116_GOLDEN_OBRAS_CIVIS);
    expect(item?.descricao.toLowerCase()).toContain(vectors.golden.obrasCivis.descricaoContains);
  });

  it('normalizes LC 116 lookup with leading zeros and NFSe 6-digit codes', () => {
    expect(getLc116PorCodigo('01.01')?.codigo).toBe('1.01');
    expect(getLc116PorCodigo('010101')?.codigo).toBe('1.01');
    expect(getLc116PorCodigo('7.2')?.codigo).toBe('7.02');
  });

  it('returns undefined for unknown or invalid LC 116 codes', () => {
    expect(getLc116PorCodigo('99.99')).toBeUndefined();
    expect(getLc116PorCodigo('')).toBeUndefined();
    expect(getLc116PorCodigo('abc')).toBeUndefined();
  });
});

describe('LC 116 — coverage and search', () => {
  it('lists items within expected federal range', () => {
    const list = getLc116List();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minItems);
    expect(list.length).toBeLessThanOrEqual(vectors.maxItems);
    expect(new Set(list.map((entry) => entry.codigo)).size).toBe(list.length);
  });

  it('searches LC 116 by description with limit', () => {
    const results = searchLc116(vectors.golden.searchProgramas.query, { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((entry) => entry.codigo === vectors.golden.searchProgramas.expectedCodigo)).toBe(
      true,
    );
  });

  it('stops search at limit when many rows match', () => {
    const results = searchLc116('serviços', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchLc116('serviços');
    expect(results.length).toBe(10);
  });

  it('returns empty search results for blank query', () => {
    expect(searchLc116('')).toEqual([]);
    expect(searchLc116('   ')).toEqual([]);
  });

  it('exposes official Planalto endpoint in metadata', () => {
    expect(LC116_DATA_VERSION.id).toBe('lc116');
    expect(LC116_DATA_VERSION.endpoints).toContain(PLANALTO_LC116_URL);
    expect(LC116_DATA_VERSION.endpoints).toContain(vectors.nfseListUrl);
    expect(LC116_DATA_VERSION.endpoints).toContain(NFSE_LC116_LIST_URL);
    expect(LC116_DATA_VERSION.contagens.lc116).toBe(getLc116List().length);
    expect(LC116_DATA_VERSION.verificacao.agendamento).toBe('manual');
  });
});
