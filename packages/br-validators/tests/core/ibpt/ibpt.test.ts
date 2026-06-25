import { describe, expect, it } from 'vitest';

import {
  computeIbptCargaTotal,
  getIbptCargaPorNcmUf,
  getIbptCargas,
  getIbptTabelaAtual,
  IBPT_DATA_VERSION,
  IBPT_GOLDEN_NCM_CAVALOS,
  IBPT_GOLDEN_UF_RJ,
  IBPT_GOLDEN_UF_SP,
  IBPT_LEI_12741_URL,
  IBPT_OFFICIAL_PORTAL_URL,
} from '../../../src/ibpt/index.js';
import { getNcmPorCodigo } from '../../../src/ncm/index.js';
import vectors from '../../vectors/ibpt.official.json';

describe('IBPT — official golden vectors', () => {
  it('resolves SP carga for NCM 01012100 (purebred horses)', () => {
    const carga = getIbptCargaPorNcmUf({
      ncm: vectors.golden.cavalosSp.ncm,
      uf: vectors.golden.cavalosSp.uf,
    });
    expect(carga?.ncm).toBe(IBPT_GOLDEN_NCM_CAVALOS);
    expect(carga?.uf).toBe(IBPT_GOLDEN_UF_SP);
    expect(carga?.aliquotaNacionalFederal).toBe(vectors.golden.cavalosSp.aliquotaNacionalFederal);
    expect(carga?.aliquotaEstadual).toBe(vectors.golden.cavalosSp.aliquotaEstadual);
    expect(computeIbptCargaTotal(carga!, { importado: false })).toBe(
      vectors.golden.cavalosSp.cargaTotalNacional,
    );
    expect(computeIbptCargaTotal(carga!, { importado: true })).toBe(
      vectors.golden.cavalosSp.cargaTotalImportado,
    );
  });

  it('resolves RJ carga with distinct estadual rate for same NCM', () => {
    const carga = getIbptCargaPorNcmUf({
      ncm: vectors.golden.cavalosRj.ncm,
      uf: vectors.golden.cavalosRj.uf,
    });
    expect(carga?.uf).toBe(IBPT_GOLDEN_UF_RJ);
    expect(carga?.aliquotaEstadual).toBe(vectors.golden.cavalosRj.aliquotaEstadual);
    expect(computeIbptCargaTotal(carga!, { importado: false })).toBe(
      vectors.golden.cavalosRj.cargaTotalNacional,
    );
  });

  it('resolves SP malt beer NCM 22030000', () => {
    const carga = getIbptCargaPorNcmUf({
      ncm: vectors.golden.cervejaSp.ncm,
      uf: vectors.golden.cervejaSp.uf,
    });
    expect(computeIbptCargaTotal(carga!, { importado: false })).toBe(
      vectors.golden.cervejaSp.cargaTotalNacional,
    );
    expect(computeIbptCargaTotal(carga!, { importado: true })).toBe(
      vectors.golden.cervejaSp.cargaTotalImportado,
    );
  });

  it('pairs IBPT NCM with existing getNcmPorCodigo description', () => {
    const carga = getIbptCargaPorNcmUf({ ncm: IBPT_GOLDEN_NCM_CAVALOS, uf: 'SP' });
    const ncm = getNcmPorCodigo(IBPT_GOLDEN_NCM_CAVALOS);
    expect(carga).toBeDefined();
    expect(ncm?.codigo).toBe(IBPT_GOLDEN_NCM_CAVALOS);
    expect(ncm?.descricao.toLowerCase()).toContain('reprodutor');
  });

  it('returns undefined for unknown NCM×UF or invalid input', () => {
    expect(getIbptCargaPorNcmUf({ ncm: '99999999', uf: 'SP' })).toBeUndefined();
    expect(getIbptCargaPorNcmUf({ ncm: IBPT_GOLDEN_NCM_CAVALOS, uf: 'XX' })).toBeUndefined();
    expect(getIbptCargaPorNcmUf({ ncm: '', uf: 'SP' })).toBeUndefined();
  });
});

describe('IBPT — coverage and metadata', () => {
  it('lists golden subset within expected embed range', () => {
    const list = getIbptCargas();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minCargas);
    expect(list.length).toBeLessThanOrEqual(vectors.maxCargas);
    expect(new Set(list.map((carga) => `${carga.uf}:${carga.ncm}`)).size).toBeGreaterThan(0);
  });

  it('exposes official IBPT portal and tabela in metadata', () => {
    expect(IBPT_DATA_VERSION.id).toBe('ibpt');
    expect(IBPT_DATA_VERSION.endpoints.some((e) => e.includes(IBPT_OFFICIAL_PORTAL_URL))).toBe(true);
    expect(IBPT_LEI_12741_URL).toBe(vectors.lei12741Url);
    expect(getIbptTabelaAtual()).toBe(vectors.tabela);
    expect(IBPT_DATA_VERSION.contagens.cargas).toBe(getIbptCargas().length);
  });
});
