export interface DatasetChanges {
  adicionados: number;
  removidos: number;
  alterados: number;
  comparadoCom: string | null;
}

export interface DatasetVerification {
  agendamento: 'diario' | 'semanal';
  workflow: 'data-refresh-bot.yml';
  ultimaExecucao?: string;
}

export interface DatasetMetadata {
  id: string;
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: Record<string, number>;
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}

export interface DataCatalogVersion {
  totalDatasets: number;
}
