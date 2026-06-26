import {
  getIssMunicipalPorIbge,
  getIssMunicipalPorUfMunicipio,
  ISS_MUNICIPAL_DATA_VERSION,
  ISS_MUNICIPAL_ESTIMATION_WARNING,
  searchIssMunicipal,
  type IssMunicipalResult,
} from '@br-validators/core/iss-municipal';
import { EXIT } from '../../constants.js';

export type IssMunicipalCliOptions = {
  json: boolean;
  verbose: boolean;
};

export function formatIssMunicipalHuman(row: IssMunicipalResult): string {
  return `${row.nome}/${row.uf} — ISS ${String(row.aliquotaMin)}%–${String(row.aliquotaMax)}%`;
}

function emitDisclaimer(
  options: IssMunicipalCliOptions,
  io: { stdout: string[]; stderr: string[] },
): void {
  if (options.json) {
    return;
  }
  io.stderr.push(ISS_MUNICIPAL_ESTIMATION_WARNING);
}

export function runIssMunicipalLookup(
  codigo: string | undefined,
  options: IssMunicipalCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmed = codigo?.trim() ?? '';
  if (trimmed.length === 0) {
    io.stderr.push('Missing IBGE code. Usage: br-validators iss-municipal lookup <codigoIbge>');
    return EXIT.USAGE;
  }

  const result = getIssMunicipalPorIbge(trimmed);
  if (result === undefined) {
    io.stderr.push(`ISS municipal row not found for IBGE code ${trimmed}`);
    return EXIT.INVALID;
  }

  emitDisclaimer(options, io);

  if (options.json) {
    const payload: { ok: true; iss: IssMunicipalResult; capturadoEm?: string } = {
      ok: true,
      iss: result,
    };
    if (options.verbose) {
      payload.capturadoEm = ISS_MUNICIPAL_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatIssMunicipalHuman(result));
  io.stdout.push(`warning: ${result.warning}`);
  if (options.verbose) {
    io.stdout.push(`leiUrl: ${result.leiUrl}`);
    io.stdout.push(`estimativa: ${String(result.estimativa)}`);
    io.stdout.push(`capturadoEm: ${ISS_MUNICIPAL_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runIssMunicipalSearch(
  query: string | undefined,
  options: IssMunicipalCliOptions & { limit?: number },
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmed = query?.trim() ?? '';
  if (trimmed.length === 0) {
    io.stderr.push('Missing query. Usage: br-validators iss-municipal search <query>');
    return EXIT.USAGE;
  }

  const rows = searchIssMunicipal(trimmed, { limit: options.limit });
  emitDisclaimer(options, io);

  if (options.json) {
    io.stdout.push(JSON.stringify({ ok: true, results: rows }, null, 2));
    return EXIT.OK;
  }

  if (rows.length === 0) {
    io.stdout.push('No ISS municipal rows matched.');
    return EXIT.OK;
  }

  for (const row of rows) {
    io.stdout.push(formatIssMunicipalHuman(row));
  }
  return EXIT.OK;
}

export function runIssMunicipalResolve(
  uf: string | undefined,
  nome: string | undefined,
  options: IssMunicipalCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const normalizedUf = uf?.trim() ?? '';
  const normalizedNome = nome?.trim() ?? '';
  if (normalizedUf.length === 0 || normalizedNome.length === 0) {
    io.stderr.push('Missing UF or municipality name. Usage: br-validators iss-municipal resolve <uf> <nome>');
    return EXIT.USAGE;
  }

  const result = getIssMunicipalPorUfMunicipio(normalizedUf, normalizedNome);
  if (result === undefined) {
    io.stderr.push(`ISS municipal row not found for ${normalizedNome}/${normalizedUf}`);
    return EXIT.INVALID;
  }

  return runIssMunicipalLookup(String(result.codigoIbge), options, io);
}
