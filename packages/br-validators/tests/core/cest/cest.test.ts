import { describe, expect, it } from 'vitest';

import {
  getNcmPorCodigo,
  NCM_GOLDEN_CAVALOS_REPRODUTORES,
} from '../../../src/ncm/index.js';
import {
  CEST_DATA_VERSION,
  CEST_GOLDEN_CERVEJA_GARRAFA_RETORNAVEL,
  CEST_GOLDEN_NCM_CERVEJA,
  CEST_HTML_URL,
  getCestPorCodigo,
  getCestPorNcm,
  getAllCest,
  searchCest,
} from '../../../src/cest/index.js';
import vectors from '../../vectors/cest.official.json';

describe('CEST — official golden vectors', () => {
  it('resolves returnable beer bottle CEST 03.021.00', () => {
    const cest = getCestPorCodigo(vectors.golden.cervejaGarrafaRetornavel.codigo);
    expect(cest?.codigo).toBe(CEST_GOLDEN_CERVEJA_GARRAFA_RETORNAVEL);
    expect(cest?.descricao.toLowerCase()).toContain(
      vectors.golden.cervejaGarrafaRetornavel.descricaoContains,
    );
  });

  it('normalizes CEST lookup with CONFAZ dotted format', () => {
    expect(getCestPorCodigo('03.021.00')?.codigo).toBe(CEST_GOLDEN_CERVEJA_GARRAFA_RETORNAVEL);
  });

  it('returns undefined for unknown or invalid CEST codes', () => {
    expect(getCestPorCodigo('9999999')).toBeUndefined();
    expect(getCestPorCodigo('')).toBeUndefined();
    expect(getCestPorCodigo('abc')).toBeUndefined();
  });
});

describe('CEST — NCM cross-reference', () => {
  it('links beer NCM 22030000 to CEST rows', () => {
    const matches = getCestPorNcm(vectors.golden.ncmCerveja.codigo);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((cest) => cest.codigo === CEST_GOLDEN_CERVEJA_GARRAFA_RETORNAVEL)).toBe(
      true,
    );
    expect(matches.every((cest) => cest.ncms.includes(CEST_GOLDEN_NCM_CERVEJA))).toBe(true);
  });

  it('returns no CEST for purebred horse NCM 01012100 (not subject to ST)', () => {
    const ncm = getNcmPorCodigo(vectors.golden.ncmCavalosReprodutores.codigo);
    expect(ncm?.codigo).toBe(NCM_GOLDEN_CAVALOS_REPRODUTORES);
    expect(getCestPorNcm(vectors.golden.ncmCavalosReprodutores.codigo)).toEqual([]);
  });

  it('normalizes dotted NCM input for CEST lookup', () => {
    const matches = getCestPorNcm('2203.00.00');
    expect(matches.some((cest) => cest.codigo === CEST_GOLDEN_CERVEJA_GARRAFA_RETORNAVEL)).toBe(true);
  });

  it('returns empty array for invalid NCM input', () => {
    expect(getCestPorNcm('')).toEqual([]);
    expect(getCestPorNcm('abc')).toEqual([]);
  });
});

describe('CEST — coverage and search', () => {
  it('lists codes within expected CONFAZ range', () => {
    const list = getAllCest();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minCodes);
    expect(list.length).toBeLessThanOrEqual(vectors.maxCodes);
    expect(new Set(list.map((cest) => cest.codigo)).size).toBe(list.length);
  });

  it('searches CEST by description with limit', () => {
    const results = searchCest('cerveja', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((cest) => cest.codigo === CEST_GOLDEN_CERVEJA_GARRAFA_RETORNAVEL)).toBe(true);
  });

  it('stops search at limit when many rows match', () => {
    const results = searchCest('outros', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchCest('outros');
    expect(results.length).toBe(10);
  });

  it('returns empty search results for blank query', () => {
    expect(searchCest('')).toEqual([]);
    expect(searchCest('   ')).toEqual([]);
  });

  it('exposes official CONFAZ endpoint in metadata', () => {
    expect(CEST_DATA_VERSION.id).toBe('cest');
    expect(CEST_DATA_VERSION.endpoints).toContain(CEST_HTML_URL);
    expect(CEST_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(CEST_DATA_VERSION.contagens.cest).toBe(getAllCest().length);
  });
});
