import { describe, expect, it } from 'vitest';

import {
  AEROPORTOS_DATA_VERSION,
  AEROPORTOS_GOLDEN_IATA_BSB,
  AEROPORTOS_GOLDEN_IATA_CGB,
  AEROPORTOS_GOLDEN_IATA_GIG,
  AEROPORTOS_GOLDEN_IATA_GRU,
  AEROPORTOS_GOLDEN_IATA_SSA,
  AEROPORTOS_GOLDEN_ICAO_BSB,
  AEROPORTOS_GOLDEN_ICAO_CGB,
  AEROPORTOS_GOLDEN_ICAO_GIG,
  AEROPORTOS_GOLDEN_ICAO_GRU,
  AEROPORTOS_GOLDEN_ICAO_SSA,
  ANAC_AERODROMOS_PUBLICOS_CSV_URL,
  getAeroportoPorIata,
  getAeroportoPorIcao,
  getAllAeroportos,
  getAeroportosPorMunicipio,
} from '../../../src/aeroportos/index.js';
import vectors from '../../vectors/aeroportos.official.json';

describe('Aeroportos — official golden vectors', () => {
  it('resolves Guarulhos by IATA GRU', () => {
    const aeroporto = getAeroportoPorIata(vectors.golden.gru.iata);
    expect(aeroporto?.iata).toBe(AEROPORTOS_GOLDEN_IATA_GRU);
    expect(aeroporto?.icao).toBe(AEROPORTOS_GOLDEN_ICAO_GRU);
    expect(aeroporto?.uf).toBe(vectors.golden.gru.uf);
    expect(aeroporto?.nome).toContain(vectors.golden.gru.nomeContains);
  });

  it('resolves Galeão by IATA GIG', () => {
    const aeroporto = getAeroportoPorIata(vectors.golden.gig.iata);
    expect(aeroporto?.iata).toBe(AEROPORTOS_GOLDEN_IATA_GIG);
    expect(aeroporto?.icao).toBe(AEROPORTOS_GOLDEN_ICAO_GIG);
    expect(aeroporto?.uf).toBe(vectors.golden.gig.uf);
    expect(aeroporto?.nome).toContain(vectors.golden.gig.nomeContains);
  });

  it('resolves Brasília by IATA BSB', () => {
    const aeroporto = getAeroportoPorIata(vectors.golden.bsb.iata);
    expect(aeroporto?.iata).toBe(AEROPORTOS_GOLDEN_IATA_BSB);
    expect(aeroporto?.icao).toBe(AEROPORTOS_GOLDEN_ICAO_BSB);
    expect(aeroporto?.uf).toBe(vectors.golden.bsb.uf);
    expect(aeroporto?.nome).toContain(vectors.golden.bsb.nomeContains);
  });

  it('resolves Salvador by IATA SSA', () => {
    const aeroporto = getAeroportoPorIata(vectors.golden.ssa.iata);
    expect(aeroporto?.iata).toBe(AEROPORTOS_GOLDEN_IATA_SSA);
    expect(aeroporto?.icao).toBe(AEROPORTOS_GOLDEN_ICAO_SSA);
    expect(aeroporto?.uf).toBe(vectors.golden.ssa.uf);
    expect(aeroporto?.nome).toContain(vectors.golden.ssa.nomeContains);
  });

  it('resolves Cuiabá by IATA CGB', () => {
    const aeroporto = getAeroportoPorIata(vectors.golden.cgb.iata);
    expect(aeroporto?.iata).toBe(AEROPORTOS_GOLDEN_IATA_CGB);
    expect(aeroporto?.icao).toBe(AEROPORTOS_GOLDEN_ICAO_CGB);
    expect(aeroporto?.uf).toBe(vectors.golden.cgb.uf);
    expect(aeroporto?.nome).toContain(vectors.golden.cgb.nomeContains);
  });

  it('resolves airports by ICAO code', () => {
    expect(getAeroportoPorIcao(vectors.golden.gru.icao)?.iata).toBe('GRU');
    expect(getAeroportoPorIcao(vectors.golden.cgb.icao)?.iata).toBe('CGB');
  });

  it('normalizes IATA lookup case-insensitively', () => {
    expect(getAeroportoPorIata('gru')?.icao).toBe('SBGR');
  });

  it('returns undefined for unknown IATA or ICAO', () => {
    expect(getAeroportoPorIata('ZZZ')).toBeUndefined();
    expect(getAeroportoPorIcao('ZZZZ')).toBeUndefined();
    expect(getAeroportoPorIata('')).toBeUndefined();
    expect(getAeroportoPorIcao('')).toBeUndefined();
    expect(getAeroportoPorIata('GR')).toBeUndefined();
    expect(getAeroportoPorIcao('SBG')).toBeUndefined();
  });
});

describe('Aeroportos — municipality lookup', () => {
  it('lists aerodromos by IBGE municipality code', () => {
    const gru = getAeroportoPorIata('GRU');
    expect(gru?.municipioIbge).toEqual(expect.any(Number));
    if (gru?.municipioIbge !== null && gru?.municipioIbge !== undefined) {
      const byMunicipio = getAeroportosPorMunicipio(gru.municipioIbge);
      expect(byMunicipio.some((aeroporto) => aeroporto.iata === 'GRU')).toBe(true);
    }
  });

  it('returns empty array for invalid IBGE municipality code', () => {
    expect(getAeroportosPorMunicipio(0)).toEqual([]);
    expect(getAeroportosPorMunicipio(-1)).toEqual([]);
    expect(getAeroportosPorMunicipio(1.5)).toEqual([]);
  });
});

describe('Aeroportos — national coverage', () => {
  it('lists aerodromos within expected ANAC range', () => {
    const list = getAllAeroportos();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minAerodromos);
    expect(list.length).toBeLessThanOrEqual(vectors.maxAerodromos);
    expect(new Set(list.map((aeroporto) => aeroporto.icao)).size).toBe(list.length);
    expect(list.filter((aeroporto) => aeroporto.iata !== null).length).toBeGreaterThanOrEqual(
      vectors.minWithIata,
    );
  });

  it('exposes official ANAC endpoint in metadata', () => {
    expect(AEROPORTOS_DATA_VERSION.id).toBe('aeroportos');
    expect(AEROPORTOS_DATA_VERSION.endpoints).toContain(ANAC_AERODROMOS_PUBLICOS_CSV_URL);
    expect(AEROPORTOS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(AEROPORTOS_DATA_VERSION.contagens.aeroportos).toBe(getAllAeroportos().length);
  });
});
