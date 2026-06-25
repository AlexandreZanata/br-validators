/**
 * Parse IBPT NCM JSON payload (De Olho no Imposto integration tables).
 * @see https://deolhonoimposto.ibpt.org.br/
 */

export interface IbptRawRecord {
  codigo: string;
  excecao: string;
  descricao: string;
  aliquotaNacionalFederal: number;
  aliquotaImportadosFederal: number;
  aliquotaEstadual: number;
  aliquotaMunicipal: number;
  vigenciaInicio: string;
  vigenciaFim: string;
}

export interface IbptNcmPayload {
  tabela: string;
  dados: IbptRawRecord[];
}

export interface IbptCargaRecord {
  ncm: string;
  uf: string;
  excecao: string;
  descricao: string;
  aliquotaNacionalFederal: number;
  aliquotaImportadosFederal: number;
  aliquotaEstadual: number;
  aliquotaMunicipal: number;
  vigenciaInicio: string;
  vigenciaFim: string;
  tabela: string;
}

function normalizeNcm(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(8, '0').slice(-8);
}

export function mapIbptRawToCarga(
  raw: IbptRawRecord,
  uf: string,
  tabela: string,
): IbptCargaRecord | undefined {
  const ncm = normalizeNcm(raw.codigo);
  if (ncm.length !== 8) {
    return undefined;
  }
  return {
    ncm,
    uf,
    excecao: raw.excecao.trim(),
    descricao: raw.descricao,
    aliquotaNacionalFederal: raw.aliquotaNacionalFederal,
    aliquotaImportadosFederal: raw.aliquotaImportadosFederal,
    aliquotaEstadual: raw.aliquotaEstadual,
    aliquotaMunicipal: raw.aliquotaMunicipal,
    vigenciaInicio: raw.vigenciaInicio,
    vigenciaFim: raw.vigenciaFim,
    tabela,
  };
}

export function extractGoldenIbptCargas(
  payload: IbptNcmPayload,
  uf: string,
  goldenNcms: readonly string[],
): IbptCargaRecord[] {
  const goldenSet = new Set(goldenNcms.map((ncm) => normalizeNcm(ncm)));
  const results: IbptCargaRecord[] = [];
  for (const raw of payload.dados) {
    const ncm = normalizeNcm(raw.codigo);
    if (!goldenSet.has(ncm)) {
      continue;
    }
    const mapped = mapIbptRawToCarga(raw, uf, payload.tabela);
    if (mapped !== undefined) {
      results.push(mapped);
    }
  }
  return results;
}
