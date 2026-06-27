import { describe, expect, it } from 'vitest';

import {
  CSOSN_DATA_VERSION,
  CSOSN_GOLDEN_ICMS_ANTERIOR,
  CSOSN_GOLDEN_SEM_CREDITO,
  CSOSN_GOLDEN_TRIBUTADA_COM_CREDITO,
  getAllCsosn,
  getCsosnPorCodigo,
  isValidCsosn,
  lookupCsosnPorCodigo,
  searchCsosn,
  validateCsosn,
} from '../../../src/csosn/index.js';
import vectors from '../../vectors/csosn.official.json';

describe('CSOSN — official golden vectors', () => {
  it('resolves CSOSN 101 tributada com crédito', () => {
    const row = getCsosnPorCodigo(vectors.golden.tributadaComCredito.codigo);
    expect(row?.codigo).toBe(CSOSN_GOLDEN_TRIBUTADA_COM_CREDITO);
    expect(row?.descricao.toLowerCase()).toContain(vectors.golden.tributadaComCredito.descricaoContains);
  });

  it('resolves CSOSN 102 sem crédito', () => {
    const row = getCsosnPorCodigo(vectors.golden.semCredito.codigo);
    expect(row?.codigo).toBe(CSOSN_GOLDEN_SEM_CREDITO);
    expect(row?.descricao.toLowerCase()).toContain(vectors.golden.semCredito.descricaoContains);
  });

  it('resolves CSOSN 500 ICMS anterior', () => {
    const row = getCsosnPorCodigo(vectors.golden.icmsAnterior.codigo);
    expect(row?.codigo).toBe(CSOSN_GOLDEN_ICMS_ANTERIOR);
    expect(row?.descricao.toLowerCase()).toContain(vectors.golden.icmsAnterior.descricaoContains);
  });

  it('returns undefined for unknown or invalid codes', () => {
    expect(getCsosnPorCodigo(vectors.invalid.notInTable)).toBeUndefined();
    expect(validateCsosn(vectors.invalid.format).ok).toBe(false);
  });
});

describe('CSOSN — coverage and search', () => {
  it('lists all embedded CSOSN rows', () => {
    const list = getAllCsosn();
    expect(list.length).toBe(vectors.codeCount);
    expect(new Set(list.map((row) => row.codigo)).size).toBe(list.length);
  });

  it('searches CSOSN by description with limit', () => {
    const results = searchCsosn('simples nacional', { limit: 3 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('exports dataset version metadata', () => {
    expect(CSOSN_DATA_VERSION.contagens.csosn).toBe(vectors.codeCount);
    expect(CSOSN_DATA_VERSION.endpoints[0]).toBe(vectors.url);
  });

  it('validateCsosn returns description for valid code', () => {
    const result = validateCsosn('102');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('102');
      expect(result.description.toLowerCase()).toContain('sem permissão');
    }
  });

  it('isValidCsosn returns boolean without throwing', () => {
    expect(isValidCsosn('102')).toBe(true);
    expect(isValidCsosn('000')).toBe(false);
  });

  it('searchCsosn returns empty array for blank query', () => {
    expect(searchCsosn('   ')).toEqual([]);
  });

  it('searchCsosn uses default limit when options omitted', () => {
    const results = searchCsosn('simples');
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('lookupCsosnPorCodigo rejects empty normalized code', () => {
    expect(lookupCsosnPorCodigo('...').ok).toBe(false);
  });
});
