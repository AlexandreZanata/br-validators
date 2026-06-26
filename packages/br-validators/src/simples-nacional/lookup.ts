/**
 * Simples Nacional — LC 123/2006 annex tables (offline embedded law data).
 * @see https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm
 * @see http://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=48430
 */

import anexosData from './data/anexos.json';
import { SIMPLES_MAX_RBT12 } from './constants.js';
import {
  lookupFound,
  lookupInvalidFormat,
  lookupInvalidInput,
  unwrapLookupValue,
  type LookupResult,
} from '../types/lookup-result.js';
import type { SimplesAnexo, SimplesAnexoId, SimplesFaixaLookup } from './types.js';

const anexos: readonly SimplesAnexo[] = anexosData as SimplesAnexo[];

const ROMAN_TO_ID: Record<string, SimplesAnexoId> = {
  I: 'I',
  II: 'II',
  III: 'III',
  IV: 'IV',
  V: 'V',
};

function normalizeAnexoId(trimmedUpper: string): SimplesAnexoId | '' {
  const romanMatch = /^ANEXO\s+([IV]+)$/u.exec(trimmedUpper);
  if (romanMatch !== null) {
    const roman = romanMatch[1];
    return ROMAN_TO_ID[roman] ?? '';
  }

  if (trimmedUpper in ROMAN_TO_ID) {
    return ROMAN_TO_ID[trimmedUpper];
  }

  const digitMap: Record<string, SimplesAnexoId> = {
    '1': 'I',
    '2': 'II',
    '3': 'III',
    '4': 'IV',
    '5': 'V',
  };
  const digits = trimmedUpper.replace(/\D/g, '');
  if (digits.length === 1 && digits in digitMap) {
    return digitMap[digits];
  }

  return '';
}

function isValidReceitaBruta(receitaBruta: number): boolean {
  return Number.isFinite(receitaBruta) && receitaBruta > 0 && receitaBruta <= SIMPLES_MAX_RBT12;
}

/** Returns every Simples Nacional annex table (in-memory reference, not a copy). */
export function getAllSimplesAnexos(): readonly SimplesAnexo[] {
  return anexos;
}

/** @deprecated Use {@link getAllSimplesAnexos} instead. Removed in v2.0. */
export function getSimplesAnexos(): readonly SimplesAnexo[] {
  return getAllSimplesAnexos();
}

export function lookupSimplesAnexo(anexo: string): LookupResult<SimplesAnexo> {
  const trimmed = anexo.trim();
  if (trimmed.length === 0) {
    return lookupInvalidInput('Simples Nacional annex code is required');
  }

  const normalized = normalizeAnexoId(trimmed.toUpperCase());
  if (normalized.length === 0) {
    return lookupInvalidFormat('Simples Nacional annex must be I–V (roman or digit 1–5)');
  }

  const found = anexos.find((entry) => entry.id === normalized);
  return lookupFound(found as SimplesAnexo);
}

export function getSimplesAnexo(anexo: string): SimplesAnexo | undefined {
  return unwrapLookupValue(lookupSimplesAnexo(anexo));
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

export function lookupSimplesFaixa(options: {
  anexo: string;
  receitaBruta: number;
}): LookupResult<SimplesFaixaLookup> {
  const anexoResult = lookupSimplesAnexo(options.anexo);
  if (!anexoResult.ok) {
    if (anexoResult.code === 'INVALID_INPUT') {
      return lookupInvalidInput(anexoResult.message);
    }
    return lookupInvalidFormat(anexoResult.message);
  }

  if (!isValidReceitaBruta(options.receitaBruta)) {
    return lookupInvalidFormat(
      `Receita bruta must be a positive number up to ${String(SIMPLES_MAX_RBT12)}`,
    );
  }

  const faixa = anexoResult.value.faixas[resolveFaixaIndex(options.receitaBruta)];
  return lookupFound({ ...faixa, anexo: anexoResult.value.id });
}

export function getSimplesFaixa(options: {
  anexo: string;
  receitaBruta: number;
}): SimplesFaixaLookup | undefined {
  return unwrapLookupValue(lookupSimplesFaixa(options));
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
