/** Compact MUNIC/IBGE fallback row — municipalities outside the 500-row partial embed. */
export interface IssMunicIbgeRow {
  codigoIbge: number;
  nome: string;
  uf: string;
  aliquotaMin: number;
  aliquotaMax: number;
  municAnoPesquisa: number;
}

export interface IssMunicIbgeDataVersion {
  id: 'iss-munic-ibge';
  municAnoPesquisa: number;
  municBaseUrl: string;
  municPesquisaUrl: string;
  issSidraTableId: number | null;
  nota: string;
  capturadoEm: string;
  contagens: {
    municipios: number;
  };
  documentacao: string;
}
