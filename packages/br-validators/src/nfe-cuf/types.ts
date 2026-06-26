import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface NfeCuf {
  codigo: string;
  uf: string;
  nome: string;
  codigoIbge: string;
}

export interface NfeCufDataVersion {
  id: 'nfe-cuf';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { cuf: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
