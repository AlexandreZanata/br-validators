import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface PtaxCotacao {
  moeda: string;
  data: string;
  paridadeCompra: number;
  paridadeVenda: number;
  cotacaoCompra: number;
  cotacaoVenda: number;
  dataHoraCotacao: string;
  tipoBoletim: 'Fechamento PTAX';
}

export interface PtaxCotacaoResult extends PtaxCotacao {
  dataReferencia: string;
  isStale: boolean;
  warning?: string;
}

export interface PtaxLookupOptions {
  /** ISO date used to evaluate staleness (default: Brazil local today). */
  asOfDate?: string;
}

export interface PtaxDataVersion {
  id: 'ptax';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: {
    cotacoes: number;
    moedas: number;
    diasUteis: number;
  };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
