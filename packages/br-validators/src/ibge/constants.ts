/**
 * IBGE localities — official Brazilian states and municipalities.
 * @see https://servicodados.ibge.gov.br/api/docs/localidades
 */

export const IBGE_OFFICIAL_DOCS_URL = 'https://servicodados.ibge.gov.br/api/docs/localidades';
export const IBGE_ESTADOS_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
export const IBGE_MUNICIPIOS_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';

export const IBGE_EXPECTED_ESTADOS = 27;
export const IBGE_MIN_MUNICIPIOS = 5500;

/** All 27 federative unit siglas — used for UF filter validation. */
export const IBGE_UF_SIGLAS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;

export type IbgeUfSigla = (typeof IBGE_UF_SIGLAS)[number];

export const IBGE_UF_SIGLA_SET: ReadonlySet<string> = new Set(IBGE_UF_SIGLAS);

/** Golden municipality — São Paulo capital (IBGE 3550308). */
export const IBGE_GOLDEN_MUNICIPIO_SP = 3550308;

/** Golden municipality — Sorriso, MT (IBGE 5107925). */
export const IBGE_GOLDEN_MUNICIPIO_SORRISO = 5107925;

/** Golden municipality — Brasília, DF (IBGE 5300108). */
export const IBGE_GOLDEN_MUNICIPIO_BRASILIA = 5300108;

/** Golden state — São Paulo (IBGE 35). */
export const IBGE_GOLDEN_ESTADO_SP = 35;

/** IBGE municipality code structure — official explanation (7-digit DV rules). */
export const IBGE_MUNICIPIO_CODIGOS_URL = 'https://www.ibge.gov.br/explica/codigos-dos-municipios.php';

/** NF-e MOC 7.0 Anexo I — campo B12 cMunFG (municipality of tax occurrence). */
export const NFE_MOC_ANEXO_I_URL =
  'https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=BMPFMBoln3w=';

/** Golden cMunFG base (6 digits) — São Paulo capital → 3550308. */
export const CMUNFG_GOLDEN_BASE_SAO_PAULO = '355030';

/** Golden cMunFG full code — São Paulo capital. */
export const CMUNFG_GOLDEN_SAO_PAULO = 3550308;

/** Golden cMunFG exception — Bom Princípio do Piauí (non-algorithmic DV). */
export const CMUNFG_GOLDEN_EXCEPTION_BOM_PRINCIPIO = 2201919;
