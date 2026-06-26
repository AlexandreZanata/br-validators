import {
  calcularIrpfMensal,
  getIrpfTabelaProgressiva,
  IRPF_DATA_VERSION,
  IRPF_DEFAULT_ANO,
  type IrpfFaixaProgressiva,
} from '@br-validators/core/irpf';
import { EXIT } from '../../constants.js';

export type IrpfTabelaOptions = {
  json: boolean;
  verbose: boolean;
  ano?: number;
};

export type IrpfCalcOptions = {
  json: boolean;
  verbose: boolean;
  ano?: number;
};

function resolveAno(ano?: number): number {
  if (ano !== undefined && Number.isInteger(ano) && ano >= 1900 && ano <= 2100) {
    return ano;
  }
  return IRPF_DEFAULT_ANO;
}

export function formatIrpfFaixaHuman(faixa: IrpfFaixaProgressiva): string {
  const aliquotaPct = `${String(faixa.aliquota * 100).replace('.', ',')}%`;
  return `Faixa ${String(faixa.faixa)} — ${faixa.descricao} — ${aliquotaPct} — deduzir R$ ${faixa.parcelaDeduzir.toFixed(2)}`;
}

export function runIrpfTabelaCommand(
  options: IrpfTabelaOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const ano = resolveAno(options.ano);
  const faixas = getIrpfTabelaProgressiva(ano);
  if (faixas === undefined) {
    io.stderr.push(`IRPF progressive table not found for year ${String(ano)}`);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: {
      ok: true;
      ano: number;
      faixas: readonly IrpfFaixaProgressiva[];
      capturadoEm?: string;
    } = {
      ok: true,
      ano,
      faixas,
    };
    if (options.verbose) {
      payload.capturadoEm = IRPF_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  for (const faixa of faixas) {
    io.stdout.push(formatIrpfFaixaHuman(faixa));
  }
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${IRPF_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runIrpfCalcCommand(
  baseRaw: string,
  options: IrpfCalcOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmed = baseRaw.trim().replace(',', '.');
  const baseCalculo = Number(trimmed);
  if (!Number.isFinite(baseCalculo)) {
    io.stderr.push('Invalid base de cálculo. Pass a numeric value (e.g. 3000).');
    return EXIT.USAGE;
  }

  const ano = resolveAno(options.ano);
  const result = calcularIrpfMensal(baseCalculo, ano);
  if (result === undefined) {
    if (getIrpfTabelaProgressiva(ano) === undefined) {
      io.stderr.push(`IRPF progressive table not found for year ${String(ano)}`);
      return EXIT.INVALID;
    }
    io.stderr.push('Base de cálculo must be a non-negative number');
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload = {
      ok: true as const,
      ...result,
      ...(options.verbose ? { capturadoEm: IRPF_DATA_VERSION.capturadoEm } : {}),
    };
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(
    `IRPF ${String(result.ano)} — base R$ ${result.baseCalculo.toFixed(2)} — faixa ${String(result.faixa)} — imposto R$ ${result.imposto.toFixed(2)}`,
  );
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${IRPF_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runIrpfTabela(
  options: IrpfTabelaOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  return runIrpfTabelaCommand(options, io);
}

export function runIrpfCalc(
  base: string | undefined,
  options: IrpfCalcOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!base?.trim()) {
    io.stderr.push('Missing base de cálculo. Usage: br-validators irpf calc <base>');
    return EXIT.USAGE;
  }
  return runIrpfCalcCommand(base.trim(), options, io);
}
