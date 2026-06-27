import { describe, expect, it } from 'vitest';

import {
  buildIssMunicIbgeEmbed,
  collectEmbeddedIssIbgeCodes,
  IBGE_MUNIC_BASE_2024_URL,
  IBGE_MUNIC_PESQUISA_URL,
  ISS_MUNIC_IBGE_RESEARCH_NOTA,
} from './iss-munic-ibge-build.js';

describe('iss-munic-ibge build', () => {
  it('exposes official IBGE MUNIC source URLs', () => {
    expect(IBGE_MUNIC_PESQUISA_URL).toContain('9078-pesquisa-de-informacoes-municipais');
    expect(IBGE_MUNIC_BASE_2024_URL).toContain('Base_MUNIC_2024');
    expect(ISS_MUNIC_IBGE_RESEARCH_NOTA).toContain('LC 116');
  });

  it('collects embedded ISS IBGE codes from partial embed rows', () => {
    const codes = collectEmbeddedIssIbgeCodes([
      { codigoIbge: 3550308 },
      { codigoIbge: 3304557 },
    ]);
    expect(codes.has(3550308)).toBe(true);
    expect(codes.size).toBe(2);
  });

  it('builds fallback rows excluding partial embed municipalities', () => {
    const municipios = [
      { codigo: 3550308, nome: 'São Paulo', uf: 'SP' },
      { codigo: 1200013, nome: 'Acrelândia', uf: 'AC' },
      { codigo: 1200054, nome: 'Assis Brasil', uf: 'AC' },
    ];
    const embedded = collectEmbeddedIssIbgeCodes([{ codigoIbge: 3550308 }]);
    const rows = buildIssMunicIbgeEmbed({
      municipios,
      embeddedIssIbgeCodes: embedded,
      municAnoPesquisa: 2024,
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]?.codigoIbge).toBe(1200013);
    expect(rows[0]?.aliquotaMin).toBe(2);
    expect(rows[0]?.aliquotaMax).toBe(5);
    expect(rows[0]?.municAnoPesquisa).toBe(2024);
    expect(rows.some((row) => row.codigoIbge === 3550308)).toBe(false);
  });
});
