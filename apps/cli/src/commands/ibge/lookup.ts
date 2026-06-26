import {
  lookupMunicipioPorCodigo,
  IBGE_DATA_VERSION,
  type Municipio,
} from '@br-validators/core/ibge';
import type { LookupResult } from '@br-validators/core/lookup';
import { lookupInvalidFormat } from '@br-validators/core/lookup';
import { EXIT } from '../../constants.js';

export type IbgeLookupOptions = {
  json: boolean;
  verbose: boolean;
};

export function normalizeIbgeMunicipioCode(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 7) {
    return null;
  }
  return Number(digits);
}

export function lookupMunicipio(raw: string): LookupResult<Municipio> {
  const codigo = normalizeIbgeMunicipioCode(raw);
  if (codigo === null) {
    return lookupInvalidFormat('Invalid IBGE municipality code. Use 7 digits (e.g. 3550308).');
  }
  return lookupMunicipioPorCodigo(codigo);
}

export function formatMunicipioHuman(municipio: Municipio): string {
  return `${municipio.codigo} — ${municipio.nome} (${municipio.uf})`;
}

function emitLookupFailure(
  result: Extract<LookupResult<never>, { ok: false }>,
  options: IbgeLookupOptions,
  io: { stdout: string[]; stderr: string[] },
): number {
  if (options.json) {
    io.stdout.push(
      JSON.stringify({ ok: false, code: result.code, message: result.message }, null, 2),
    );
    return result.code === 'INVALID_FORMAT' ? EXIT.USAGE : EXIT.INVALID;
  }
  io.stderr.push(result.message);
  return result.code === 'INVALID_FORMAT' ? EXIT.USAGE : EXIT.INVALID;
}

export function runIbgeLookupCommand(
  input: string,
  options: IbgeLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const result = lookupMunicipio(input);
  if (!result.ok) {
    return emitLookupFailure(result, options, io);
  }

  if (options.json) {
    const payload: { ok: true; municipio: Municipio; capturadoEm?: string } = {
      ok: true,
      municipio: result.value,
    };
    if (options.verbose) {
      payload.capturadoEm = IBGE_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatMunicipioHuman(result.value));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${IBGE_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runIbgeLookup(
  value: string | undefined,
  options: IbgeLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!value?.trim()) {
    io.stderr.push('Missing IBGE municipality code. Pass a 7-digit code.');
    return EXIT.USAGE;
  }
  return runIbgeLookupCommand(value.trim(), options, io);
}
