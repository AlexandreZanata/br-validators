/**
 * Simples Nacional — LC 123/2006 annex tables (offline embedded law data).
 * @see https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm
 * @see http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=48430
 */

import anexosData from './data/anexos.json';
import { SIMPLES_MAX_RBT12 } from './constants.js';
import type { SimplesAnexo, SimplesAnexoId, SimplesFaixaLookup } from './types.js';

const anexos: readonly SimplesAnexo[] = anexosData as SimplesAnexo[];

const ROMAN_TO_ID: Record<string, SimplesAnexoId> = {
  I: 'I',
  II: 'II',
  III: 'III',
  IV: 'IV',
  V: 'V',
};

function normalizeAnexoId(anexo: string): SimplesAnexoId | '' {
  const trimmed = anexo.trim().toUpperCase();
  if (trimmed.length === 0) {
    return '';
  }

  const romanMatch = /^ANEXO\s+([IV]+)$/u.exec(trimmed);
  if (romanMatch !== null) {
    const roman = romanMatch[1];
    return ROMAN_TO_ID[roman] ?? '';
  }

  if (trimmed in ROMAN_TO_ID) {
    return ROMAN_TO_ID[trimmed];
  }

  const digitMap: Record<string, SimplesAnexoId> = {
    '1': 'I',
    '2': 'II',
    '3': 'III',
    '4': 'IV',
    '5': 'V',
  };
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 1 && digits in digitMap) {
    return digitMap[digits];
  }

  return '';
}

function isValidReceitaBruta(receitaBruta: number): boolean {
  return Number.isFinite(receitaBruta) && receitaBruta > 0 && receitaBruta <= SIMPLES_MAX_RBT12;
}

export function getSimplesAnexos(): readonly SimplesAnexo[] {
  return anexos;
}

export function getSimplesAnexo(anexo: string): SimplesAnexo | undefined {
  const normalized = normalizeAnexoId(anexo);
  if (normalized.length === 0) {
    return undefined;
  }
  return anexos.find((entry) => entry.id === normalized);
}

const FAIXA_MAX_RECEITAS = [180_000, 360_000, 720_000, 1_800_000, 3_600_000, 4_800_000] as const;

function resolveFaixaIndex(receitaBruta: number): number {
  if (receitaBruta <= FAIXA_MAX_RECEITAS[0]) {
    return 0;
  }
  if (receitaBruta <= FAIXA_MAX_RECEITAS[1]) {
    return 1;
  }
  if (receitaBruta <= FAIXA_MAX_RECEITAS[2]) {
    return 2;
  }
  if (receitaBruta <= FAIXA_MAX_RECEITAS[3]) {
    return 3;
  }
  if (receitaBruta <= FAIXA_MAX_RECEITAS[4]) {
    return 4;
  }
  return 5;
}

export function getSimplesFaixa(options: {
  anexo: string;
  receitaBruta: number;
}): SimplesFaixaLookup | undefined {
  const anexoEntry = getSimplesAnexo(options.anexo);
  if (anexoEntry === undefined || !isValidReceitaBruta(options.receitaBruta)) {
    return undefined;
  }
  const faixa = anexoEntry.faixas[resolveFaixaIndex(options.receitaBruta)];
  return { ...faixa, anexo: anexoEntry.id };
}

export function computeSimplesAliquotaEfetiva(options: {
  anexo: string;
  receitaBruta: number;
}): number | undefined {
  const faixa = getSimplesFaixa(options);
  if (faixa === undefined) {
    return undefined;
  }
  const numerator = options.receitaBruta * faixa.aliquotaNominal - faixa.parcelaDeduzir;
  return numerator / options.receitaBruta;
}
