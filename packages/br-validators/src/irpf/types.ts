import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface IrpfFaixaProgressiva {
  faixa: number;
  baseCalculoMin: number;
  baseCalculoMax: number | null;
  aliquota: number;
  parcelaDeduzir: number;
  descricao: string;
}

export interface IrpfTabelaProgressiva {
  ano: number;
  faixas: readonly IrpfFaixaProgressiva[];
}

export interface IrpfFaixaLookup extends IrpfFaixaProgressiva {
  ano: number;
}

export interface IrpfCalculoMensal {
  ano: number;
  baseCalculo: number;
  faixa: number;
  aliquota: number;
  parcelaDeduzir: number;
  imposto: number;
}

export interface IrpfDataVersion {
  id: 'irpf';
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
