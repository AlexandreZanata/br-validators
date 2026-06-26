import { describe, expect, it } from 'vitest';

import {
  ANP_COMBUSTIVEIS_DATA_VERSION,
  ANP_COMBUSTIVEL_VALUES,
  ANP_LPC_LISTING_URL,
  ANP_MAX_MUNICIPIOS,
  ANP_MAX_PRECOS_MEDIOS,
  ANP_MIN_MUNICIPIOS,
  ANP_MIN_PRECOS_MEDIOS,
  ANP_PRODUTO_COUNT,
  ANP_UF_COUNT,
  getAnpPrecosMedios,
  getAllAnpPrecosMedios,
  getAnpPrecosMediosPorIbge,
  getAnpSemanaAtual,
  getAllAnpSemanasPesquisa,
  lookupAnpPrecosMedios,
  lookupAnpPrecosMediosPorIbge,
  pickLatestAnpSemana,
} from '../../../src/anp-combustiveis/index.js';
import type { AnpCombustivel } from '../../../src/anp-combustiveis/types.js';
import vectors from '../../vectors/anp-combustiveis.official.json';

describe('ANP combustíveis — official golden vectors', () => {
  it('resolves São Paulo capital gasoline average', () => {
    const record = getAnpPrecosMedios({
      uf: vectors.golden.saoPauloGasolina.uf,
      municipio: vectors.golden.saoPauloGasolina.municipio,
      produto: vectors.golden.saoPauloGasolina.produto as AnpCombustivel,
      semanaInicio: vectors.week.inicio,
    });
    expect(record?.precoMedio).toBe(vectors.golden.saoPauloGasolina.precoMedio);
    expect(record?.municipioIbge).toBe(vectors.golden.saoPauloGasolina.municipioIbge);
  });

  it('resolves Adamantina ethanol average', () => {
    const record = getAnpPrecosMedios({
      uf: vectors.golden.adamantinaEtanol.uf,
      municipio: vectors.golden.adamantinaEtanol.municipio,
      produto: vectors.golden.adamantinaEtanol.produto as AnpCombustivel,
    });
    expect(record?.precoMedio).toBe(vectors.golden.adamantinaEtanol.precoMedio);
    expect(record?.municipioIbge).toBe(vectors.golden.adamantinaEtanol.municipioIbge);
  });

  it('resolves Campo Grande LPG average by IBGE code', () => {
    const record = getAnpPrecosMediosPorIbge(
      vectors.golden.campoGrandeGlp.municipioIbge,
      vectors.golden.campoGrandeGlp.produto as AnpCombustivel,
    );
    expect(record?.precoMedio).toBe(vectors.golden.campoGrandeGlp.precoMedio);
    expect(record?.uf).toBe(vectors.golden.campoGrandeGlp.uf);
  });
});

describe('ANP combustíveis — lookup guards', () => {
  it('normalizes municipality lookup case-insensitively', () => {
    const record = getAnpPrecosMedios({
      uf: 'sp',
      municipio: 'são paulo',
      produto: 'GASOLINE_REGULAR',
    });
    expect(record?.municipioIbge).toBe(vectors.golden.saoPauloGasolina.municipioIbge);
  });

  it('returns undefined for invalid inputs', () => {
    expect(getAnpPrecosMedios({ uf: 'SPA', municipio: 'SAO PAULO', produto: 'GASOLINE_REGULAR' })).toBeUndefined();
    expect(getAnpPrecosMedios({ uf: 'SP', municipio: '', produto: 'GASOLINE_REGULAR' })).toBeUndefined();
    expect(getAnpPrecosMedios({ uf: 'SP', municipio: 'SAO PAULO', produto: 'INVALID' as 'ETHANOL' })).toBeUndefined();
    expect(
      getAnpPrecosMedios({
        uf: 'SP',
        municipio: 'SAO PAULO',
        produto: 'GASOLINE_REGULAR',
        semanaInicio: 'not-a-date',
      }),
    ).toBeUndefined();
    expect(getAnpPrecosMediosPorIbge(0, 'ETHANOL')).toBeUndefined();
    expect(getAnpPrecosMediosPorIbge(3550308, 'INVALID' as 'ETHANOL')).toBeUndefined();
    expect(getAnpPrecosMediosPorIbge(3550308, 'ETHANOL', 'bad-date')).toBeUndefined();
  });

  it('lookupAnpPrecosMedios returns structured failure codes', () => {
    expect(lookupAnpPrecosMedios({ uf: ' ', municipio: 'X', produto: 'ETHANOL' })).toEqual({
      ok: false,
      code: 'INVALID_INPUT',
      message: 'UF and municipio are required',
    });

    const emptyMunicipio = lookupAnpPrecosMedios({
      uf: 'SP',
      municipio: '!!!',
      produto: 'ETHANOL',
    });
    expect(emptyMunicipio.ok).toBe(false);
    if (!emptyMunicipio.ok) {
      expect(emptyMunicipio.code).toBe('INVALID_FORMAT');
      expect(emptyMunicipio.message).toContain('Municipio name');
    }

    const notFound = lookupAnpPrecosMedios({
      uf: 'SP',
      municipio: 'CIDADE INEXISTENTE',
      produto: 'ETHANOL',
    });
    expect(notFound.ok).toBe(false);
    if (!notFound.ok) {
      expect(notFound.code).toBe('NOT_FOUND');
    }

    expect(lookupAnpPrecosMediosPorIbge(9999999, 'ETHANOL').ok).toBe(false);
  });

  it('returns undefined for unknown municipality/product combinations', () => {
    expect(getAnpPrecosMedios({ uf: 'SP', municipio: 'ZZZZZZ', produto: 'ETHANOL' })).toBeUndefined();
    expect(getAnpPrecosMediosPorIbge(9999999, 'ETHANOL')).toBeUndefined();
  });

  it('returns undefined when no survey weeks are available', () => {
    expect(pickLatestAnpSemana([])).toBeUndefined();
  });
});

describe('ANP combustíveis — embedded catalog', () => {
  it('lists the embedded survey week', () => {
    const semanas = getAllAnpSemanasPesquisa();
    expect(semanas).toHaveLength(1);
    expect(getAnpSemanaAtual()).toEqual(vectors.week);
    expect(semanas[0]).toEqual(vectors.week);
  });

  it('keeps municipal price rows within official sanity bounds', () => {
    const records = getAllAnpPrecosMedios();
    expect(records.length).toBeGreaterThanOrEqual(vectors.minPrecosMedios);
    expect(records.length).toBeLessThanOrEqual(vectors.maxPrecosMedios);

    const municipios = new Set(records.map((record) => `${record.uf}:${record.municipioNome}`)).size;
    expect(municipios).toBeGreaterThanOrEqual(vectors.minMunicipios);
    expect(municipios).toBeLessThanOrEqual(vectors.maxMunicipios);
    expect(new Set(records.map((record) => record.produto)).size).toBe(vectors.produtoCount);
    expect(new Set(records.map((record) => record.uf)).size).toBe(vectors.ufCount);
  });

  it('exposes official ANP endpoints in metadata', () => {
    expect(ANP_COMBUSTIVEIS_DATA_VERSION.id).toBe('anp-combustiveis');
    expect(ANP_COMBUSTIVEIS_DATA_VERSION.verificacao.agendamento).toBe('semanal');
    expect(ANP_COMBUSTIVEIS_DATA_VERSION.endpoints).toContain(ANP_LPC_LISTING_URL);
    expect(ANP_COMBUSTIVEIS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(ANP_COMBUSTIVEIS_DATA_VERSION.contagens.precosMedios).toBe(getAllAnpPrecosMedios().length);
    expect(ANP_COMBUSTIVEL_VALUES).toHaveLength(ANP_PRODUTO_COUNT);
    expect(ANP_MIN_PRECOS_MEDIOS).toBe(vectors.minPrecosMedios);
    expect(ANP_MAX_PRECOS_MEDIOS).toBe(vectors.maxPrecosMedios);
    expect(ANP_MIN_MUNICIPIOS).toBe(vectors.minMunicipios);
    expect(ANP_MAX_MUNICIPIOS).toBe(vectors.maxMunicipios);
    expect(ANP_UF_COUNT).toBe(vectors.ufCount);
  });
});
