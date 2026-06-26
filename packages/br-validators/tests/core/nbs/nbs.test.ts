import { describe, expect, it } from 'vitest';

import {
  getAllNbs,
  getNbsPorCodigo,
  NBS_DATA_VERSION,
  NBS_GOLDEN_INTEGRACAO_SISTEMAS,
  NBS_XLSX_URL,
  searchNbs,
} from '../../../src/nbs/index.js';
import vectors from '../../vectors/nbs.official.json';

describe('NBS — official golden vectors', () => {
  it('resolves NFS-e TI systems integration code 1.1502.50.00', () => {
    const nbs = getNbsPorCodigo(vectors.golden.integracaoSistemas.codigo);
    expect(nbs?.codigo).toBe(NBS_GOLDEN_INTEGRACAO_SISTEMAS);
    expect(nbs?.descricao.toLowerCase()).toContain(vectors.golden.integracaoSistemas.descricaoContains);
  });

  it('normalizes NBS lookup from digit-only input', () => {
    expect(getNbsPorCodigo('115025000')?.codigo).toBe(NBS_GOLDEN_INTEGRACAO_SISTEMAS);
  });

  it('returns undefined for unknown or invalid NBS codes', () => {
    expect(getNbsPorCodigo('9.9999.99.99')).toBeUndefined();
    expect(getNbsPorCodigo('')).toBeUndefined();
    expect(getNbsPorCodigo('abc')).toBeUndefined();
  });
});

describe('NBS — coverage and search', () => {
  it('lists leaf codes within expected NFSe range', () => {
    const list = getAllNbs();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minCodes);
    expect(list.length).toBeLessThanOrEqual(vectors.maxCodes);
    expect(new Set(list.map((nbs) => nbs.codigo)).size).toBe(list.length);
  });

  it('searches NBS by description with limit', () => {
    const results = searchNbs('integração', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((nbs) => nbs.codigo === NBS_GOLDEN_INTEGRACAO_SISTEMAS)).toBe(true);
  });

  it('stops search at limit when many rows match', () => {
    const results = searchNbs('serviços', { limit: 1 });
    expect(results).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchNbs('serviços');
    expect(results.length).toBe(10);
  });

  it('returns empty search results for blank query', () => {
    expect(searchNbs('')).toEqual([]);
    expect(searchNbs('   ')).toEqual([]);
  });

  it('exposes official NFSe endpoint in metadata', () => {
    expect(NBS_DATA_VERSION.id).toBe('nbs');
    expect(NBS_DATA_VERSION.endpoints).toContain(NBS_XLSX_URL);
    expect(NBS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(NBS_DATA_VERSION.contagens.nbs).toBe(getAllNbs().length);
  });
});
