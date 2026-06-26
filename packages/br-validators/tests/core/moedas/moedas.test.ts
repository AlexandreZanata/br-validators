import { describe, expect, it } from 'vitest';

import {
  BACEN_PTAX_MOEDAS_URL,
  getMoedaPorCodigo,
  getAllMoedas,
  MOEDAS_DATA_VERSION,
  MOEDAS_GOLDEN_BRL,
  MOEDAS_GOLDEN_EUR,
  MOEDAS_GOLDEN_USD,
  searchMoedas,
} from '../../../src/moedas/index.js';
import vectors from '../../vectors/moedas.official.json';

describe('Moedas — official golden vectors', () => {
  it('resolves BRL (Real brasileiro)', () => {
    const moeda = getMoedaPorCodigo(vectors.golden.brl.codigo);
    expect(moeda?.codigo).toBe(MOEDAS_GOLDEN_BRL);
    expect(moeda?.nome).toContain(vectors.golden.brl.nomeContains);
    expect(moeda?.simbolo).toBe('R$');
  });

  it('resolves USD (Dólar dos Estados Unidos)', () => {
    const moeda = getMoedaPorCodigo(vectors.golden.usd.codigo);
    expect(moeda?.codigo).toBe(MOEDAS_GOLDEN_USD);
    expect(moeda?.nome).toContain(vectors.golden.usd.nomeContains);
    expect(moeda?.tipoBacen).toBe('A');
  });

  it('resolves EUR (Euro)', () => {
    const moeda = getMoedaPorCodigo(vectors.golden.eur.codigo);
    expect(moeda?.codigo).toBe(MOEDAS_GOLDEN_EUR);
    expect(moeda?.nome).toContain(vectors.golden.eur.nomeContains);
    expect(moeda?.tipoBacen).toBe('B');
  });

  it('normalizes currency code case-insensitively', () => {
    expect(getMoedaPorCodigo('brl')?.codigo).toBe('BRL');
  });

  it('returns undefined for unknown or invalid currency codes', () => {
    expect(getMoedaPorCodigo('ZZZ')).toBeUndefined();
    expect(getMoedaPorCodigo('')).toBeUndefined();
    expect(getMoedaPorCodigo('US')).toBeUndefined();
  });
});

describe('Moedas — search', () => {
  it('finds currencies by name fragment', () => {
    const results = searchMoedas('real', { limit: 5 });
    expect(results.some((moeda) => moeda.codigo === 'BRL')).toBe(true);
  });

  it('finds currencies by ISO code fragment', () => {
    const results = searchMoedas('usd', { limit: 3 });
    expect(results[0]?.codigo).toBe('USD');
  });

  it('respects search limit', () => {
    const results = searchMoedas('a', { limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('uses default search limit of 10 when options omitted', () => {
    const results = searchMoedas('a');
    expect(results.length).toBeLessThanOrEqual(10);
    expect(results.length).toBeGreaterThan(0);
  });

  it('matches by Portuguese name without code fragment', () => {
    const results = searchMoedas('brasileiro', { limit: 5 });
    expect(results.some((moeda) => moeda.codigo === 'BRL')).toBe(true);
  });

  it('returns empty array for blank query', () => {
    expect(searchMoedas('')).toEqual([]);
    expect(searchMoedas('   ')).toEqual([]);
  });
});

describe('Moedas — coverage', () => {
  it('lists ISO 4217 codes within expected range', () => {
    const list = getAllMoedas();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minMoedas);
    expect(list.length).toBeLessThanOrEqual(vectors.maxMoedas);
    expect(new Set(list.map((moeda) => moeda.codigo)).size).toBe(list.length);
  });

  it('exposes Bacen PTAX endpoint in metadata', () => {
    expect(MOEDAS_DATA_VERSION.id).toBe('moedas');
    expect(MOEDAS_DATA_VERSION.endpoints).toContain(BACEN_PTAX_MOEDAS_URL);
    expect(MOEDAS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(MOEDAS_DATA_VERSION.contagens.moedas).toBe(getAllMoedas().length);
  });
});
