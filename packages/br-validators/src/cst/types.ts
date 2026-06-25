import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Cst {
  codigo: string;
  descricao: string;
}

export interface CstDataVersion {
  id: 'cst';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: {
    icms: number;
    ipi: number;
    pis: number;
    cofins: number;
  };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
