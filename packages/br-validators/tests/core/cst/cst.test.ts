import { describe, expect, it } from 'vitest';

import {
  CST_DATA_VERSION,
  CST_GOLDEN_COFINS_ISENTA,
  CST_GOLDEN_COFINS_TRIBUTAVEL,
  CST_GOLDEN_ICMS_ST,
  CST_GOLDEN_ICMS_TRIBUTADA,
  CST_GOLDEN_IPI_ENTRADA,
  CST_GOLDEN_IPI_SAIDA,
  CST_GOLDEN_PIS_ISENTA,
  CST_GOLDEN_PIS_TRIBUTAVEL,
  SPED_CST_CONSULTA_URL,
  getCstCofins,
  getCstCofinsPorCodigo,
  getCstIcms,
  getCstIcmsPorCodigo,
  getCstIpi,
  getCstIpiPorCodigo,
  getCstPis,
  getCstPisPorCodigo,
  searchCstCofins,
  searchCstIcms,
  searchCstIpi,
  searchCstPis,
} from '../../../src/cst/index.js';
import vectors from '../../vectors/cst.official.json';

describe('CST — official golden vectors', () => {
  it('resolves ICMS CST 00 — tributada integralmente', () => {
    const cst = getCstIcmsPorCodigo(vectors.golden.icmsTributada.codigo);
    expect(cst?.codigo).toBe(CST_GOLDEN_ICMS_TRIBUTADA);
    expect(cst?.descricao.toLowerCase()).toContain(vectors.golden.icmsTributada.descricaoContains);
  });

  it('resolves ICMS CST 10 — substituição tributária', () => {
    const cst = getCstIcmsPorCodigo(vectors.golden.icmsSt.codigo);
    expect(cst?.codigo).toBe(CST_GOLDEN_ICMS_ST);
    expect(cst?.descricao.toLowerCase()).toContain(vectors.golden.icmsSt.descricaoContains);
  });

  it('resolves IPI CST 50 — saída tributada', () => {
    const cst = getCstIpiPorCodigo(vectors.golden.ipiSaida.codigo);
    expect(cst?.codigo).toBe(CST_GOLDEN_IPI_SAIDA);
    expect(cst?.descricao.toLowerCase()).toContain(vectors.golden.ipiSaida.descricaoContains);
  });

  it('resolves IPI CST 00 — entrada com recuperação de crédito', () => {
    const cst = getCstIpiPorCodigo(vectors.golden.ipiEntrada.codigo);
    expect(cst?.codigo).toBe(CST_GOLDEN_IPI_ENTRADA);
    expect(cst?.descricao.toLowerCase()).toContain(vectors.golden.ipiEntrada.descricaoContains);
  });

  it('resolves PIS CST 01 — operação tributável', () => {
    const cst = getCstPisPorCodigo(vectors.golden.pisTributavel.codigo);
    expect(cst?.codigo).toBe(CST_GOLDEN_PIS_TRIBUTAVEL);
    expect(cst?.descricao.toLowerCase()).toContain(vectors.golden.pisTributavel.descricaoContains);
  });

  it('resolves PIS CST 07 — operação isenta', () => {
    const cst = getCstPisPorCodigo(vectors.golden.pisIsenta.codigo);
    expect(cst?.codigo).toBe(CST_GOLDEN_PIS_ISENTA);
    expect(cst?.descricao.toLowerCase()).toContain(vectors.golden.pisIsenta.descricaoContains);
  });

  it('resolves COFINS CST 01 — operação tributável', () => {
    const cst = getCstCofinsPorCodigo(vectors.golden.cofinsTributavel.codigo);
    expect(cst?.codigo).toBe(CST_GOLDEN_COFINS_TRIBUTAVEL);
    expect(cst?.descricao.toLowerCase()).toContain(
      vectors.golden.cofinsTributavel.descricaoContains,
    );
  });

  it('resolves COFINS CST 07 — operação isenta', () => {
    const cst = getCstCofinsPorCodigo(vectors.golden.cofinsIsenta.codigo);
    expect(cst?.codigo).toBe(CST_GOLDEN_COFINS_ISENTA);
    expect(cst?.descricao.toLowerCase()).toContain(vectors.golden.cofinsIsenta.descricaoContains);
  });

  it('normalizes CST lookup with leading zeros', () => {
    expect(getCstIcmsPorCodigo('0')?.codigo).toBe('00');
    expect(getCstIpiPorCodigo('5')?.codigo).toBe('05');
  });

  it('returns undefined for unknown or invalid CST codes', () => {
    expect(getCstIcmsPorCodigo('99')).toBeUndefined();
    expect(getCstIpiPorCodigo('')).toBeUndefined();
    expect(getCstPisPorCodigo('abc')).toBeUndefined();
    expect(getCstCofinsPorCodigo('888')).toBeUndefined();
  });
});

describe('CST — coverage and search', () => {
  it('lists codes within expected SPED ranges', () => {
    const icms = getCstIcms();
    const ipi = getCstIpi();
    const pis = getCstPis();
    const cofins = getCstCofins();

    expect(icms.length).toBeGreaterThanOrEqual(vectors.minCounts.icms);
    expect(icms.length).toBeLessThanOrEqual(vectors.maxCounts.icms);
    expect(ipi.length).toBeGreaterThanOrEqual(vectors.minCounts.ipi);
    expect(ipi.length).toBeLessThanOrEqual(vectors.maxCounts.ipi);
    expect(pis.length).toBeGreaterThanOrEqual(vectors.minCounts.pis);
    expect(pis.length).toBeLessThanOrEqual(vectors.maxCounts.pis);
    expect(cofins.length).toBeGreaterThanOrEqual(vectors.minCounts.cofins);
    expect(cofins.length).toBeLessThanOrEqual(vectors.maxCounts.cofins);

    expect(new Set(icms.map((entry) => entry.codigo)).size).toBe(icms.length);
    expect(new Set(ipi.map((entry) => entry.codigo)).size).toBe(ipi.length);
    expect(new Set(pis.map((entry) => entry.codigo)).size).toBe(pis.length);
    expect(new Set(cofins.map((entry) => entry.codigo)).size).toBe(cofins.length);
  });

  it('searches ICMS CST by description with limit', () => {
    const results = searchCstIcms('substituição', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some((entry) => entry.codigo === CST_GOLDEN_ICMS_ST)).toBe(true);
  });

  it('searches IPI, PIS, and COFINS by description', () => {
    expect(searchCstIpi('saída tributada').some((entry) => entry.codigo === CST_GOLDEN_IPI_SAIDA)).toBe(
      true,
    );
    expect(searchCstPis('alíquota básica').some((entry) => entry.codigo === CST_GOLDEN_PIS_TRIBUTAVEL)).toBe(
      true,
    );
    expect(
      searchCstCofins('alíquota básica').some((entry) => entry.codigo === CST_GOLDEN_COFINS_TRIBUTAVEL),
    ).toBe(true);
  });

  it('stops search at limit when many rows match', () => {
    expect(searchCstPis('operação', { limit: 1 })).toHaveLength(1);
  });

  it('uses default search limit of 10 when options omitted', () => {
    expect(searchCstCofins('operação')).toHaveLength(10);
  });

  it('returns empty search results for blank query', () => {
    expect(searchCstIcms('')).toEqual([]);
    expect(searchCstIpi('   ')).toEqual([]);
  });

  it('exposes official SPED endpoint in metadata', () => {
    expect(CST_DATA_VERSION.id).toBe('cst');
    expect(CST_DATA_VERSION.endpoints).toContain(SPED_CST_CONSULTA_URL);
    expect(CST_DATA_VERSION.endpoints).toContain(vectors.pisDocUrl);
    expect(CST_DATA_VERSION.endpoints).toContain(vectors.cofinsDocUrl);
    expect(CST_DATA_VERSION.contagens.icms).toBe(getCstIcms().length);
    expect(CST_DATA_VERSION.contagens.ipi).toBe(getCstIpi().length);
    expect(CST_DATA_VERSION.contagens.pis).toBe(getCstPis().length);
    expect(CST_DATA_VERSION.contagens.cofins).toBe(getCstCofins().length);
    expect(CST_DATA_VERSION.verificacao.agendamento).toBe('manual');
  });
});
