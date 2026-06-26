import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface SelicMetaObservacao {
  data: string;
  valor: number;
}

export interface SelicMetaResult extends SelicMetaObservacao {
  dataReferencia: string;
  isStale: boolean;
  warning?: string;
}

export interface SelicHistoricoRange {
  from?: string;
  to?: string;
}

export interface SelicLookupOptions {
  /** ISO date used to evaluate staleness (default: Brazil local today). */
  asOfDate?: string;
}

export interface SelicDataVersion {
  id: 'selic';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { observacoes: number; dias: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
