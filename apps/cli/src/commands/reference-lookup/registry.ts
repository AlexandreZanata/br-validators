import {
  CEST_DATA_VERSION,
  lookupCestPorCodigo,
  type Cest,
} from '@br-validators/core/cest';
import {
  INCOTERMS_DATA_VERSION,
  lookupIncotermPorCodigo,
  type Incoterm,
} from '@br-validators/core/incoterms';
import {
  MOEDAS_DATA_VERSION,
  lookupMoedaPorCodigo,
  type Moeda,
} from '@br-validators/core/moedas';
import {
  NATUREZA_JURIDICA_DATA_VERSION,
  lookupNaturezaJuridicaPorCodigo,
  type NaturezaJuridica,
} from '@br-validators/core/natureza-juridica';
import { NBS_DATA_VERSION, lookupNbsPorCodigo, type Nbs } from '@br-validators/core/nbs';
import {
  PAISES_BACEN_DATA_VERSION,
  lookupPaisPorCodigoBacen,
  type PaisBacen,
} from '@br-validators/core/paises-bacen';
import {
  AEROPORTOS_DATA_VERSION,
  lookupAeroportoPorIata,
  lookupAeroportoPorIcao,
  type Aeroporto,
} from '@br-validators/core/aeroportos';
import { PORTOS_DATA_VERSION, lookupPortoPorCodigo, type Porto } from '@br-validators/core/portos';
import {
  CNAES_DATA_VERSION,
  lookupCnaePorCodigo,
  type Cnae,
} from '@br-validators/core/cnaes';
import {
  CFOP_DATA_VERSION,
  lookupCfopPorCodigo,
  type Cfop,
} from '@br-validators/core/cfop';
import {
  CSOSN_DATA_VERSION,
  lookupCsosnPorCodigo,
  type Csosn,
} from '@br-validators/core/csosn';
import { NCM_DATA_VERSION, lookupNcmPorCodigo, type Ncm } from '@br-validators/core/ncm';
import { CBO_DATA_VERSION, lookupCboPorCodigo, type Cbo } from '@br-validators/core/cbo';
import type { LookupResult } from '@br-validators/core/lookup';
import {
  lookupInvalidFormat,
  lookupInvalidInput,
} from '@br-validators/core/lookup';

export const REFERENCE_LOOKUP_COMMANDS = [
  'natureza-juridica',
  'nbs',
  'cest',
  'cnae',
  'cfop',
  'csosn',
  'ncm',
  'cbo',
  'moedas',
  'paises-bacen',
  'incoterms',
  'portos',
  'aeroportos',
] as const;

export const REFERENCE_SEARCH_COMMANDS = ['cnae', 'cfop', 'csosn', 'ncm', 'cbo'] as const;

export type ReferenceSearchCommand = (typeof REFERENCE_SEARCH_COMMANDS)[number];

export type ReferenceLookupCommand = (typeof REFERENCE_LOOKUP_COMMANDS)[number];

export type ReferenceLookupValue =
  | NaturezaJuridica
  | Nbs
  | Cest
  | Cnae
  | Cfop
  | Csosn
  | Ncm
  | Cbo
  | Moeda
  | PaisBacen
  | Incoterm
  | Porto
  | Aeroporto;

export interface ReferenceLookupModule {
  command: ReferenceLookupCommand;
  description: string;
  resultKey: string;
  capturadoEm: string;
  lookup: (input: string) => LookupResult<ReferenceLookupValue>;
  formatHuman: (result: ReferenceLookupValue) => string;
}

function lookupAeroporto(input: string): LookupResult<Aeroporto> {
  const normalized = input.trim().toUpperCase();
  if (normalized.length === 0) {
    return lookupInvalidInput('Airport code is required');
  }
  if (/^[A-Z0-9]{3}$/.test(normalized)) {
    return lookupAeroportoPorIata(normalized);
  }
  if (/^[A-Z]{4}$/.test(normalized)) {
    return lookupAeroportoPorIcao(normalized);
  }
  return lookupInvalidFormat('Airport code must be 3-character IATA or 4-character ICAO');
}

export const REFERENCE_LOOKUP_MODULES: Record<ReferenceLookupCommand, ReferenceLookupModule> = {
  'natureza-juridica': {
    command: 'natureza-juridica',
    description: 'RFB legal nature codes — offline lookup',
    resultKey: 'naturezaJuridica',
    capturadoEm: NATUREZA_JURIDICA_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupNaturezaJuridicaPorCodigo(input),
    formatHuman: (result) => {
      const row = result as NaturezaJuridica;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  nbs: {
    command: 'nbs',
    description: 'NFSe NBS service codes — offline lookup',
    resultKey: 'nbs',
    capturadoEm: NBS_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupNbsPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Nbs;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  cest: {
    command: 'cest',
    description: 'CONFAZ CEST ST codes — offline lookup',
    resultKey: 'cest',
    capturadoEm: CEST_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupCestPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Cest;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  cnae: {
    command: 'cnae',
    description: 'IBGE CNAE 2.3 subclasses — offline lookup',
    resultKey: 'cnae',
    capturadoEm: CNAES_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupCnaePorCodigo(input),
    formatHuman: (result) => {
      const row = result as Cnae;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  cfop: {
    command: 'cfop',
    description: 'CONFAZ CFOP fiscal operations — offline lookup',
    resultKey: 'cfop',
    capturadoEm: CFOP_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupCfopPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Cfop;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  csosn: {
    command: 'csosn',
    description: 'CONFAZ CSOSN Simples Nacional — offline lookup',
    resultKey: 'csosn',
    capturadoEm: CSOSN_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupCsosnPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Csosn;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  ncm: {
    command: 'ncm',
    description: 'Siscomex NCM Mercosur codes — offline lookup',
    resultKey: 'ncm',
    capturadoEm: NCM_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupNcmPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Ncm;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  cbo: {
    command: 'cbo',
    description: 'MTE CBO 2002 occupations — offline lookup',
    resultKey: 'cbo',
    capturadoEm: CBO_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupCboPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Cbo;
      return `${row.codigo} — ${row.descricao}`;
    },
  },
  moedas: {
    command: 'moedas',
    description: 'ISO 4217 + Bacen PTAX currencies — offline lookup',
    resultKey: 'moeda',
    capturadoEm: MOEDAS_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupMoedaPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Moeda;
      const symbol = row.simbolo ?? '—';
      return `${row.codigo} — ${row.nome} (${symbol})`;
    },
  },
  'paises-bacen': {
    command: 'paises-bacen',
    description: 'NF-e Bacen country codes — offline lookup',
    resultKey: 'pais',
    capturadoEm: PAISES_BACEN_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupPaisPorCodigoBacen(input),
    formatHuman: (result) => {
      const row = result as PaisBacen;
      return `${row.codigo} — ${row.nome}`;
    },
  },
  incoterms: {
    command: 'incoterms',
    description: 'ICC Incoterms 2020 — offline lookup',
    resultKey: 'incoterm',
    capturadoEm: INCOTERMS_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupIncotermPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Incoterm;
      return `${row.codigo} — ${row.nome} (${row.edicao})`;
    },
  },
  portos: {
    command: 'portos',
    description: 'ANTAQ port installations — offline lookup',
    resultKey: 'porto',
    capturadoEm: PORTOS_DATA_VERSION.capturadoEm,
    lookup: (input) => lookupPortoPorCodigo(input),
    formatHuman: (result) => {
      const row = result as Porto;
      return `${row.codigo} — ${row.nome} (${row.uf})`;
    },
  },
  aeroportos: {
    command: 'aeroportos',
    description: 'ANAC public aerodromos — offline lookup by IATA or ICAO',
    resultKey: 'aeroporto',
    capturadoEm: AEROPORTOS_DATA_VERSION.capturadoEm,
    lookup: lookupAeroporto,
    formatHuman: (result) => {
      const row = result as Aeroporto;
      const iata = row.iata ?? '—';
      return `${iata}/${row.icao} — ${row.nome} (${row.uf})`;
    },
  },
};

export function isReferenceLookupCommand(value: string): value is ReferenceLookupCommand {
  return (REFERENCE_LOOKUP_COMMANDS as readonly string[]).includes(value);
}

export function isReferenceSearchCommand(value: string): value is ReferenceSearchCommand {
  return (REFERENCE_SEARCH_COMMANDS as readonly string[]).includes(value);
}
