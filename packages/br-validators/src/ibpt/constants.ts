/**
 * IBPT — approximate tax burden per NCM (Lei 12.741/2012 — De Olho no Imposto).
 * @see https://deolhonoimposto.ibpt.org.br/
 */

export const IBPT_OFFICIAL_PORTAL_URL = 'https://deolhonoimposto.ibpt.org.br/';

export const IBPT_LEI_12741_URL =
  'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12741.htm';

/** Golden NCM — purebred horse breeders (pairs with `ncm.official.json`). */
export const IBPT_GOLDEN_NCM_CAVALOS = '01012100';

/** Golden NCM — soybean seeds for sowing. */
export const IBPT_GOLDEN_NCM_SOJA = '12011000';

/** Golden NCM — malt beer (CEST cross-ref). */
export const IBPT_GOLDEN_NCM_CERVEJA = '22030000';

/** Golden UF — São Paulo. */
export const IBPT_GOLDEN_UF_SP = 'SP';

/** Golden UF — Rio de Janeiro (distinct estadual rate for 01012100). */
export const IBPT_GOLDEN_UF_RJ = 'RJ';

/** NCM codes refreshed by fetch script (subset embed — not full matrix). */
export const IBPT_GOLDEN_NCMS = [
  IBPT_GOLDEN_NCM_CAVALOS,
  IBPT_GOLDEN_NCM_SOJA,
  IBPT_GOLDEN_NCM_CERVEJA,
] as const;

/** UFs refreshed by fetch script for golden NCM subset. */
export const IBPT_GOLDEN_UFS = ['SP', 'RJ', 'MG'] as const;

export const IBPT_MIN_EMBEDDED_CARGAS = 4;
export const IBPT_MAX_EMBEDDED_CARGAS = 12;

export const IBPT_UF_SIGLAS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;

export type IbptUfSigla = (typeof IBPT_UF_SIGLAS)[number];

export const IBPT_UF_SIGLA_SET: ReadonlySet<string> = new Set(IBPT_UF_SIGLAS);
