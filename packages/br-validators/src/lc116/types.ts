import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface Lc116 {
  codigo: string;
  descricao: string;
}

export interface Lc116DataVersion {
  id: 'lc116';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { lc116: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
