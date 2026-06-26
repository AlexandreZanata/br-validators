import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface IssMunicipalRow {
  codigoIbge: number;
  nome: string;
  uf: string;
  aliquotaMin: number;
  aliquotaMax: number;
  leiUrl: string;
  capturadoEm: string;
  estimativa: boolean;
  pibRank: number | null;
}

export interface IssMunicipalResult extends IssMunicipalRow {
  warning: string;
}

export interface IssMunicipalDataVersion {
  id: 'iss-municipal';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  estimativa: boolean;
  contagens: {
    municipios: number;
    capitais: number;
    estimativaRows: number;
  };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
