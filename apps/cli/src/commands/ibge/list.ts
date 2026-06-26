import {
  getAllEstados,
  getAllMunicipios,
  IBGE_DATA_VERSION,
  type Estado,
  type Municipio,
} from '@br-validators/core/ibge';
import { EXIT } from '../../constants.js';
import { formatMunicipioHuman } from './lookup.js';

export type IbgeListOptions = {
  json: boolean;
  verbose: boolean;
  uf?: string;
  limit?: number;
};

function sliceRows<T>(rows: readonly T[], limit?: number): readonly T[] {
  if (limit === undefined || !Number.isFinite(limit) || limit <= 0) {
    return rows;
  }
  return rows.slice(0, limit);
}

function formatEstadoHuman(estado: Estado): string {
  return `${estado.codigo} — ${estado.sigla} — ${estado.nome}`;
}

export function runIbgeListEstadosCommand(
  options: IbgeListOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const estados = sliceRows(getAllEstados(), options.limit);

  if (options.json) {
    const payload: { ok: true; total: number; estados: readonly Estado[]; capturadoEm?: string } = {
      ok: true,
      total: estados.length,
      estados,
    };
    if (options.verbose) {
      payload.capturadoEm = IBGE_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  for (const estado of estados) {
    io.stdout.push(formatEstadoHuman(estado));
  }
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${IBGE_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runIbgeListMunicipiosCommand(
  options: IbgeListOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const uf = options.uf?.trim().toUpperCase();
  const municipios = sliceRows(getAllMunicipios(uf ? { uf } : undefined), options.limit);

  if (options.json) {
    const payload: {
      ok: true;
      total: number;
      uf?: string;
      municipios: readonly Municipio[];
      capturadoEm?: string;
    } = {
      ok: true,
      total: municipios.length,
      municipios,
      ...(uf ? { uf } : {}),
    };
    if (options.verbose) {
      payload.capturadoEm = IBGE_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  for (const municipio of municipios) {
    io.stdout.push(formatMunicipioHuman(municipio));
  }
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${IBGE_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runIbgeList(
  target: 'estados' | 'municipios',
  options: IbgeListOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (target === 'estados') {
    return runIbgeListEstadosCommand(options, io);
  }
  return runIbgeListMunicipiosCommand(options, io);
}
