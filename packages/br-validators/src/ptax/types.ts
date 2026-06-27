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

export interface PtaxHistoricoOptions extends PtaxLookupOptions {
  /** Inclusive start date — ISO `YYYY-MM-DD` or Bacen `MM-DD-YYYY`. */
  desde: string;
  /** Inclusive end date — ISO `YYYY-MM-DD` or Bacen `MM-DD-YYYY`. */
  ate: string;
}

export interface PtaxDataVersion {
  id: 'ptax';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  janelaDiasUteis: number;
  contagens: {
    cotacoes: number;
    moedas: number;
    diasUteis: number;
  };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
