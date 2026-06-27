import { describe, expect, it } from 'vitest';

import {
  getAllIssMunicIbge,
  getIssMunicIbgeCount,
  getIssMunicIbgePorIbge,
  lookupIssMunicipalPorIbge,
  resolveIbgeLc116Fallback,
} from '../../../src/iss-municipal/cascade-lookup.js';
import {
  buildIssMunicIbgeResult,
  buildLc116EstimativaResult,
} from '../../../src/iss-municipal/result.js';
import {
  IBGE_MUNIC_BASE_2024_URL,
  IBGE_MUNIC_PESQUISA_URL,
  ISS_MUNIC_GOLDEN_ACRELANDIA,
  ISS_MUNIC_IBGE_DATA_VERSION,
  ISS_MUNIC_IBGE_WARNING,
  ISS_MUNICIPAL_GOLDEN_SAO_PAULO,
  ISS_MUNICIPAL_LC116_MAX,
  ISS_MUNICIPAL_LC116_MIN,
} from '../../../src/iss-municipal/index.js';
import vectors from '../../vectors/iss-munic-ibge.official.json';

describe('ISS MUNIC/IBGE — official golden vectors', () => {
  it('resolves Acrelândia via cascade with munic-ibge fonte', () => {
    const result = lookupIssMunicipalPorIbge(vectors.golden.acrelandia.codigoIbge);
    expect(result).toBeDefined();
    if (result === undefined) {
      return;
    }
    expect(result.nome).toBe(vectors.golden.acrelandia.nome);
    expect(result.uf).toBe(vectors.golden.acrelandia.uf);
    expect(result.aliquotaMin).toBe(vectors.golden.acrelandia.aliquotaMin);
    expect(result.aliquotaMax).toBe(vectors.golden.acrelandia.aliquotaMax);
    expect(result.fonte).toBe(vectors.golden.acrelandia.fonte);
    expect(result.warning).toContain(ISS_MUNIC_IBGE_WARNING);
    expect(result.warning).toContain(String(vectors.golden.acrelandia.municAnoPesquisa));
  });

  it('prefers partial 500 embed over MUNIC fallback for São Paulo', () => {
    const result = lookupIssMunicipalPorIbge(vectors.golden.saoPauloPartialEmbed.codigoIbge);
    expect(result?.fonte).toBe(vectors.golden.saoPauloPartialEmbed.fonte);
    expect(result?.codigoIbge).toBe(ISS_MUNICIPAL_GOLDEN_SAO_PAULO);
  });

  it('returns undefined for unknown or invalid IBGE codes', () => {
    expect(lookupIssMunicipalPorIbge(vectors.negative.notFoundIbge)).toBeUndefined();
    expect(lookupIssMunicipalPorIbge(vectors.negative.invalidIbge)).toBeUndefined();
    expect(getIssMunicIbgePorIbge(vectors.negative.notFoundIbge)).toBeUndefined();
    expect(getIssMunicIbgePorIbge('')).toBeUndefined();
    expect(getIssMunicIbgePorIbge(0)).toBeUndefined();
  });

  it('exposes MUNIC/IBGE metadata and embed count', () => {
    expect(getIssMunicIbgeCount()).toBe(vectors.municIbgeCount);
    expect(getAllIssMunicIbge().length).toBe(vectors.municIbgeCount);
    expect(ISS_MUNIC_IBGE_DATA_VERSION.id).toBe('iss-munic-ibge');
    expect(ISS_MUNIC_IBGE_DATA_VERSION.municAnoPesquisa).toBe(vectors.golden.acrelandia.municAnoPesquisa);
    expect(ISS_MUNIC_IBGE_DATA_VERSION.municPesquisaUrl).toBe(IBGE_MUNIC_PESQUISA_URL);
    expect(ISS_MUNIC_IBGE_DATA_VERSION.municBaseUrl).toBe(IBGE_MUNIC_BASE_2024_URL);
    expect(ISS_MUNIC_IBGE_DATA_VERSION.issSidraTableId).toBeNull();
  });

  it('resolveIbgeLc116Fallback applies LC 116 band for IBGE localities', () => {
    const fallback = resolveIbgeLc116Fallback(vectors.lc116Fallback.codigoIbge);
    expect(fallback?.fonte).toBe('estimativa');
    expect(fallback?.nome).toContain(vectors.lc116Fallback.nomeContains);
    expect(fallback?.aliquotaMin).toBe(ISS_MUNICIPAL_LC116_MIN);
    expect(fallback?.aliquotaMax).toBe(ISS_MUNICIPAL_LC116_MAX);
    expect(resolveIbgeLc116Fallback(vectors.negative.notFoundIbge)).toBeUndefined();
  });
});

describe('ISS MUNIC/IBGE — result builders', () => {
  it('buildIssMunicIbgeResult attaches munic-ibge fonte and survey year warning', () => {
    const row = getAllIssMunicIbge().find((entry) => entry.codigoIbge === ISS_MUNIC_GOLDEN_ACRELANDIA);
    expect(row).toBeDefined();
    if (row === undefined) {
      return;
    }
    const result = buildIssMunicIbgeResult(row);
    expect(result.fonte).toBe('munic-ibge');
    expect(result.estimativa).toBe(true);
    expect(result.pibRank).toBeNull();
  });

  it('buildLc116EstimativaResult attaches estimativa fonte', () => {
    const result = buildLc116EstimativaResult({
      codigoIbge: vectors.lc116Fallback.codigoIbge,
      nome: 'Test',
      uf: 'RO',
      aliquotaMin: ISS_MUNICIPAL_LC116_MIN,
      aliquotaMax: ISS_MUNICIPAL_LC116_MAX,
      leiUrl: vectors.lc116Source,
      capturadoEm: '2026-06-27',
    });
    expect(result.fonte).toBe('estimativa');
    expect(result.estimativa).toBe(true);
  });
});
