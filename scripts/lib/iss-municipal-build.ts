/**
 * Build ISS municipal partial embed — 27 capitals + top PIB municipalities (100 rows).
 */

import {
  ISS_MUNICIPAL_CAPITAL_IBGE_CODES,
  ISS_MUNICIPAL_CAPITAL_SEEDS,
  type IssMunicipalRateSeed,
} from './iss-municipal-capital-seeds.js';
import { parseIbgePibTopMunicipios, type IbgePibMunicipioRow } from './parse-ibge-pib-top-municipios.js';

export const ISS_MUNICIPAL_TARGET_COUNT = 100;
export const ISS_MUNICIPAL_LC116_MIN = 2;
export const ISS_MUNICIPAL_LC116_MAX = 5;

/** LC 116 Art. 8 — federal ISS alíquota band (fallback for estimation rows). */
export const PLANALTO_LC116_ART8_URL =
  'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm#art8';

export interface IssMunicipalEmbedRow {
  codigoIbge: number;
  nome: string;
  uf: string;
  aliquotaMin: number;
  aliquotaMax: number;
  leiUrl: string;
  capturadoEm: string;
  estimativa: boolean;
  pibRank: number | null;
}

export interface MunicipioIndexEntry {
  codigo: number;
  nome: string;
  uf: string;
}

function normalizeNomeKey(nome: string, uf: string): string {
  return `${nome.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()}|${uf}`;
}

export function buildMunicipioNameIndex(
  municipios: readonly MunicipioIndexEntry[],
): Map<string, MunicipioIndexEntry> {
  const index = new Map<string, MunicipioIndexEntry>();
  for (const municipio of municipios) {
    index.set(normalizeNomeKey(municipio.nome, municipio.uf), municipio);
  }
  return index;
}

function seedByIbge(
  seeds: readonly IssMunicipalRateSeed[],
): Map<number, IssMunicipalRateSeed> {
  return new Map(seeds.map((seed) => [seed.codigoIbge, seed]));
}

function resolveRateSeed(
  codigoIbge: number,
  seeds: Map<number, IssMunicipalRateSeed>,
  capturadoEm: string,
): Pick<IssMunicipalEmbedRow, 'aliquotaMin' | 'aliquotaMax' | 'leiUrl' | 'capturadoEm' | 'estimativa'> {
  const seed = seeds.get(codigoIbge);
  if (seed !== undefined) {
    return {
      aliquotaMin: seed.aliquotaMin,
      aliquotaMax: seed.aliquotaMax,
      leiUrl: seed.leiUrl,
      capturadoEm,
      estimativa: false,
    };
  }

  return {
    aliquotaMin: ISS_MUNICIPAL_LC116_MIN,
    aliquotaMax: ISS_MUNICIPAL_LC116_MAX,
    leiUrl: PLANALTO_LC116_ART8_URL,
    capturadoEm,
    estimativa: true,
  };
}

function appendRow(
  selected: Map<number, IssMunicipalEmbedRow>,
  municipio: MunicipioIndexEntry,
  pibRank: number | null,
  seeds: Map<number, IssMunicipalRateSeed>,
  capturadoEm: string,
): void {
  if (selected.has(municipio.codigo)) {
    return;
  }

  const rate = resolveRateSeed(municipio.codigo, seeds, capturadoEm);
  selected.set(municipio.codigo, {
    codigoIbge: municipio.codigo,
    nome: municipio.nome,
    uf: municipio.uf,
    ...rate,
    pibRank,
  });
}

export function buildIssMunicipalEmbed(params: {
  municipios: readonly MunicipioIndexEntry[];
  pibTopRows: readonly IbgePibMunicipioRow[];
  capturadoEm: string;
  targetCount?: number;
}): IssMunicipalEmbedRow[] {
  const targetCount = params.targetCount ?? ISS_MUNICIPAL_TARGET_COUNT;
  const nameIndex = buildMunicipioNameIndex(params.municipios);
  const byCodigo = new Map(params.municipios.map((entry) => [entry.codigo, entry]));
  const seeds = seedByIbge(ISS_MUNICIPAL_CAPITAL_SEEDS);
  const selected = new Map<number, IssMunicipalEmbedRow>();

  for (const codigoIbge of ISS_MUNICIPAL_CAPITAL_IBGE_CODES) {
    const municipio = byCodigo.get(codigoIbge);
    if (municipio === undefined) {
      throw new Error(`Capital IBGE code ${String(codigoIbge)} missing from municipios index`);
    }
    appendRow(selected, municipio, null, seeds, params.capturadoEm);
  }

  for (const pibRow of params.pibTopRows) {
    if (selected.size >= targetCount) {
      break;
    }

    const municipio = nameIndex.get(normalizeNomeKey(pibRow.nome, pibRow.uf));
    if (municipio === undefined) {
      throw new Error(`PIB row not found in municipios index: ${pibRow.nome}/${pibRow.uf}`);
    }

    appendRow(selected, municipio, pibRow.pibRank, seeds, params.capturadoEm);
  }

  if (selected.size !== targetCount) {
    throw new Error(
      `Expected ${String(targetCount)} ISS municipal rows, built ${String(selected.size)}`,
    );
  }

  return [...selected.values()].sort((left, right) => {
    const leftRank = left.pibRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.pibRank ?? Number.MAX_SAFE_INTEGER;
    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }
    return left.nome.localeCompare(right.nome, 'pt-BR');
  });
}

export function parseIbgePibTopForBuild(
  xlsxPath: string,
  municipios: readonly MunicipioIndexEntry[],
): IbgePibMunicipioRow[] {
  const nameIndex = buildMunicipioNameIndex(municipios);
  return parseIbgePibTopMunicipios(xlsxPath, nameIndex, ISS_MUNICIPAL_TARGET_COUNT);
}
