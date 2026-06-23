import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

/** `fixo` — Lei 662/1949 + amendments; `movel` — Paixão de Cristo (MGI federal calendar). */
export type FeriadoTipo = 'fixo' | 'movel';

export interface FeriadoNacional {
  data: string;
  nome: string;
  tipo: FeriadoTipo;
  baseLegal?: string;
}

export interface PontoFacultativoFederal {
  data: string;
  nome: string;
  baseLegal: string;
  /** Partial-day facultative window per Portaria MGI (e.g. Quarta de Cinzas until 14:00). */
  horarioParcial?: 'until 14:00' | 'after 13:00';
}

export interface FeriadosDataVersion {
  id: 'feriados';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: {
    feriadosNacionaisFixos: number;
    feriadosNacionaisMoveis: number;
    pontosFacultativosFederais: number;
  };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}

export interface ParsedUtcDate {
  year: number;
  month: number;
  day: number;
}
