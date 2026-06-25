/**
 * CNIS / NIT — modulo 11 (same family as PIS/PASEP per RV_03).
 * @see https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf — RV_03
 */

export const CNIS_DV_WEIGHTS = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const CNIS_LENGTH = 11;
export const CNIS_BASE_LENGTH = 10;
export const CNIS_MASK_PATTERN = /^(\d{3})(\d{5})(\d{2})(\d{1})$/;

/** SIPREV RV_03 — shared checksum rules for PIS/PASEP/NIT. */
export const CNIS_OFFICIAL_VALIDATION_URL =
  'https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf';

/** INSS — NIT enrollment (individual contributors). */
export const CNIS_INSS_NIT_SERVICE_URL =
  'https://www.gov.br/pt-br/servicos/obter-numero-de-inscricao-no-inss-nit';

/** Golden — Caixa PIS series (UC-006 cross-check). */
export const CNIS_GOLDEN_CAIXA_PIS = '10027230888';
export const CNIS_GOLDEN_CAIXA_PIS_MASKED = '100.27230.88-8';

/** Golden — INSS NIT series (leading zero, DV per RV_03). */
export const CNIS_GOLDEN_INSS_NIT = '01234567897';
export const CNIS_GOLDEN_INSS_NIT_MASKED = '012.34567.89-7';
