import {
  getCufPorCodigo,
  lookupCufPorCodigo,
  NFE_CUF_DATA_VERSION,
} from '@br-validators/core/nfe-cuf';
import { EXIT } from '../../constants.js';

export type NfeCufLookupOptions = {
  json: boolean;
  verbose: boolean;
};

export function formatNfeCufHuman(row: { codigo: string; uf: string; nome: string; codigoIbge: string }): string {
  return `cUF ${row.codigo} — ${row.uf} — ${row.nome} (IBGE UF ${row.codigoIbge})`;
}

export function runNfeCufLookupCommand(
  input: string,
  options: NfeCufLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    io.stderr.push('Invalid cUF code. Use 2 digits (e.g. 35).');
    return EXIT.USAGE;
  }

  const result = lookupCufPorCodigo(trimmed);
  if (!result.ok) {
    if (options.json) {
      io.stdout.push(JSON.stringify({ ok: false, code: result.code, message: result.message }, null, 2));
      return EXIT.INVALID;
    }
    io.stderr.push(result.message);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: {
      ok: true;
      cuf: NonNullable<ReturnType<typeof getCufPorCodigo>>;
      capturadoEm?: string;
    } = {
      ok: true,
      cuf: result.value,
    };
    if (options.verbose) {
      payload.capturadoEm = NFE_CUF_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatNfeCufHuman(result.value));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${NFE_CUF_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runNfeCufLookup(
  value: string | undefined,
  options: NfeCufLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!value?.trim()) {
    io.stderr.push('Missing cUF code. Usage: br-validators nfe-cuf lookup <code>');
    return EXIT.USAGE;
  }
  return runNfeCufLookupCommand(value.trim(), options, io);
}
