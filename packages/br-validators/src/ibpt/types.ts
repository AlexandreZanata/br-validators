import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface IbptCargaTributaria {
  ncm: string;
  uf: string;
  excecao: string;
  descricao: string;
  aliquotaNacionalFederal: number;
  aliquotaImportadosFederal: number;
  aliquotaEstadual: number;
  aliquotaMunicipal: number;
  vigenciaInicio: string;
  vigenciaFim: string;
  tabela: string;
}

export type IbptCargaLookup = IbptCargaTributaria;

export interface IbptDataVersion {
  id: 'ibpt';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { cargas: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
