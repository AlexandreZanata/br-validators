/**
 * IRPF monthly progressive table — RFB published brackets (offline embed).
 * @see https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/tabela-progressiva-mensal
 */

import tabelaData from './data/tabela-progressiva.json';
import { IRPF_DEFAULT_ANO } from './constants.js';
import type {
  IrpfCalculoMensal,
  IrpfFaixaLookup,
  IrpfFaixaProgressiva,
  IrpfTabelaProgressiva,
} from './types.js';

interface TabelaEmbed {
  tabelas: IrpfTabelaProgressiva[];
}

const embed = tabelaData as TabelaEmbed;
const tabelas: readonly IrpfTabelaProgressiva[] = embed.tabelas;

const tabelaPorAno = new Map(tabelas.map((entry) => [entry.ano, entry]));

function resolveAno(ano?: number): number {
  return ano ?? IRPF_DEFAULT_ANO;
}

function getTabela(ano?: number): IrpfTabelaProgressiva | undefined {
  return tabelaPorAno.get(resolveAno(ano));
}

function isValidBaseCalculo(baseCalculo: number): boolean {
  return Number.isFinite(baseCalculo) && baseCalculo >= 0;
}

function resolveFaixaIndex(faixas: readonly IrpfFaixaProgressiva[], baseCalculo: number): number {
  let selected = 0;
  for (let index = 0; index < faixas.length; index += 1) {
    if (baseCalculo >= faixas[index].baseCalculoMin) {
      selected = index;
    }
  }
  return selected;
}

export function roundIrpfCentavos(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Returns embedded tax years with progressive tables. */
export function getIrpfAnosDisponiveis(): readonly number[] {
  return tabelas.map((entry) => entry.ano);
}

export function getIrpfTabelaProgressiva(ano?: number): readonly IrpfFaixaProgressiva[] | undefined {
  return getTabela(ano)?.faixas;
}

export function getIrpfFaixaPorValor(
  baseCalculo: number,
  ano?: number,
): IrpfFaixaLookup | undefined {
  if (!isValidBaseCalculo(baseCalculo)) {
    return undefined;
  }

  const tabela = getTabela(ano);
  if (tabela === undefined) {
    return undefined;
  }

  const faixa = tabela.faixas[resolveFaixaIndex(tabela.faixas, baseCalculo)];
  return { ...faixa, ano: tabela.ano };
}

export function calcularIrpfMensal(
  baseCalculo: number,
  ano?: number,
): IrpfCalculoMensal | undefined {
  const faixa = getIrpfFaixaPorValor(baseCalculo, ano);
  if (faixa === undefined) {
    return undefined;
  }

  const impostoBruto = baseCalculo * faixa.aliquota - faixa.parcelaDeduzir;
  const imposto = roundIrpfCentavos(Math.max(0, impostoBruto));

  return {
    ano: faixa.ano,
    baseCalculo,
    faixa: faixa.faixa,
    aliquota: faixa.aliquota,
    parcelaDeduzir: faixa.parcelaDeduzir,
    imposto,
  };
}
