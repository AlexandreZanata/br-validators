/**
 * Build ISS MUNIC/IBGE fallback embed — municipalities outside the 500-row partial embed.
 * @see docs/OFFICIAL-SOURCES.md#iss-munic-ibge
 */

import {
  ISS_MUNICIPAL_LC116_MAX,
  ISS_MUNICIPAL_LC116_MIN,
} from './iss-municipal-build.js';

export interface IbgeMunicipioIndexEntry {
  codigo: number;
  nome: string;
  uf: string;
}

export interface IssMunicIbgeEmbedRow {
  codigoIbge: number;
  nome: string;
  uf: string;
  aliquotaMin: number;
  aliquotaMax: number;
  municAnoPesquisa: number;
}

export const IBGE_MUNIC_PESQUISA_URL =
  'https://www.ibge.gov.br/estatisticas/economicas/contabilidade/9078-pesquisa-de-informacoes-municipais.html';

export const IBGE_MUNIC_BASE_2024_URL =
  'https://ftp.ibge.gov.br/Perfil_Municipios/2024/Base_de_Dados/Base_MUNIC_2024_20251107.xlsx';

/** Research spike (2026-06): MUNIC 2024 public base has no ISS alíquota SIDRA variable. */
export const ISS_MUNIC_IBGE_RESEARCH_NOTA =
  'MUNIC 2024 public base has no ISS alíquota variable in SIDRA; v1 uses MUNIC survey universe + LC 116 Art. 8 legal band (2%–5%).';

export function buildIssMunicIbgeEmbed(params: {
  municipios: readonly IbgeMunicipioIndexEntry[];
  embeddedIssIbgeCodes: ReadonlySet<number>;
  municAnoPesquisa: number;
}): IssMunicIbgeEmbedRow[] {
  const rows: IssMunicIbgeEmbedRow[] = [];

  for (const municipio of params.municipios) {
    if (params.embeddedIssIbgeCodes.has(municipio.codigo)) {
      continue;
    }

    rows.push({
      codigoIbge: municipio.codigo,
      nome: municipio.nome,
      uf: municipio.uf,
      aliquotaMin: ISS_MUNICIPAL_LC116_MIN,
      aliquotaMax: ISS_MUNICIPAL_LC116_MAX,
      municAnoPesquisa: params.municAnoPesquisa,
    });
  }

  rows.sort((left, right) => left.codigoIbge - right.codigoIbge);
  return rows;
}

export function collectEmbeddedIssIbgeCodes(
  issMunicipalRows: readonly { codigoIbge: number }[],
): Set<number> {
  return new Set(issMunicipalRows.map((row) => row.codigoIbge));
}
