import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface MotivoSituacaoCadastral {
  codigo: string;
  descricao: string;
}

export interface CnpjMotivosDataVersion {
  id: 'cnpj-motivos';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { motivos: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
