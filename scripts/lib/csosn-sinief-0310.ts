/**
 * CONFAZ Ajuste SINIEF 03/10 — CSOSN codes for Simples Nacional (static reference).
 * @see https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/a03_10
 */

export const CSOSN_SINIEF_0310_URL =
  'https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/a03_10';

export type CsosnSiniefRecord = {
  codigo: string;
  descricao: string;
};

export const CSOSN_SINIEF_0310: readonly CsosnSiniefRecord[] = [
  {
    codigo: '101',
    descricao: 'Tributada pelo Simples Nacional com permissão de crédito',
  },
  {
    codigo: '102',
    descricao: 'Tributada pelo Simples Nacional sem permissão de crédito',
  },
  {
    codigo: '103',
    descricao: 'Isenção do ICMS no Simples Nacional para faixa de receita bruta',
  },
  {
    codigo: '201',
    descricao:
      'Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por substituição tributária',
  },
  {
    codigo: '202',
    descricao:
      'Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por substituição tributária',
  },
  {
    codigo: '203',
    descricao:
      'Isenção do ICMS no Simples Nacional para faixa de receita bruta e com cobrança do ICMS por substituição tributária',
  },
  {
    codigo: '300',
    descricao: 'Imune',
  },
  {
    codigo: '400',
    descricao: 'Não tributada pelo Simples Nacional',
  },
  {
    codigo: '500',
    descricao:
      'ICMS cobrado anteriormente por substituição tributária (substituído) ou por antecipação',
  },
  {
    codigo: '900',
    descricao: 'Outros',
  },
] as const;

export const CSOSN_SINIEF_0310_COUNT = CSOSN_SINIEF_0310.length;
