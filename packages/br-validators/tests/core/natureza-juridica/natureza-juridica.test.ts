import { describe, expect, it } from 'vitest';

import {
  getNaturezaJuridicaPorCodigo,
  getAllNaturezaJuridica,
  NATUREZA_JURIDICA_BASE_URL,
  NATUREZA_JURIDICA_DATA_VERSION,
  NATUREZA_JURIDICA_GOLDEN_LTDA,
} from '../../../src/natureza-juridica/index.js';
import vectors from '../../vectors/natureza-juridica.official.json';

describe('Natureza juridica — official golden vectors', () => {
  it('resolves code 2062 as Sociedade Empresária Limitada', () => {
    const natureza = getNaturezaJuridicaPorCodigo(vectors.golden.sociedadeLimitada.codigo);
    expect(natureza?.codigo).toBe(NATUREZA_JURIDICA_GOLDEN_LTDA);
    expect(natureza?.descricao).toContain(vectors.golden.sociedadeLimitada.descricaoContains);
  });

  it('normalizes lookup with padded numeric input', () => {
    expect(getNaturezaJuridicaPorCodigo('2062')?.codigo).toBe('2062');
    expect(getNaturezaJuridicaPorCodigo('02062')?.codigo).toBe('2062');
  });

  it('returns undefined for unknown or invalid codes', () => {
    expect(getNaturezaJuridicaPorCodigo('9999')).toBeUndefined();
    expect(getNaturezaJuridicaPorCodigo('')).toBeUndefined();
    expect(getNaturezaJuridicaPorCodigo('abc')).toBeUndefined();
  });
});

describe('Natureza juridica — coverage and metadata', () => {
  it('lists codes within expected RFB range', () => {
    const list = getAllNaturezaJuridica();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minCodes);
    expect(list.length).toBeLessThanOrEqual(vectors.maxCodes);
    expect(new Set(list.map((natureza) => natureza.codigo)).size).toBe(list.length);
  });

  it('exposes official RFB endpoint in metadata', () => {
    expect(NATUREZA_JURIDICA_DATA_VERSION.id).toBe('natureza-juridica');
    expect(
      NATUREZA_JURIDICA_DATA_VERSION.endpoints.some((endpoint) =>
        endpoint.includes(NATUREZA_JURIDICA_BASE_URL),
      ) ||
        NATUREZA_JURIDICA_DATA_VERSION.endpoints.some((endpoint) => endpoint.includes('Naturezas.zip')),
    ).toBe(true);
    expect(NATUREZA_JURIDICA_DATA_VERSION.contagens.naturezas).toBe(getAllNaturezaJuridica().length);
  });
});
