/**
 * Título de Eleitor check digits — modulo 11 (TSE / Wikipedia PT + Ghiorzi).
 * @see https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998
 * @see https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador
 * @see http://ghiorzi.org/DVnew.htm#e
 */
import { weightedSum } from '../cnpj/modulo11.js';
import {
  TITULO_ELEITOR_DV1_WEIGHTS_8,
  TITULO_ELEITOR_DV1_WEIGHTS_9,
  TITULO_ELEITOR_DV2_WEIGHTS,
  TITULO_ELEITOR_SPECIAL_UF_CODES,
} from './constants.js';

function digitValues(chars: string): number[] {
  const values: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    values.push(Number(chars.charAt(i)));
  }
  return values;
}

function isSpecialUf(ufCode: number): boolean {
  return (TITULO_ELEITOR_SPECIAL_UF_CODES as readonly number[]).includes(ufCode);
}

export function resolveTituloEleitorCheckDigit(remainder: number, ufCode: number): number {
  if (remainder >= 10) {
    return 0;
  }
  if (remainder === 0 && isSpecialUf(ufCode)) {
    return 1;
  }
  return remainder;
}

export function computeTituloEleitorFirstCheckDigit(sequential: string, ufCode: number): number {
  const weights =
    sequential.length === 8 ? TITULO_ELEITOR_DV1_WEIGHTS_8 : TITULO_ELEITOR_DV1_WEIGHTS_9;
  const remainder = weightedSum(digitValues(sequential), weights) % 11;
  return resolveTituloEleitorCheckDigit(remainder, ufCode);
}

export function computeTituloEleitorSecondCheckDigit(
  ufDigits: string,
  firstDv: number,
  ufCode: number,
): number {
  const uf1 = Number(ufDigits.charAt(0));
  const uf2 = Number(ufDigits.charAt(1));
  const remainder = weightedSum([uf1, uf2, firstDv], TITULO_ELEITOR_DV2_WEIGHTS) % 11;
  return resolveTituloEleitorCheckDigit(remainder, ufCode);
}

export function computeTituloEleitorCheckDigits(
  sequential: string,
  ufDigits: string,
  ufCode: number,
): string {
  const dv1 = computeTituloEleitorFirstCheckDigit(sequential, ufCode);
  const dv2 = computeTituloEleitorSecondCheckDigit(ufDigits, dv1, ufCode);
  return `${String(dv1)}${String(dv2)}`;
}
