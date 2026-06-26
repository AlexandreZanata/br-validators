import {
  CEST_DATA_VERSION,
  getCestPorCodigo,
} from '@br-validators/core/cest';
import {
  INCOTERMS_DATA_VERSION,
  getIncotermPorCodigo,
} from '@br-validators/core/incoterms';
import {
  MOEDAS_DATA_VERSION,
  getMoedaPorCodigo,
} from '@br-validators/core/moedas';
import {
  NATUREZA_JURIDICA_DATA_VERSION,
  getNaturezaJuridicaPorCodigo,
} from '@br-validators/core/natureza-juridica';
import { NBS_DATA_VERSION, getNbsPorCodigo } from '@br-validators/core/nbs';
import {
  PAISES_BACEN_DATA_VERSION,
  getPaisPorCodigoBacen,
} from '@br-validators/core/paises-bacen';
import {
  AEROPORTOS_DATA_VERSION,
  getAeroportoPorIata,
  getAeroportoPorIcao,
} from '@br-validators/core/aeroportos';
import { PORTOS_DATA_VERSION, getPortoPorCodigo } from '@br-validators/core/portos';
import {
  CNAES_DATA_VERSION,
  CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS,
  getCnaePorCodigo,
} from '@br-validators/core/cnaes';
import {
  CFOP_DATA_VERSION,
  CFOP_GOLDEN_COMPRA_COMERCIALIZACAO,
  validateCfop,
  getCfopPorCodigo,
} from '@br-validators/core/cfop';
import {
  NCM_DATA_VERSION,
  NCM_GOLDEN_SOJA_SEMENTES,
  validateNcm,
  getNcmPorCodigo,
} from '@br-validators/core/ncm';
import {
  NFE_CUF_DATA_VERSION,
  NFE_CUF_GOLDEN_SP,
  getCufPorCodigo,
  getCufPorUf,
} from '@br-validators/core/nfe-cuf';
import {
  CST_DATA_VERSION,
  CST_GOLDEN_ICMS_TRIBUTADA,
  SPED_CST_CONSULTA_URL,
  validateCst,
  type CstTax,
} from '@br-validators/core/cst';
import {
  getIssMunicipalPorIbge,
  ISS_MUNICIPAL_DATA_VERSION,
  ISS_MUNICIPAL_GOLDEN_SAO_PAULO,
} from '@br-validators/core/iss-municipal';
import type { FiscalCodeValidationResult } from '@br-validators/core/lookup';
import {
  CBO_DATA_VERSION,
  CBO_GOLDEN_ANALISTA_SISTEMAS,
  getCboPorCodigo,
} from '@br-validators/core/cbo';

export type GovBrGroupId = 'fiscal' | 'trade' | 'logistics';

export type GovBrModuleId =
  | 'naturezaJuridica'
  | 'nbs'
  | 'cest'
  | 'cnae'
  | 'cfop'
  | 'ncm'
  | 'nfeCuf'
  | 'cbo'
  | 'cst'
  | 'issMunicipal'
  | 'moedas'
  | 'paisesBacen'
  | 'incoterms'
  | 'portos'
  | 'aeroportos';

export type GovBrLookupRow = Record<string, string | number | null>;

export type GovBrValidateContext = {
  cstTax?: CstTax;
};

export interface GovBrModuleDefinition {
  id: GovBrModuleId;
  defaultCode: string;
  capturadoEm: string;
  sourceUrl: string;
  lookup: (code: string) => GovBrLookupRow | null;
  fieldKeys: readonly string[];
  validate?: (code: string, context?: GovBrValidateContext) => FiscalCodeValidationResult;
  validateRequiresCstTax?: boolean;
  defaultCstTax?: CstTax;
}

function sourceFromVersion(version: { endpoints: string[]; fonte: string }): string {
  return version.endpoints[0] ?? version.fonte;
}

function lookupAeroporto(code: string): GovBrLookupRow | null {
  const normalized = code.trim().toUpperCase();
  const aeroporto =
    /^[A-Z0-9]{3}$/.test(normalized)
      ? getAeroportoPorIata(normalized)
      : /^[A-Z]{4}$/.test(normalized)
        ? getAeroportoPorIcao(normalized)
        : undefined;
  if (!aeroporto) {
    return null;
  }
  return {
    iata: aeroporto.iata,
    icao: aeroporto.icao,
    nome: aeroporto.nome,
    uf: aeroporto.uf,
    municipioIbge: aeroporto.municipioIbge,
    municipioNome: aeroporto.municipioNome,
  };
}

export const FISCAL_MODULES: readonly GovBrModuleDefinition[] = [
  {
    id: 'nfeCuf',
    defaultCode: NFE_CUF_GOLDEN_SP,
    capturadoEm: NFE_CUF_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(NFE_CUF_DATA_VERSION),
    lookup: (code) => {
      const row = getCufPorCodigo(code) ?? getCufPorUf(code);
      return row
        ? {
            codigo: row.codigo,
            uf: row.uf,
            nome: row.nome,
            codigoIbge: row.codigoIbge,
          }
        : null;
    },
    fieldKeys: ['codigo', 'uf', 'nome', 'codigoIbge'],
  },
  {
    id: 'naturezaJuridica',
    defaultCode: '2062',
    capturadoEm: NATUREZA_JURIDICA_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(NATUREZA_JURIDICA_DATA_VERSION),
    lookup: (code) => {
      const row = getNaturezaJuridicaPorCodigo(code);
      return row ? { codigo: row.codigo, descricao: row.descricao } : null;
    },
    fieldKeys: ['codigo', 'descricao'],
  },
  {
    id: 'nbs',
    defaultCode: '1.1502.50.00',
    capturadoEm: NBS_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(NBS_DATA_VERSION),
    lookup: (code) => {
      const row = getNbsPorCodigo(code);
      return row ? { codigo: row.codigo, descricao: row.descricao } : null;
    },
    fieldKeys: ['codigo', 'descricao'],
  },
  {
    id: 'cest',
    defaultCode: '0302100',
    capturadoEm: CEST_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(CEST_DATA_VERSION),
    lookup: (code) => {
      const row = getCestPorCodigo(code);
      return row
        ? {
            codigo: row.codigo,
            descricao: row.descricao,
            segmento: row.segmento,
            ncms: row.ncms.join(', '),
          }
        : null;
    },
    fieldKeys: ['codigo', 'descricao', 'segmento', 'ncms'],
  },
  {
    id: 'cnae',
    defaultCode: CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS,
    capturadoEm: CNAES_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(CNAES_DATA_VERSION),
    lookup: (code) => {
      const row = getCnaePorCodigo(code);
      return row ? { codigo: row.codigo, descricao: row.descricao } : null;
    },
    fieldKeys: ['codigo', 'descricao'],
  },
  {
    id: 'cfop',
    defaultCode: CFOP_GOLDEN_COMPRA_COMERCIALIZACAO,
    capturadoEm: CFOP_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(CFOP_DATA_VERSION),
    lookup: (code) => {
      const row = getCfopPorCodigo(code);
      return row ? { codigo: row.codigo, descricao: row.descricao } : null;
    },
    validate: (code) => validateCfop(code),
    fieldKeys: ['codigo', 'descricao'],
  },
  {
    id: 'ncm',
    defaultCode: NCM_GOLDEN_SOJA_SEMENTES,
    capturadoEm: NCM_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(NCM_DATA_VERSION),
    lookup: (code) => {
      const row = getNcmPorCodigo(code);
      return row ? { codigo: row.codigo, descricao: row.descricao } : null;
    },
    validate: (code) => validateNcm(code),
    fieldKeys: ['codigo', 'descricao'],
  },
  {
    id: 'cst',
    defaultCode: CST_GOLDEN_ICMS_TRIBUTADA,
    capturadoEm: CST_DATA_VERSION.capturadoEm,
    sourceUrl: SPED_CST_CONSULTA_URL,
    defaultCstTax: 'icms',
    validateRequiresCstTax: true,
    lookup: (code) => {
      const row = validateCst(code, { tax: 'icms' });
      if (!row.ok) {
        return null;
      }
      return { codigo: row.value, descricao: row.description, tax: 'icms' };
    },
    validate: (code, context) => validateCst(code, { tax: context?.cstTax ?? 'icms' }),
    fieldKeys: ['codigo', 'descricao', 'tax'],
  },
  {
    id: 'issMunicipal',
    defaultCode: String(ISS_MUNICIPAL_GOLDEN_SAO_PAULO),
    capturadoEm: ISS_MUNICIPAL_DATA_VERSION.capturadoEm,
    sourceUrl: ISS_MUNICIPAL_DATA_VERSION.endpoints[0] ?? '',
    lookup: (code) => {
      const row = getIssMunicipalPorIbge(code);
      return row
        ? {
            codigoIbge: row.codigoIbge,
            nome: row.nome,
            uf: row.uf,
            aliquotaMin: row.aliquotaMin,
            aliquotaMax: row.aliquotaMax,
            warning: row.warning,
          }
        : null;
    },
    fieldKeys: ['codigoIbge', 'nome', 'uf', 'aliquotaMin', 'aliquotaMax', 'warning'],
  },
  {
    id: 'cbo',
    defaultCode: CBO_GOLDEN_ANALISTA_SISTEMAS,
    capturadoEm: CBO_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(CBO_DATA_VERSION),
    lookup: (code) => {
      const row = getCboPorCodigo(code);
      return row ? { codigo: row.codigo, descricao: row.descricao } : null;
    },
    fieldKeys: ['codigo', 'descricao'],
  },
];

export const TRADE_MODULES: readonly GovBrModuleDefinition[] = [
  {
    id: 'moedas',
    defaultCode: 'BRL',
    capturadoEm: MOEDAS_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(MOEDAS_DATA_VERSION),
    lookup: (code) => {
      const row = getMoedaPorCodigo(code);
      return row
        ? {
            codigo: row.codigo,
            nome: row.nome,
            simbolo: row.simbolo,
            tipoBacen: row.tipoBacen,
          }
        : null;
    },
    fieldKeys: ['codigo', 'nome', 'simbolo', 'tipoBacen'],
  },
  {
    id: 'paisesBacen',
    defaultCode: '1058',
    capturadoEm: PAISES_BACEN_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(PAISES_BACEN_DATA_VERSION),
    lookup: (code) => {
      const row = getPaisPorCodigoBacen(code);
      return row ? { codigo: row.codigo, nome: row.nome } : null;
    },
    fieldKeys: ['codigo', 'nome'],
  },
  {
    id: 'incoterms',
    defaultCode: 'FOB',
    capturadoEm: INCOTERMS_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(INCOTERMS_DATA_VERSION),
    lookup: (code) => {
      const row = getIncotermPorCodigo(code);
      return row ? { codigo: row.codigo, nome: row.nome, edicao: row.edicao } : null;
    },
    fieldKeys: ['codigo', 'nome', 'edicao'],
  },
];

export const LOGISTICS_MODULES: readonly GovBrModuleDefinition[] = [
  {
    id: 'portos',
    defaultCode: 'BRSSZ',
    capturadoEm: PORTOS_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(PORTOS_DATA_VERSION),
    lookup: (code) => {
      const row = getPortoPorCodigo(code);
      return row
        ? {
            codigo: row.codigo,
            nome: row.nome,
            uf: row.uf,
            municipioNome: row.municipioNome,
            municipioIbge: row.municipioIbge,
            situacao: row.situacao,
          }
        : null;
    },
    fieldKeys: ['codigo', 'nome', 'uf', 'municipioNome', 'municipioIbge', 'situacao'],
  },
  {
    id: 'aeroportos',
    defaultCode: 'GRU',
    capturadoEm: AEROPORTOS_DATA_VERSION.capturadoEm,
    sourceUrl: sourceFromVersion(AEROPORTOS_DATA_VERSION),
    lookup: lookupAeroporto,
    fieldKeys: ['iata', 'icao', 'nome', 'uf', 'municipioIbge', 'municipioNome'],
  },
];

export const GOVBR_GROUPS: Record<GovBrGroupId, readonly GovBrModuleDefinition[]> = {
  fiscal: FISCAL_MODULES,
  trade: TRADE_MODULES,
  logistics: LOGISTICS_MODULES,
};
