import { describe, expect, it } from 'vitest';

import {
  CNAES_DATA_VERSION,
  CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS,
  CNAES_GOLDEN_WEB_DESIGN,
  CNAES_RFB_CNAES_ZIP_BASE_URL,
  CNAES_SUBCLASSES_URL,
  getCnaePorCodigo,
  getCnaes,
  searchCnaes,
} from '../../../src/cnaes/index.js';
import vectors from '../../vectors/cnaes.official.json';

describe('CNAE — official golden vectors', () => {
  it('resolves software development subclass 6201501', () => {
    const cnae = getCnaePorCodigo(vectors.golden.desenvolvimentoProgramas.codigo);
    expect(cnae?.codigo).toBe(CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS);
    expect(cnae?.descricao).toContain(vectors.golden.desenvolvimentoProgramas.descricaoContains);
  });

  it('resolves web design subclass 6201502', () => {
    const cnae = getCnaePorCodigo(vectors.golden.webDesign.codigo);
    expect(cnae?.codigo).toBe(CNAES_GOLDEN_WEB_DESIGN);
    expect(cnae?.descricao).toContain(vectors.golden.webDesign.descricaoContains);
  });

  it('normalizes CNAE lookup without leading zeros', () => {
    expect(getCnaePorCodigo('6201501')?.codigo).toBe('6201501');
  });

  it('returns undefined for unknown or invalid CNAE codes', () => {
    expect(getCnaePorCodigo('9999999')).toBeUndefined();
    expect(getCnaePorCodigo('')).toBeUndefined();
    expect(getCnaePorCodigo('abc')).toBeUndefined();
  });
});

describe('CNAE — coverage and search', () => {
  it('lists subclasses within expected IBGE range', () => {
    const list = getCnaes();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minSubclasses);
    expect(list.length).toBeLessThanOrEqual(vectors.maxSubclasses);
    expect(new Set(list.map((cnae) => cnae.codigo)).size).toBe(list.length);
  });

  it('searches CNAE by description with limit', () => {
    const results = searchCnaes('WEB DESIGN', { limit: 3 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    expect(results[0]?.codigo).toBe(CNAES_GOLDEN_WEB_DESIGN);
  });

  it('stops search at limit when many rows match', () => {
    const results = searchCnaes('DE', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchCnaes('DE');
    expect(results.length).toBe(10);
  });

  it('returns empty search results for blank query', () => {
    expect(searchCnaes('')).toEqual([]);
    expect(searchCnaes('   ')).toEqual([]);
  });

  it('exposes official IBGE endpoint in metadata', () => {
    expect(CNAES_DATA_VERSION.id).toBe('cnaes');
    expect(CNAES_DATA_VERSION.endpoints).toContain(CNAES_SUBCLASSES_URL);
    expect(CNAES_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(CNAES_DATA_VERSION.contagens.cnaes).toBe(getCnaes().length);
  });

  it('documents RFB Cnaes.zip as complementary official source (subclass parity)', () => {
    expect(CNAES_RFB_CNAES_ZIP_BASE_URL).toBe(vectors.rfbCnaesZipBaseUrl);
    const golden = getCnaePorCodigo(vectors.golden.desenvolvimentoProgramas.codigo);
    expect(golden?.codigo).toBe(CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS);
    expect(golden?.descricao.length).toBeGreaterThan(0);
  });
});
