import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface InssFaixaContribuicao {
  faixa: number;
  salarioMin: number;
  salarioMax: number;
  aliquota: number;
  descricao: string;
}

export interface InssTabelaContribuicao {
  ano: number;
  teto: number;
  faixas: readonly InssFaixaContribuicao[];
}

export interface InssFaixaLookup extends InssFaixaContribuicao {
  ano: number;
  teto: number;
}

export interface InssCalculoMensal {
  ano: number;
  salarioContribuicao: number;
  salarioEfetivo: number;
  faixa: number;
  aliquota: number;
  contribuicao: number;
  teto: number;
}

export interface InssDataVersion {
  id: 'inss';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { anos: number; faixas: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
