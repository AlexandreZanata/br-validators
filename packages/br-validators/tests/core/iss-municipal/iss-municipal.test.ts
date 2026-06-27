import { describe, expect, it } from 'vitest';

import { buildIssMunicipalResult } from '../../../src/iss-municipal/result.js';
import {
  getAllIssMunicipal,
  getIssMunicipalPorIbge,
  getIssMunicipalPorUf,
  getIssMunicipalPorUfMunicipio,
  getIssMunicipalUfsDisponiveis,
  searchIssMunicipal,
} from '../../../src/iss-municipal/lookup.js';
import {
  ISS_MUNICIPAL_CAPITAL_COUNT,
  ISS_MUNICIPAL_ESTIMATION_WARNING,
  ISS_MUNICIPAL_GOLDEN_RIO,
  ISS_MUNICIPAL_GOLDEN_SAO_PAULO,
  ISS_MUNICIPAL_LC116_MAX,
  ISS_MUNICIPAL_LC116_MIN,
  ISS_MUNICIPAL_TARGET_COUNT,
  ISS_MUNICIPAL_DATA_VERSION,
} from '../../../src/iss-municipal/index.js';
import vectors from '../../vectors/iss-municipal.official.json';

describe('ISS municipal — official golden vectors', () => {
  it('resolves São Paulo with municipal legislation URL and warning', () => {
    const result = getIssMunicipalPorIbge(vectors.golden.saoPaulo.codigoIbge);
    expect(result).toBeDefined();
    if (result === undefined) {
      return;
    }
    expect(result.nome).toBe('São Paulo');
    expect(result.uf).toBe('SP');
    expect(result.aliquotaMin).toBe(vectors.golden.saoPaulo.aliquotaMin);
    expect(result.aliquotaMax).toBe(vectors.golden.saoPaulo.aliquotaMax);
    expect(result.leiUrl).toContain(vectors.golden.saoPaulo.leiUrlContains);
    expect(result.estimativa).toBe(false);
    expect(result.warning).toBe(ISS_MUNICIPAL_ESTIMATION_WARNING);
  });

  it('resolves Rio de Janeiro and Belo Horizonte golden rows', () => {
    const rio = getIssMunicipalPorIbge(vectors.golden.rioDeJaneiro.codigoIbge);
    expect(rio?.uf).toBe('RJ');
    expect(rio?.leiUrl).toContain(vectors.golden.rioDeJaneiro.leiUrlContains);

    const bh = getIssMunicipalPorIbge(vectors.golden.beloHorizonte.codigoIbge);
    expect(bh?.uf).toBe('MG');
    expect(bh?.leiUrl).toContain(vectors.golden.beloHorizonte.leiUrlContains);
  });

  it('resolves Campinas as high-PIB estimation row', () => {
    const campinas = getIssMunicipalPorIbge(vectors.golden.campinas.codigoIbge);
    expect(campinas?.nome).toBe('Campinas');
    expect(campinas?.uf).toBe('SP');
    expect(campinas?.aliquotaMin).toBe(vectors.golden.campinas.aliquotaMin);
    expect(campinas?.aliquotaMax).toBe(vectors.golden.campinas.aliquotaMax);
    expect(campinas?.estimativa).toBe(vectors.golden.campinas.estimativa);
    expect(campinas?.leiUrl).toContain(vectors.golden.campinas.leiUrlContains);
  });

  it('looks up by UF and municipality name with accent-insensitive match', () => {
    const result = getIssMunicipalPorUfMunicipio('sp', 'sao paulo');
    expect(result?.codigoIbge).toBe(ISS_MUNICIPAL_GOLDEN_SAO_PAULO);
  });

  it('returns undefined for unknown IBGE code or invalid input', () => {
    expect(getIssMunicipalPorIbge(vectors.negative.notFoundIbge)).toBeUndefined();
    expect(getIssMunicipalPorIbge(vectors.negative.invalidIbge)).toBeUndefined();
    expect(getIssMunicipalPorIbge('')).toBeUndefined();
    expect(getIssMunicipalPorIbge(0)).toBeUndefined();
    expect(getIssMunicipalPorIbge(-1)).toBeUndefined();
  });

  it('returns undefined for unknown UF/nome pair or invalid UF', () => {
    expect(
      getIssMunicipalPorUfMunicipio(
        vectors.negative.unknownUfNome.uf,
        vectors.negative.unknownUfNome.nome,
      ),
    ).toBeUndefined();
    expect(getIssMunicipalPorUfMunicipio('', 'São Paulo')).toBeUndefined();
    expect(getIssMunicipalPorUfMunicipio('SP', '')).toBeUndefined();
  });

  it('searches by municipality name fragment and IBGE code', () => {
    const byName = searchIssMunicipal('campinas', { limit: 3 });
    expect(byName.length).toBeGreaterThan(0);
    expect(byName[0]?.warning).toBe(ISS_MUNICIPAL_ESTIMATION_WARNING);

    const byIbge = searchIssMunicipal(String(ISS_MUNICIPAL_GOLDEN_RIO));
    expect(byIbge.some((row) => row.codigoIbge === ISS_MUNICIPAL_GOLDEN_RIO)).toBe(true);

    const byUf = searchIssMunicipal('sp', { limit: 1 });
    expect(byUf).toHaveLength(1);

    expect(searchIssMunicipal(vectors.negative.searchNoMatch)).toEqual([]);
    expect(searchIssMunicipal('')).toEqual([]);
  });

  it('filters search results by UF using golden vector', () => {
    const match = searchIssMunicipal(vectors.ufFilter.query, {
      uf: vectors.ufFilter.uf,
      limit: 5,
    });
    expect(match.some((row) => row.codigoIbge === vectors.ufFilter.expectCodigoIbge)).toBe(true);
    expect(match.every((row) => row.uf === vectors.ufFilter.uf)).toBe(true);

    expect(
      searchIssMunicipal(vectors.searchWithUfNoMatch.query, {
        uf: vectors.searchWithUfNoMatch.uf,
      }),
    ).toEqual([]);
    expect(searchIssMunicipal('campinas', { uf: vectors.ufListFilter.invalid })).toEqual([]);
    expect(searchIssMunicipal('campinas', { uf: '' })).toEqual([]);
  });

  it('lists embedded municipalities per UF and exposes available UFs', () => {
    const spRows = getIssMunicipalPorUf(vectors.ufListFilter.sp);
    expect(spRows.length).toBeGreaterThan(0);
    expect(spRows.every((row) => row.uf === 'SP')).toBe(true);
    expect(spRows.some((row) => row.codigoIbge === ISS_MUNICIPAL_GOLDEN_SAO_PAULO)).toBe(true);

    const ufs = getIssMunicipalUfsDisponiveis();
    expect(ufs).toContain('SP');
    expect(ufs).toEqual([...ufs].sort((left, right) => left.localeCompare(right, 'pt-BR')));
    expect(getIssMunicipalPorUf('')).toEqual([]);
    expect(getIssMunicipalPorUf(vectors.ufListFilter.invalid)).toEqual([]);
    expect(getIssMunicipalPorUf('ZZ')).toEqual([]);

    const totalByUf = ufs.reduce((sum, uf) => sum + getIssMunicipalPorUf(uf).length, 0);
    expect(totalByUf).toBe(ISS_MUNICIPAL_TARGET_COUNT);
  });
});

describe('ISS municipal — embed policy', () => {
  it('embeds exactly 500 municipalities including all 27 capitals', () => {
    const rows = getAllIssMunicipal();
    expect(rows.length).toBe(ISS_MUNICIPAL_TARGET_COUNT);
    expect(rows.length).toBe(vectors.targetCount);

    const capitalRows = rows.filter((row) => !row.estimativa);
    expect(capitalRows.length).toBe(ISS_MUNICIPAL_CAPITAL_COUNT);
    expect(capitalRows.length).toBe(vectors.capitalCount);
  });

  it('keeps alíquota bands within LC 116 Art. 8 limits', () => {
    for (const row of getAllIssMunicipal()) {
      expect(row.aliquotaMin).toBeGreaterThanOrEqual(ISS_MUNICIPAL_LC116_MIN);
      expect(row.aliquotaMax).toBeLessThanOrEqual(ISS_MUNICIPAL_LC116_MAX);
      expect(row.aliquotaMin).toBeLessThanOrEqual(row.aliquotaMax);
      expect(row.leiUrl.startsWith('https://')).toBe(true);
      expect(row.capturadoEm.length).toBeGreaterThan(0);
    }
  });

  it('exposes dataset metadata with manual refresh and estimativa flag', () => {
    expect(ISS_MUNICIPAL_DATA_VERSION.id).toBe('iss-municipal');
    expect(ISS_MUNICIPAL_DATA_VERSION.verificacao.agendamento).toBe('manual');
    expect(ISS_MUNICIPAL_DATA_VERSION.estimativa).toBe(true);
    expect(ISS_MUNICIPAL_DATA_VERSION.contagens.municipios).toBe(ISS_MUNICIPAL_TARGET_COUNT);
  });

  it('buildIssMunicipalResult always attaches warning', () => {
    const row = getAllIssMunicipal()[0];
    expect(buildIssMunicipalResult(row).warning).toBe(ISS_MUNICIPAL_ESTIMATION_WARNING);
  });
});
