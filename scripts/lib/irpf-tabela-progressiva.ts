/**
 * IRPF monthly progressive table — RFB published brackets.
 * @see https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/tabela-progressiva-mensal
 */

export const IRPF_TABELAS_URL =
  'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas';

export const IRPF_TABELA_PROGRESSIVA_MENSAL_URL =
  'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/tabela-progressiva-mensal';

export const LEI_7713_URL = 'https://www.planalto.gov.br/ccivil_03/leis/l7713.htm';

export const IRPF_DEFAULT_ANO = 2025;

export const IRPF_FAIXAS_POR_TABELA = 5;

export interface IrpfFaixaRecord {
  faixa: number;
  baseCalculoMin: number;
  baseCalculoMax: number | null;
  aliquota: number;
  parcelaDeduzir: number;
  descricao: string;
}

export interface IrpfTabelaRecord {
  ano: number;
  faixas: IrpfFaixaRecord[];
}

/** Authoritative 2025 monthly table — verify against RFB before annual refresh. */
export const IRPF_TABELA_2025: IrpfTabelaRecord = {
  ano: 2025,
  faixas: [
    {
      faixa: 1,
      baseCalculoMin: 0,
      baseCalculoMax: 2259.2,
      aliquota: 0,
      parcelaDeduzir: 0,
      descricao: 'Até 2.259,20',
    },
    {
      faixa: 2,
      baseCalculoMin: 2259.21,
      baseCalculoMax: 2826.65,
      aliquota: 0.075,
      parcelaDeduzir: 169.44,
      descricao: 'De 2.259,21 a 2.826,65',
    },
    {
      faixa: 3,
      baseCalculoMin: 2826.66,
      baseCalculoMax: 3751.05,
      aliquota: 0.15,
      parcelaDeduzir: 381.44,
      descricao: 'De 2.826,66 a 3.751,05',
    },
    {
      faixa: 4,
      baseCalculoMin: 3751.06,
      baseCalculoMax: 4664.68,
      aliquota: 0.225,
      parcelaDeduzir: 662.77,
      descricao: 'De 3.751,06 a 4.664,68',
    },
    {
      faixa: 5,
      baseCalculoMin: 4664.69,
      baseCalculoMax: null,
      aliquota: 0.275,
      parcelaDeduzir: 896,
      descricao: 'Acima de 4.664,68',
    },
  ],
};

export const IRPF_TABELAS: readonly IrpfTabelaRecord[] = [IRPF_TABELA_2025];
