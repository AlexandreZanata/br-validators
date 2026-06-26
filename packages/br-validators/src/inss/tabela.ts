/**
 * INSS employee contribution progressive table — Portaria MPS/MF Anexo II (offline embed).
 * @see https://www.gov.br/inss/pt-br/noticias/confira-como-ficaram-as-aliquotas-de-contribuicao-ao-inss
 */

import tabelaData from './data/tabela-contribuicao.json';
import { INSS_DEFAULT_ANO } from './constants.js';
import type {
  InssCalculoMensal,
  InssFaixaContribuicao,
  InssFaixaLookup,
  InssTabelaContribuicao,
} from './types.js';

interface TabelaEmbed {
  tabelas: InssTabelaContribuicao[];
}

const embed = tabelaData as TabelaEmbed;
const tabelas: readonly InssTabelaContribuicao[] = embed.tabelas;

const tabelaPorAno = new Map(tabelas.map((entry) => [entry.ano, entry]));

function resolveAno(ano?: number): number {
  return ano ?? INSS_DEFAULT_ANO;
}

function getTabela(ano?: number): InssTabelaContribuicao | undefined {
  return tabelaPorAno.get(resolveAno(ano));
}

function isValidSalario(salarioContribuicao: number): boolean {
  return Number.isFinite(salarioContribuicao) && salarioContribuicao >= 0;
}

function resolveFaixaIndex(faixas: readonly InssFaixaContribuicao[], salarioEfetivo: number): number {
  for (let index = 0; index < faixas.length - 1; index += 1) {
    if (salarioEfetivo <= faixas[index].salarioMax) {
      return index;
    }
  }
  return faixas.length - 1;
}

function resolveSalarioEfetivo(salarioContribuicao: number, teto: number): number {
  return Math.min(salarioContribuicao, teto);
}

function somarContribuicaoProgressiva(
  salarioEfetivo: number,
  faixas: readonly InssFaixaContribuicao[],
): number {
  let total = 0;
  for (const faixa of faixas) {
    const tetoFaixa = Math.min(faixa.salarioMax, salarioEfetivo);
    if (salarioEfetivo > faixa.salarioMin) {
      const valorNaFaixa = tetoFaixa - faixa.salarioMin;
      if (valorNaFaixa > 0) {
        total += valorNaFaixa * faixa.aliquota;
      }
    }
  }
  return total;
}

export function roundInssCentavos(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Returns embedded tax years with contribution tables. */
export function getInssAnosDisponiveis(): readonly number[] {
  return tabelas.map((entry) => entry.ano);
}

export function getInssTabelaContribuicao(ano?: number): InssTabelaContribuicao | undefined {
  return getTabela(ano);
}

export function getInssFaixaPorSalario(
  salarioContribuicao: number,
  ano?: number,
): InssFaixaLookup | undefined {
  if (!isValidSalario(salarioContribuicao)) {
    return undefined;
  }

  const tabela = getTabela(ano);
  if (tabela === undefined) {
    return undefined;
  }

  const salarioEfetivo = resolveSalarioEfetivo(salarioContribuicao, tabela.teto);
  const faixa = tabela.faixas[resolveFaixaIndex(tabela.faixas, salarioEfetivo)];
  return { ...faixa, ano: tabela.ano, teto: tabela.teto };
}

export function calcularInssMensal(
  salarioContribuicao: number,
  ano?: number,
): InssCalculoMensal | undefined {
  if (!isValidSalario(salarioContribuicao)) {
    return undefined;
  }

  const tabela = getTabela(ano);
  if (tabela === undefined) {
    return undefined;
  }

  const salarioEfetivo = resolveSalarioEfetivo(salarioContribuicao, tabela.teto);
  const faixa = tabela.faixas[resolveFaixaIndex(tabela.faixas, salarioEfetivo)];
  const contribuicao = roundInssCentavos(
    somarContribuicaoProgressiva(salarioEfetivo, tabela.faixas),
  );

  return {
    ano: tabela.ano,
    salarioContribuicao,
    salarioEfetivo,
    faixa: faixa.faixa,
    aliquota: faixa.aliquota,
    contribuicao,
    teto: tabela.teto,
  };
}
