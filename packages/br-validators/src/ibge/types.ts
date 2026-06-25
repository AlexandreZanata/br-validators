import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface IbgeRegiao {
  id: number;
  nome: string;
}

export interface Estado {
  codigo: number;
  sigla: string;
  nome: string;
  regiao: IbgeRegiao;
}

export interface Municipio {
  codigo: number;
  nome: string;
  uf: string;
}

export interface IbgeDataVersion {
  id: 'ibge';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { estados: number; municipios: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}

export type CmunFgParseFailureReason =
  | 'EMPTY_INPUT'
  | 'INVALID_CHARS'
  | 'INVALID_LENGTH'
  | 'CHECK_DIGIT_MISMATCH';

export interface CmunFgParseSuccess {
  ok: true;
  codigo: number;
  base6: string;
  checkDigit: number;
}

export interface CmunFgParseFailure {
  ok: false;
  reason: CmunFgParseFailureReason;
}

export type CmunFgParseResult = CmunFgParseSuccess | CmunFgParseFailure;
