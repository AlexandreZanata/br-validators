import type { DatasetChanges } from './diff-dataset.js';
import { todayIsoDate } from './fetch-utils.js';

export interface DatasetMetadata {
  id: string;
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: Record<string, number>;
  alteracoes: DatasetChanges;
  verificacao: {
    agendamento: 'diario' | 'semanal' | 'manual';
    workflow: 'data-refresh-bot.yml';
    ultimaExecucao?: string;
  };
  documentacao: string;
}

export interface MetadataPartial {
  id: string;
  nome: string;
  fonte: string;
  endpoints: string[];
  contagens: Record<string, number>;
  documentacao: string;
  referencia?: string;
  agendamento?: 'diario' | 'semanal' | 'manual';
}

export function buildMetadata(partial: MetadataPartial, changes: DatasetChanges): DatasetMetadata {
  const now = new Date().toISOString();
  return {
    id: partial.id,
    nome: partial.nome,
    fonte: partial.fonte,
    endpoints: partial.endpoints,
    capturadoEm: todayIsoDate(),
    atualizadoEm: now,
    contagens: partial.contagens,
    alteracoes: changes,
    verificacao: {
      agendamento: partial.agendamento ?? 'diario',
      workflow: 'data-refresh-bot.yml',
      ultimaExecucao: now,
    },
    documentacao: partial.documentacao,
  };
}
