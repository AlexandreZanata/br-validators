import {
  EAN_OFFICIAL_SOURCE_URL,
  detectEanFormat,
  formatEan,
  stripEan,
  validateEan,
  type EanValidationResult,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printStrip } from '../output.js';

export type EanAction = 'validate' | 'detect' | 'format' | 'strip';

export type EanOptions = {
  json: boolean;
  quiet: boolean;
  source: boolean;
  file?: string;
};

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function printEanValidation(
  result: EanValidationResult,
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
    io.stdout.push(`valid: yes (${result.format})`);
    io.stdout.push(`value: ${result.value}`);
    if (options.source) {
      io.stdout.push(`source: ${options.source}`);
    }
    return EXIT.OK;
  }

  io.stderr.push('valid: no');
  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  return EXIT.INVALID;
}

export function printEanDetect(
  format: ReturnType<typeof detectEanFormat>,
  options: { json: boolean; quiet: boolean },
  io: { stdout: string[] } = { stdout: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify({ format: format ?? 'unknown' }, null, 2));
  } else if (!options.quiet) {
    io.stdout.push(format ?? 'unknown');
  }
  return EXIT.OK;
}

export function runEanCommand(
  action: EanAction,
  input: string,
  options: EanOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? EAN_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printEanValidation(validateEan(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'detect':
      return printEanDetect(detectEanFormat(input), { json: options.json, quiet: options.quiet }, io);
    case 'format':
      return printFormat(formatEan(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripEan(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runEan(
  action: EanAction,
  value: string | undefined,
  options: EanOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing EAN value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runEanCommand(action, input, options, io);
}
