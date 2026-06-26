import { describe, expect, it } from 'vitest';

import {
  getNcmPorCodigo,
  getAllNcm,
  NCM_DATA_VERSION,
  NCM_GOLDEN_CAVALOS_REPRODUTORES,
  NCM_GOLDEN_SOJA_SEMENTES,
  NCM_JSON_URL,
  searchNcm,
} from '../../../src/ncm/index.js';
import vectors from '../../vectors/ncm.official.json';

describe('NCM — official golden vectors', () => {
  it('resolves purebred horse breeders NCM 01012100', () => {
    const ncm = getNcmPorCodigo(vectors.golden.cavalosReprodutores.codigo);
    expect(ncm?.codigo).toBe(NCM_GOLDEN_CAVALOS_REPRODUTORES);
    expect(ncm?.descricao).toContain(vectors.golden.cavalosReprodutores.descricaoContains);
  });

  it('resolves soybean seeds NCM 12011000', () => {
    const ncm = getNcmPorCodigo(vectors.golden.sojaSementes.codigo);
    expect(ncm?.codigo).toBe(NCM_GOLDEN_SOJA_SEMENTES);
    expect(ncm?.descricao.toLowerCase()).toContain(vectors.golden.sojaSementes.descricaoContains);
  });

  it('normalizes NCM lookup with dotted input', () => {
    expect(getNcmPorCodigo('0101.21.00')?.codigo).toBe('01012100');
  });

  it('returns undefined for unknown or invalid NCM codes', () => {
    expect(getNcmPorCodigo('99999999')).toBeUndefined();
    expect(getNcmPorCodigo('')).toBeUndefined();
    expect(getNcmPorCodigo('abc')).toBeUndefined();
  });
});

describe('NCM — coverage and search', () => {
  it('lists leaf codes within expected Siscomex range', () => {
    const list = getAllNcm();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minLeafCodes);
    expect(list.length).toBeLessThanOrEqual(vectors.maxLeafCodes);
    expect(new Set(list.map((ncm) => ncm.codigo)).size).toBe(list.length);
  });

  it('searches NCM by description with limit', () => {
    const results = searchNcm('reprodutor', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((ncm) => ncm.codigo === NCM_GOLDEN_CAVALOS_REPRODUTORES)).toBe(true);
  });

  it('stops search at limit when many rows match', () => {
    const results = searchNcm('de', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchNcm('de');
    expect(results.length).toBe(10);
  });

  it('returns empty search results for blank query', () => {
    expect(searchNcm('')).toEqual([]);
    expect(searchNcm('   ')).toEqual([]);
  });

  it('exposes official Siscomex endpoint in metadata', () => {
    expect(NCM_DATA_VERSION.id).toBe('ncm');
    expect(NCM_DATA_VERSION.endpoints).toContain(NCM_JSON_URL);
    expect(NCM_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(NCM_DATA_VERSION.contagens.ncm).toBe(getAllNcm().length);
  });
});
