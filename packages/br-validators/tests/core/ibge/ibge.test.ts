import { describe, expect, it } from 'vitest';

import {
  IBGE_DATA_VERSION,
  IBGE_EXPECTED_ESTADOS,
  IBGE_GOLDEN_ESTADO_SP,
  IBGE_GOLDEN_MUNICIPIO_BRASILIA,
  IBGE_GOLDEN_MUNICIPIO_SORRISO,
  IBGE_GOLDEN_MUNICIPIO_SP,
  IBGE_MIN_MUNICIPIOS,
  IBGE_OFFICIAL_DOCS_URL,
  IBGE_UF_SIGLAS,
  getEstados,
  getMunicipioPorCodigo,
  getMunicipios,
} from '../../../src/ibge/index.js';
import vectors from '../../vectors/ibge.official.json';

describe('IBGE localities — official golden vectors', () => {
  it('resolves São Paulo capital by IBGE code 3550308', () => {
    const municipio = getMunicipioPorCodigo(vectors.municipios.saoPauloCapital.codigo);
    expect(municipio).toEqual(vectors.municipios.saoPauloCapital);
    expect(municipio?.nome).toBe('São Paulo');
    expect(municipio?.uf).toBe('SP');
  });

  it('resolves Sorriso MT by IBGE code 5107925', () => {
    const municipio = getMunicipioPorCodigo(vectors.municipios.sorriso.codigo);
    expect(municipio?.nome).toBe('Sorriso');
    expect(municipio?.uf).toBe('MT');
  });

  it('resolves Brasília DF by IBGE code 5300108', () => {
    const municipio = getMunicipioPorCodigo(IBGE_GOLDEN_MUNICIPIO_BRASILIA);
    expect(municipio?.uf).toBe('DF');
    expect(municipio?.nome).toBe('Brasília');
  });

  it('resolves Boa Esperança do Norte MT (null microrregiao in IBGE API)', () => {
    const municipio = getMunicipioPorCodigo(vectors.municipios.boaEsperancaDoNorte.codigo);
    expect(municipio).toEqual(vectors.municipios.boaEsperancaDoNorte);
  });

  it('returns undefined for unknown municipality code', () => {
    expect(getMunicipioPorCodigo(vectors.unknownMunicipioCodigo)).toBeUndefined();
  });

  it('exports official IBGE documentation URL', () => {
    expect(IBGE_OFFICIAL_DOCS_URL).toBe(vectors.source);
  });
});

describe('IBGE states — national coverage', () => {
  it('returns all 27 federative units with unique siglas', () => {
    const estadosList = getEstados();
    expect(estadosList).toHaveLength(IBGE_EXPECTED_ESTADOS);
    for (const uf of IBGE_UF_SIGLAS) {
      expect(estadosList.some((item) => item.sigla === uf)).toBe(true);
    }
    expect(estadosList.length).toBe(new Set(IBGE_UF_SIGLAS).size);
  });

  it('includes São Paulo state (codigo 35)', () => {
    const sp = getEstados().find((estado) => estado.codigo === IBGE_GOLDEN_ESTADO_SP);
    expect(sp?.sigla).toBe(vectors.estado.sigla);
    expect(sp?.nome).toBe(vectors.estado.nome);
    expect(sp?.regiao.nome).toBe('Sudeste');
  });
});

describe('IBGE municipalities — UF filtering', () => {
  it('lists all municipalities when UF is omitted', () => {
    expect(getMunicipios().length).toBeGreaterThanOrEqual(IBGE_MIN_MUNICIPIOS);
  });

  it('filters municipalities by UF case-insensitively', () => {
    const upper = getMunicipios({ uf: 'MT' });
    const lower = getMunicipios({ uf: 'mt' });
    expect(lower).toEqual(upper);
    expect(upper.some((m) => m.codigo === IBGE_GOLDEN_MUNICIPIO_SORRISO)).toBe(true);
    expect(upper.every((m) => m.uf === 'MT')).toBe(true);
  });

  it('returns empty list for invalid UF code', () => {
    expect(getMunicipios({ uf: 'XX' })).toEqual([]);
  });

  it('returns SP municipalities including capital', () => {
    const sp = getMunicipios({ uf: 'SP' });
    expect(sp.some((m) => m.codigo === IBGE_GOLDEN_MUNICIPIO_SP)).toBe(true);
  });

  it('matches all canonical UF siglas constant', () => {
    expect([...IBGE_UF_SIGLAS].sort()).toEqual([...vectors.ufSiglas].sort());
  });
});

describe('IBGE data version — transparency metadata', () => {
  it('exposes capture metadata with official endpoints', () => {
    expect(IBGE_DATA_VERSION.id).toBe('ibge');
    expect(IBGE_DATA_VERSION.endpoints).toContain(vectors.estadosUrl);
    expect(IBGE_DATA_VERSION.endpoints).toContain(vectors.municipiosUrl);
    expect(IBGE_DATA_VERSION.contagens.estados).toBe(IBGE_EXPECTED_ESTADOS);
    expect(IBGE_DATA_VERSION.contagens.municipios).toBeGreaterThanOrEqual(IBGE_MIN_MUNICIPIOS);
    expect(IBGE_DATA_VERSION.verificacao.agendamento).toBe('diario');
  });

  it('tracks row counts consistent with embedded datasets', () => {
    expect(IBGE_DATA_VERSION.contagens.estados).toBe(getEstados().length);
    expect(IBGE_DATA_VERSION.contagens.municipios).toBe(getMunicipios().length);
  });
});
