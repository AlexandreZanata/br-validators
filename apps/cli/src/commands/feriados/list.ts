import {
  FERIADOS_DATA_VERSION,
  getAllFeriados,
  type FeriadoNacional,
} from '@br-validators/core/feriados';
import { EXIT } from '../../constants.js';

export type FeriadosListOptions = {
  json: boolean;
  verbose: boolean;
  year?: number;
};

function resolveYear(year?: number): number {
  if (year !== undefined && Number.isInteger(year) && year >= 1900 && year <= 2100) {
    return year;
  }
  return new Date().getUTCFullYear();
}

export function formatFeriadoHuman(feriado: FeriadoNacional): string {
  return `${feriado.data} — ${feriado.nome} (${feriado.tipo})`;
}

export function runFeriadosListCommand(
  options: FeriadosListOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const year = resolveYear(options.year);
  const feriados = getAllFeriados(year);

  if (options.json) {
    const payload: {
      ok: true;
      year: number;
      total: number;
      feriados: readonly FeriadoNacional[];
      capturadoEm?: string;
    } = {
      ok: true,
      year,
      total: feriados.length,
      feriados,
    };
    if (options.verbose) {
      payload.capturadoEm = FERIADOS_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  for (const feriado of feriados) {
    io.stdout.push(formatFeriadoHuman(feriado));
  }
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${FERIADOS_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runFeriadosList(
  options: FeriadosListOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  return runFeriadosListCommand(options, io);
}
