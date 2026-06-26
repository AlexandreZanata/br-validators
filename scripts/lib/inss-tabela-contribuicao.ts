/**
 * INSS employee contribution progressive table — Portaria MPS/MF nº 6/2025 Anexo II.
 * @see https://www.gov.br/inss/pt-br/noticias/confira-como-ficaram-as-aliquotas-de-contribuicao-ao-inss
 */

export const INSS_PORTARIA_DOU_URL =
  'https://www.in.gov.br/web/dou/-/portaria-interministerial-mps/mf-n-6-de-10-de-janeiro-de-2025-606526848';

export const INSS_PORTARIA_PDF_URL =
  'https://www.gov.br/previdencia/pt-br/assuntos/rpps/legislacao-dos-rpps/2025/PortariaInterministerialMPSMFn6de10jan2025.pdf';

export const INSS_ALIQUOTAS_URL =
  'https://www.gov.br/inss/pt-br/noticias/confira-como-ficaram-as-aliquotas-de-contribuicao-ao-inss';

export const LEI_10887_URL = 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10887.htm';

export const INSS_DEFAULT_ANO = 2025;

export const INSS_FAIXAS_POR_TABELA = 4;

export const INSS_TETO_2025 = 8157.41;

/** Golden salary R$ 3.000,00 — faixa 3, contribuição R$ 253,41. */
export const INSS_GOLDEN_SALARIO_3000 = 3000;

export const INSS_GOLDEN_CONTRIBUICAO_3000 = 253.41;

export interface InssFaixaRecord {
  faixa: number;
  salarioMin: number;
  salarioMax: number;
  aliquota: number;
  descricao: string;
}

export interface InssTabelaRecord {
  ano: number;
  teto: number;
  faixas: InssFaixaRecord[];
}

/** Authoritative 2025 employee table — verify against Portaria before annual refresh. */
export const INSS_TABELA_2025: InssTabelaRecord = {
  ano: 2025,
  teto: INSS_TETO_2025,
  faixas: [
    {
      faixa: 1,
      salarioMin: 0,
      salarioMax: 1518,
      aliquota: 0.075,
      descricao: 'Até 1.518,00',
    },
    {
      faixa: 2,
      salarioMin: 1518,
      salarioMax: 2793.88,
      aliquota: 0.09,
      descricao: 'De 1.518,01 a 2.793,88',
    },
    {
      faixa: 3,
      salarioMin: 2793.88,
      salarioMax: 4190.83,
      aliquota: 0.12,
      descricao: 'De 2.793,89 a 4.190,83',
    },
    {
      faixa: 4,
      salarioMin: 4190.83,
      salarioMax: INSS_TETO_2025,
      aliquota: 0.14,
      descricao: 'De 4.190,84 a 8.157,41',
    },
  ],
};

export const INSS_TABELAS: readonly InssTabelaRecord[] = [INSS_TABELA_2025];
