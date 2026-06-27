import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export type Csosn = {
  codigo: string;
  descricao: string;
};

export type CsosnDataVersion = {
  id: string;
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { csosn: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
};
