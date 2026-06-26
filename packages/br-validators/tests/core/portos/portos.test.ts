import { describe, expect, it } from 'vitest';

import {
  ANTAQ_PORTOS_ZIP_URL,
  getPortoPorCodigo,
  getAllPortos,
  getPortosPorMunicipio,
  PORTOS_DATA_VERSION,
  PORTOS_GOLDEN_SANTOS,
  searchPortos,
} from '../../../src/portos/index.js';
import vectors from '../../vectors/portos.official.json';

describe('Portos — official golden vectors', () => {
  it('resolves BRSSZ as Santos organized port', () => {
    const porto = getPortoPorCodigo(vectors.golden.santos.codigo);
    expect(porto?.codigo).toBe(PORTOS_GOLDEN_SANTOS);
    expect(porto?.uf).toBe(vectors.golden.santos.uf);
    expect(porto?.nome.toUpperCase()).toContain(vectors.golden.santos.nomeContains);
    expect(porto?.municipioIbge).toBe(vectors.golden.santos.municipioIbge);
  });

  it('resolves BRADR and BRPNG golden ports', () => {
    const angra = getPortoPorCodigo(vectors.golden.angra.codigo);
    expect(angra?.uf).toBe(vectors.golden.angra.uf);
    expect(angra?.municipioIbge).toBe(vectors.golden.angra.municipioIbge);

    const paranagua = getPortoPorCodigo(vectors.golden.paranagua.codigo);
    expect(paranagua?.uf).toBe(vectors.golden.paranagua.uf);
    expect(paranagua?.nome.toUpperCase()).toContain(vectors.golden.paranagua.nomeContains);
  });

  it('returns undefined for invalid codes', () => {
    expect(getPortoPorCodigo('')).toBeUndefined();
    expect(getPortoPorCodigo('INVALID')).toBeUndefined();
    expect(getPortoPorCodigo('brssz')).toBeDefined();
  });
});

describe('Portos — search and municipality lookup', () => {
  it('finds ports by municipality IBGE code', () => {
    const byMunicipio = getPortosPorMunicipio(vectors.golden.santos.municipioIbge);
    expect(byMunicipio.some((porto) => porto.codigo === vectors.golden.santos.codigo)).toBe(true);
  });

  it('searches by name fragment', () => {
    const results = searchPortos('Santos', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((porto) => porto.codigo === vectors.golden.santos.codigo)).toBe(true);
  });

  it('searches by code and municipality fragments with limit', () => {
    const byCode = searchPortos('BRSSZ', { limit: 1 });
    expect(byCode[0]?.codigo).toBe(vectors.golden.santos.codigo);

    const byMunicipio = searchPortos('paranagu', { limit: 2 });
    expect(byMunicipio.some((porto) => porto.codigo === vectors.golden.paranagua.codigo)).toBe(true);

    expect(searchPortos('e', { limit: 1 })).toHaveLength(1);
    expect(searchPortos('paranagu', {}).length).toBeGreaterThan(0);
  });

  it('returns empty arrays for invalid municipality or empty query', () => {
    expect(getPortosPorMunicipio(0)).toEqual([]);
    expect(getPortosPorMunicipio(1.5)).toEqual([]);
    expect(searchPortos('')).toEqual([]);
  });
});

describe('Portos — coverage and metadata', () => {
  it('lists unique port codes within expected ANTAQ range', () => {
    const list = getAllPortos();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minPortos);
    expect(list.length).toBeLessThanOrEqual(vectors.maxPortos);
    expect(new Set(list.map((porto) => porto.codigo)).size).toBe(list.length);
  });

  it('exposes official ANTAQ endpoint in metadata', () => {
    expect(PORTOS_DATA_VERSION.id).toBe('portos');
    expect(PORTOS_DATA_VERSION.endpoints.some((endpoint) => endpoint.includes(ANTAQ_PORTOS_ZIP_URL))).toBe(
      true,
    );
    expect(PORTOS_DATA_VERSION.contagens.portos).toBe(getAllPortos().length);
  });
});
