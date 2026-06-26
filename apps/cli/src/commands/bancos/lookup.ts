import {
  BANCOS_DATA_VERSION,
  lookupBancoPorCodigo,
  lookupBancoPorIspb,
  type Banco,
} from '@br-validators/core/bancos';
import type { LookupResult } from '@br-validators/core/lookup';
import { lookupInvalidFormat } from '@br-validators/core/lookup';
import { EXIT } from '../../constants.js';

export type BancosLookupOptions = {
  json: boolean;
  verbose: boolean;
};

export function normalizeBancosLookupInput(
  raw: string,
): { kind: 'codigo'; value: string } | { kind: 'ispb'; value: string } | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 8) {
    return { kind: 'ispb', value: digits.padStart(8, '0') };
  }
  if (digits.length >= 1 && digits.length <= 3) {
    return { kind: 'codigo', value: digits.padStart(3, '0').slice(-3) };
  }
  return null;
}

export function lookupBanco(raw: string): LookupResult<Banco> {
  const normalized = normalizeBancosLookupInput(raw);
  if (!normalized) {
    return lookupInvalidFormat(
      'Invalid bank code or ISPB. Use 3-digit COMPE (e.g. 001) or 8-digit ISPB.',
    );
  }
  return normalized.kind === 'ispb'
    ? lookupBancoPorIspb(normalized.value)
    : lookupBancoPorCodigo(normalized.value);
}

export function formatBancoHuman(banco: Banco): string {
  return `${banco.codigo} — ${banco.nome} (ISPB ${banco.ispb})`;
}

export function runBancosLookupCommand(
  input: string,
  options: BancosLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const result = lookupBanco(input);
  if (!result.ok) {
    if (options.json) {
      io.stdout.push(
        JSON.stringify({ ok: false, code: result.code, message: result.message }, null, 2),
      );
    } else {
      io.stderr.push(result.message);
    }
    return normalizeBancosLookupInput(input) === null ? EXIT.USAGE : EXIT.INVALID;
  }

  if (options.json) {
    const payload: { ok: true; banco: Banco; capturadoEm?: string } = { ok: true, banco: result.value };
    if (options.verbose) {
      payload.capturadoEm = BANCOS_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatBancoHuman(result.value));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${BANCOS_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runBancosLookup(
  value: string | undefined,
  options: BancosLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!value?.trim()) {
    io.stderr.push('Missing bank code or ISPB. Pass COMPE (001) or ISPB (8 digits).');
    return EXIT.USAGE;
  }
  return runBancosLookupCommand(value.trim(), options, io);
}
