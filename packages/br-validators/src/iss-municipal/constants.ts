/**
 * Municipal ISS alíquota constants — partial embed (estimation only).
 * @see https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm#art8
 */

export const PLANALTO_LC116_URL = 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm';

export const PLANALTO_LC116_ART8_URL = `${PLANALTO_LC116_URL}#art8`;

export const IBGE_PIB_MUNICIPAL_URL =
  'https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9088-produto-interno-bruto-dos-municipios.html';

export const IBGE_MUNICIPIO_CODES_URL = 'https://www.ibge.gov.br/explica/codigos-dos-municipios.php';

export const CNM_LEGISLACAO_URL = 'https://www.cnm.org.br/';

export const NFSE_NACIONAL_URL = 'https://www.gov.br/nfse/pt-br';

export const ISS_MUNICIPAL_TARGET_COUNT = 100;

export const ISS_MUNICIPAL_CAPITAL_COUNT = 27;

export const ISS_MUNICIPAL_LC116_MIN = 2;

export const ISS_MUNICIPAL_LC116_MAX = 5;

/** Golden municipality — São Paulo capital (IBGE 3550308). */
export const ISS_MUNICIPAL_GOLDEN_SAO_PAULO = 3550308;

/** Golden municipality — Rio de Janeiro capital (IBGE 3304557). */
export const ISS_MUNICIPAL_GOLDEN_RIO = 3304557;

/** Golden municipality — Belo Horizonte capital (IBGE 3106200). */
export const ISS_MUNICIPAL_GOLDEN_BELO_HORIZONTE = 3106200;

export const ISS_MUNICIPAL_ESTIMATION_WARNING =
  'Partial municipal ISS embed for estimation and quoting only — not for NFSe emission. ' +
  'Confirm current alíquota and LC 116 item with the municipality before billing.';

export const ISS_MUNICIPAL_METADATA_ESTIMATIVA = true;
