import { describe, expect, it } from 'vitest';

import {
  buildCoverageGapSummaryJson,
  computeIssMunicipalGaps,
  generateCoverageGapsMarkdown,
} from './coverage-gaps.js';

describe('coverage-gaps', () => {
  const ibge = [
    { codigo: 3550308, nome: 'São Paulo', uf: 'SP' },
    { codigo: 3509502, nome: 'Campinas', uf: 'SP' },
    { codigo: 3106200, nome: 'Belo Horizonte', uf: 'MG' },
    { codigo: 5107925, nome: 'Sorriso', uf: 'MT' },
  ] as const;

  const iss = [
    {
      codigoIbge: 3550308,
      nome: 'São Paulo',
      uf: 'SP',
      estimativa: false,
    },
    {
      codigoIbge: 3509502,
      nome: 'Campinas',
      uf: 'SP',
      estimativa: true,
    },
    {
      codigoIbge: 3106200,
      nome: 'Belo Horizonte',
      uf: 'MG',
      estimativa: false,
    },
  ] as const;

  it('computes not-embedded and estimativa-only municipalities', () => {
    const result = computeIssMunicipalGaps(ibge, iss);

    expect(result.totals).toEqual({
      ibgeMunicipioTotal: 4,
      issEmbeddedTotal: 3,
      issNotEmbeddedTotal: 1,
      issEstimativaOnlyTotal: 1,
      issOfficialMunicipalRateTotal: 2,
    });

    expect(result.notEmbedded).toEqual([{ codigoIbge: 5107925, nome: 'Sorriso', uf: 'MT' }]);
    expect(result.estimativaOnly).toEqual([{ codigoIbge: 3509502, nome: 'Campinas', uf: 'SP' }]);
    expect(result.officialMunicipalRate.map((row) => row.codigoIbge).sort()).toEqual([3106200, 3550308]);
  });

  it('aggregates per-UF counts', () => {
    const result = computeIssMunicipalGaps(ibge, iss);
    const sp = result.byUf.find((row) => row.uf === 'SP');

    expect(sp).toEqual({
      uf: 'SP',
      ibgeTotal: 2,
      embedded: 2,
      notEmbedded: 0,
      estimativaOnly: 1,
      officialMunicipalRate: 1,
    });
  });

  it('generates markdown with totals and UF table', () => {
    const result = computeIssMunicipalGaps(ibge, iss);
    const markdown = generateCoverageGapsMarkdown(result, '2026-06-26T00:00:00.000Z');

    expect(markdown).toContain('# Coverage gaps');
    expect(markdown).toContain('**1** municipalities not in embed');
    expect(markdown).toContain('iss-municipal-not-embedded.json');
    expect(markdown).toContain('| **SP** | 2 | 2 | 0 | 1 | 1 |');
    expect(markdown).toContain('INSS employee contribution');
  });

  it('builds summary JSON envelope', () => {
    const result = computeIssMunicipalGaps(ibge, iss);
    const summary = buildCoverageGapSummaryJson(result, '2026-06-26T00:00:00.000Z');

    expect(summary.generatedAt).toBe('2026-06-26T00:00:00.000Z');
    expect(summary.issMunicipal.issNotEmbeddedTotal).toBe(1);
    expect(summary.notes.inss).toContain('National');
  });
});
