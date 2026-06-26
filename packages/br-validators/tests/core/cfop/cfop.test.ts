import { describe, expect, it } from 'vitest';

import {
  CFOP_DATA_VERSION,
  CFOP_GOLDEN_COMPRA_COMERCIALIZACAO,
  CFOP_GOLDEN_VENDA_TERCEIROS,
  CFOP_HTML_URL,
  getCfopPorCodigo,
  getAllCfop,
  searchCfop,
} from '../../../src/cfop/index.js';
import vectors from '../../vectors/cfop.official.json';

describe('CFOP — official golden vectors', () => {
  it('resolves purchase for resale CFOP 1102', () => {
    const cfop = getCfopPorCodigo(vectors.golden.compraComercializacao.codigo);
    expect(cfop?.codigo).toBe(CFOP_GOLDEN_COMPRA_COMERCIALIZACAO);
    expect(cfop?.descricao.toLowerCase()).toContain(
      vectors.golden.compraComercializacao.descricaoContains,
    );
  });

  it('resolves third-party sale CFOP 5102', () => {
    const cfop = getCfopPorCodigo(vectors.golden.vendaTerceiros.codigo);
    expect(cfop?.codigo).toBe(CFOP_GOLDEN_VENDA_TERCEIROS);
    expect(cfop?.descricao.toLowerCase()).toContain(vectors.golden.vendaTerceiros.descricaoContains);
  });

  it('normalizes CFOP lookup with CONFAZ dotted format', () => {
    expect(getCfopPorCodigo('1.102')?.codigo).toBe('1102');
  });

  it('returns undefined for unknown or invalid CFOP codes', () => {
    expect(getCfopPorCodigo('9999')).toBeUndefined();
    expect(getCfopPorCodigo('')).toBeUndefined();
    expect(getCfopPorCodigo('abc')).toBeUndefined();
  });
});

describe('CFOP — coverage and search', () => {
  it('lists codes within expected CONFAZ range', () => {
    const list = getAllCfop();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minCodes);
    expect(list.length).toBeLessThanOrEqual(vectors.maxCodes);
    expect(new Set(list.map((cfop) => cfop.codigo)).size).toBe(list.length);
  });

  it('searches CFOP by description with limit', () => {
    const results = searchCfop('comercialização', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((cfop) => cfop.codigo === CFOP_GOLDEN_COMPRA_COMERCIALIZACAO)).toBe(true);
  });

  it('stops search at limit when many rows match', () => {
    const results = searchCfop('compra', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchCfop('compra');
    expect(results.length).toBe(10);
  });

  it('returns empty search results for blank query', () => {
    expect(searchCfop('')).toEqual([]);
    expect(searchCfop('   ')).toEqual([]);
  });

  it('exposes official CONFAZ endpoint in metadata', () => {
    expect(CFOP_DATA_VERSION.id).toBe('cfop');
    expect(CFOP_DATA_VERSION.endpoints).toContain(CFOP_HTML_URL);
    expect(CFOP_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(CFOP_DATA_VERSION.contagens.cfop).toBe(getAllCfop().length);
  });
});
