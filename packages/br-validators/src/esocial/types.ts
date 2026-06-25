import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface EsocialCategoriaTrabalhador {
  codigo: string;
  grupo: string;
  descricao: string;
  inicio: string;
  termino: string | null;
}

export interface EsocialDataVersion {
  id: 'esocial';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { categorias: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
