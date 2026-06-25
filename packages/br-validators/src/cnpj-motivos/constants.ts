/**
 * RFB CNPJ motivos de situação cadastral — official open-data reference.
 * @see https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj/
 */

export const CNPJ_MOTIVOS_BASE_URL =
  'https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj';

export const CNPJ_MOTIVOS_LAYOUT_URL =
  'https://www.gov.br/receitafederal/dados/cnpj-metadados.pdf';

export const CNPJ_MOTIVOS_MIN_CODES = 55;
export const CNPJ_MOTIVOS_MAX_CODES = 65;

/** Golden — sem motivo (code 00). */
export const CNPJ_MOTIVOS_GOLDEN_SEM_MOTIVO = '00';

/** Golden — extinção por encerramento liquidação voluntária (code 01). */
export const CNPJ_MOTIVOS_GOLDEN_EXTINCAO_VOLUNTARIA = '01';

/** Golden — incorporação (code 02). */
export const CNPJ_MOTIVOS_GOLDEN_INCORPORACAO = '02';

/**
 * Estabelecimentos layout situacao_cadastral codes (reference only — not embedded).
 * @see OFFICIAL-REFERENCE.md
 */
export const SITUACAO_CADASTRAL_LABELS: Readonly<Record<string, string>> = {
  '01': 'Nula',
  '02': 'Ativa',
  '03': 'Suspensa',
  '04': 'Inapta',
  '08': 'Baixada',
};
