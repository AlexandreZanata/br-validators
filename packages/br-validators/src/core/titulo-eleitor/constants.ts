/**
 * Título de Eleitor constants — modulo 11 (TSE Res. 20.132/1998 + algorithm cross-checks).
 * @see https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998 — Art. 10 (structure, mod 11)
 * @see https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador — weights + SP/MG rule
 * @see http://ghiorzi.org/DVnew.htm#e — algorithm cross-check
 */
import type { UfCode } from '../../types/validation-result.js';

export const TITULO_ELEITOR_DV1_WEIGHTS_8 = [2, 3, 4, 5, 6, 7, 8, 9] as const;
export const TITULO_ELEITOR_DV1_WEIGHTS_9 = [9, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const TITULO_ELEITOR_DV2_WEIGHTS = [7, 8, 9] as const;
export const TITULO_ELEITOR_SEQUENTIAL_LENGTH = 8;
export const TITULO_ELEITOR_SEQUENTIAL_LENGTH_EXTENDED = 9;
export const TITULO_ELEITOR_LENGTH = 12;
export const TITULO_ELEITOR_LENGTH_EXTENDED = 13;
export const TITULO_ELEITOR_UF_LENGTH = 2;
export const TITULO_ELEITOR_DV_LENGTH = 2;
export const TITULO_ELEITOR_MIN_UF_CODE = 1;
export const TITULO_ELEITOR_MAX_UF_CODE = 28;
export const TITULO_ELEITOR_NUMERIC_PATTERN_12 = /^\d{12}$/;
export const TITULO_ELEITOR_NUMERIC_PATTERN_13 = /^\d{13}$/;

/** TSE UF codes where remainder 0 maps DV to 1 instead of 0. */
export const TITULO_ELEITOR_SPECIAL_UF_CODES = [1, 2] as const;

/** Golden primary — SC (UF=09), Wikipedia PT walkthrough. */
export const TITULO_ELEITOR_GOLDEN_PRIMARY = '004356870906';
export const TITULO_ELEITOR_GOLDEN_SP_SPECIAL = '000000000116';
export const TITULO_ELEITOR_GOLDEN_SP_EXTENDED = '1234567890175';
export const TITULO_ELEITOR_GOLDEN_EXTERIOR = '000000012895';
export const TITULO_ELEITOR_GOLDEN_MASKED_INPUT = '0043 5687 0906';

/** Normative — Resolução TSE 20.132/1998, Art. 10 (8 seq + 2 UF + 2 DV, mod 11). */
export const TITULO_ELEITOR_OFFICIAL_SOURCE_URL =
  'https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998';

/** Normative — Resolução TSE 23.659/2021 (Cadastro Eleitoral; confirms UF + DV structure). */
export const TITULO_ELEITOR_NORMATIVE_SECONDARY_URL =
  'https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-659-de-26-de-outubro-de-2021';

/**
 * Algorithm weights + SP/MG remainder-zero rule — not in TSE resolution text.
 * Community consensus validated empirically (Wikipedia PT worked example).
 */
export const TITULO_ELEITOR_ALGORITHM_WEIGHTS_REF_URL =
  'https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador';

/** Algorithm cross-check — Ghiorzi DV table. */
export const TITULO_ELEITOR_ALGORITHM_REF_URL = 'http://ghiorzi.org/DVnew.htm#e';

export const TITULO_ELEITOR_TSE_PORTAL_URL = 'https://www.tse.jus.br/';

export const TITULO_ELEITOR_ETITULO_URL =
  'https://www.tse.jus.br/eleitor/servicos/aplicativo-e-titulo';

/** TSE electoral UF code → Brazilian UF (28 = exterior / ZZ). */
export const TITULO_ELEITOR_UF_BY_CODE: Readonly<Record<number, UfCode>> = {
  1: 'SP',
  2: 'MG',
  3: 'RJ',
  4: 'RS',
  5: 'BA',
  6: 'PR',
  7: 'CE',
  8: 'PE',
  9: 'SC',
  10: 'GO',
  11: 'MA',
  12: 'PB',
  13: 'PA',
  14: 'ES',
  15: 'PI',
  16: 'RN',
  17: 'AL',
  18: 'MT',
  19: 'MS',
  20: 'DF',
  21: 'SE',
  22: 'AM',
  23: 'RO',
  24: 'AC',
  25: 'AP',
  26: 'RR',
  27: 'TO',
};

export const TITULO_ELEITOR_EXTERIOR_UF_CODE = 28;
