import {
  calcularInssMensal,
  getInssTabelaContribuicao,
  INSS_DATA_VERSION,
  INSS_DEFAULT_ANO,
  type InssFaixaContribuicao,
} from '@br-validators/core/inss';
import { EXIT } from '../../constants.js';

export type InssTabelaOptions = {
  json: boolean;
  verbose: boolean;
  ano?: number;
};

export type InssCalcOptions = {
  json: boolean;
  verbose: boolean;
  ano?: number;
};

function resolveAno(ano?: number): number {
  if (ano !== undefined && Number.isInteger(ano) && ano >= 1900 && ano <= 2100) {
    return ano;
  }
  return INSS_DEFAULT_ANO;
}

export function formatInssFaixaHuman(faixa: InssFaixaContribuicao): string {
  const aliquotaPct = `${String(faixa.aliquota * 100).replace('.', ',')}%`;
  return `Faixa ${String(faixa.faixa)} — ${faixa.descricao} — ${aliquotaPct}`;
}

export function runInssTabelaCommand(
  options: InssTabelaOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const ano = resolveAno(options.ano);
  const tabela = getInssTabelaContribuicao(ano);
  if (tabela === undefined) {
    io.stderr.push(`INSS contribution table not found for year ${String(ano)}`);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: {
      ok: true;
      ano: number;
      teto: number;
      faixas: readonly InssFaixaContribuicao[];
      capturadoEm?: string;
    } = {
      ok: true,
      ano,
      teto: tabela.teto,
      faixas: tabela.faixas,
    };
    if (options.verbose) {
      payload.capturadoEm = INSS_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(`Teto: R$ ${tabela.teto.toFixed(2)}`);
  for (const faixa of tabela.faixas) {
    io.stdout.push(formatInssFaixaHuman(faixa));
  }
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${INSS_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runInssCalcCommand(
  salarioRaw: string,
  options: InssCalcOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmed = salarioRaw.trim().replace(',', '.');
  const salarioContribuicao = Number(trimmed);
  if (!Number.isFinite(salarioContribuicao)) {
    io.stderr.push('Invalid salário de contribuição. Pass a numeric value (e.g. 3000).');
    return EXIT.USAGE;
  }

  const ano = resolveAno(options.ano);
  const result = calcularInssMensal(salarioContribuicao, ano);
  if (result === undefined) {
    if (getInssTabelaContribuicao(ano) === undefined) {
      io.stderr.push(`INSS contribution table not found for year ${String(ano)}`);
      return EXIT.INVALID;
    }
    io.stderr.push('Salário de contribuição must be a non-negative number');
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload = {
      ok: true as const,
      ...result,
      ...(options.verbose ? { capturadoEm: INSS_DATA_VERSION.capturadoEm } : {}),
    };
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(
    `INSS ${String(result.ano)} — salário R$ ${result.salarioContribuicao.toFixed(2)} — faixa ${String(result.faixa)} — contribuição R$ ${result.contribuicao.toFixed(2)}`,
  );
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${INSS_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runInssTabela(
  options: InssTabelaOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  return runInssTabelaCommand(options, io);
}

export function runInssCalc(
  salario: string | undefined,
  options: InssCalcOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!salario?.trim()) {
    io.stderr.push('Missing salário de contribuição. Usage: br-validators inss calc <salario>');
    return EXIT.USAGE;
  }
  return runInssCalcCommand(salario.trim(), options, io);
}
