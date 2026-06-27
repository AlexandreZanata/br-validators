import {
  ISS_MUNIC_IBGE_WARNING,
  ISS_MUNICIPAL_ESTIMATION_WARNING,
  PLANALTO_LC116_ART8_URL,
} from './constants.js';
import { ISS_MUNIC_IBGE_DATA_VERSION } from './munic-ibge-version.js';
import type { IssMunicIbgeRow } from './munic-ibge-types.js';
import type { IssMunicipalFonte, IssMunicipalResult, IssMunicipalRow } from './types.js';

export function resolveIssMunicipalFonte(estimativa: boolean): IssMunicipalFonte {
  return estimativa ? 'estimativa' : 'oficial';
}

export function buildIssMunicipalResult(row: IssMunicipalRow): IssMunicipalResult {
  return {
    ...row,
    fonte: resolveIssMunicipalFonte(row.estimativa),
    warning: ISS_MUNICIPAL_ESTIMATION_WARNING,
  };
}

export function buildIssMunicIbgeResult(row: IssMunicIbgeRow): IssMunicipalResult {
  return {
    codigoIbge: row.codigoIbge,
    nome: row.nome,
    uf: row.uf,
    aliquotaMin: row.aliquotaMin,
    aliquotaMax: row.aliquotaMax,
    leiUrl: PLANALTO_LC116_ART8_URL,
    capturadoEm: ISS_MUNIC_IBGE_DATA_VERSION.capturadoEm,
    estimativa: true,
    pibRank: null,
    fonte: 'munic-ibge',
    warning: `${ISS_MUNIC_IBGE_WARNING} MUNIC survey year: ${String(row.municAnoPesquisa)}.`,
  };
}

type Lc116EstimativaInput = Omit<IssMunicipalRow, 'estimativa' | 'pibRank'>;

export function buildLc116EstimativaResult(row: Lc116EstimativaInput): IssMunicipalResult {
  return {
    ...row,
    estimativa: true,
    pibRank: null,
    fonte: 'estimativa',
    warning: ISS_MUNICIPAL_ESTIMATION_WARNING,
  };
}
