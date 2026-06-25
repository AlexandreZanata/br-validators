import {
  CNIS_OFFICIAL_VALIDATION_URL,
  formatNit,
  stripNit,
  validateNit,
  type NitValidationResult,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printStrip } from '../output.js';

export type CnisAction = 'validate' | 'format' | 'strip';

export type CnisOptions = {
  json: boolean;
  quiet: boolean;
  source: boolean;
  issuer?: 'inss' | 'caixa';
  tipo?: 'nit' | 'pis' | 'nis';
  file?: string;
};

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function printNitValidation(
  result: NitValidationResult,
  options: { json: boolean; quiet: boolean; source?: string },
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        result.ok
          ? {
              ok: true,
              value: result.value,
              format: result.format,
              issuer: result.issuer,
              tipo: result.tipo,
              ...(options.source ? { source: options.source } : {}),
            }
          : {
              ok: false,
              code: result.code,
              message: result.message,
            },
        null,
        2,
      ),
    );
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (result.ok) {
    io.stdout.push(`ok: true`);
    io.stdout.push(`value: ${result.value}`);
    io.stdout.push(`issuer: ${result.issuer}`);
    io.stdout.push(`tipo: ${result.tipo}`);
    if (options.source) {
      io.stdout.push(`source: ${options.source}`);
    }
    return EXIT.OK;
  }

  io.stdout.push(`ok: false`);
  io.stdout.push(`code: ${result.code}`);
  io.stdout.push(`message: ${result.message}`);
  return EXIT.INVALID;
}

export function runCnisCommand(
  action: CnisAction,
  input: string,
  options: CnisOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? CNIS_OFFICIAL_VALIDATION_URL : undefined;
  const validateOptions =
    options.issuer !== undefined || options.tipo !== undefined
      ? { issuer: options.issuer, tipo: options.tipo }
      : undefined;

  switch (action) {
    case 'validate':
      return printNitValidation(validateNit(input, validateOptions), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatNit(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripNit(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runCnis(
  action: CnisAction,
  value: string | undefined,
  options: CnisOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing NIT value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runCnisCommand(action, input, options, io);
}
