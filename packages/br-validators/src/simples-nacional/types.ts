import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export type SimplesAnexoId = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface SimplesFaixa {
  faixa: number;
  receitaBrutaMin: number;
  receitaBrutaMax: number;
  aliquotaNominal: number;
  parcelaDeduzir: number;
}

export interface SimplesAnexo {
  id: SimplesAnexoId;
  nome: string;
  descricao: string;
  cppForaSimples: boolean;
  faixas: readonly SimplesFaixa[];
}

export interface SimplesFaixaLookup extends SimplesFaixa {
  anexo: SimplesAnexoId;
}

export interface SimplesDataVersion {
  id: 'simples-nacional';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { anexos: number; faixas: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
