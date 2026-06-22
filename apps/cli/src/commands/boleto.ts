import {
  BOLETO_OFFICIAL_SOURCE_URL,
  convertCodigoBarrasToLinhaDigitavel,
  convertLinhaToCodigoBarras,
  detectBoletoInputKind,
  formatBoleto,
  stripCodigoBarras,
  stripLinhaDigitavel,
  validateBoleto,
  type BoletoInputKind,
  type BoletoValidationResult,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat } from '../output.js';

export type BoletoAction = 'validate' | 'detect' | 'convert' | 'format' | 'strip';

export type BoletoConvertDirection = 'linha-to-barras' | 'barras-to-linha';

export type BoletoOptions = {
  json: boolean;
  quiet: boolean;
  source: boolean;
  kind?: BoletoInputKind;
  file?: string;
};

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

function boletoSuccessMeta(result: Extract<BoletoValidationResult, { ok: true }>): Record<string, string> {
  if (result.format === 'arrecadacao') {
    return { segment: result.segment, valueType: result.valueType };
  }
  return { situacao: result.situacao };
}

export function printBoletoValidation(
  result: BoletoValidationResult,
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
              inputKind: result.inputKind,
              format: result.format,
              ...boletoSuccessMeta(result),
              ...(options.source ? { source: options.source } : {}),
            }
          : {
              ok: false,
              code: result.code,
              message: result.message,
              ...(result.inputKind ? { inputKind: result.inputKind } : {}),
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
    io.stdout.push(`valid: yes (${result.inputKind})`);
    io.stdout.push(`value: ${result.value}`);
    io.stdout.push(`format: ${result.format}`);
    if (result.format === 'arrecadacao') {
      io.stdout.push(`segment: ${result.segment}`);
      io.stdout.push(`valueType: ${result.valueType}`);
    } else {
      io.stdout.push(`situacao: ${result.situacao}`);
    }
    if (options.source) {
      io.stdout.push(`source: ${options.source}`);
    }
    return EXIT.OK;
  }

  io.stderr.push('valid: no');
  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  if (result.inputKind) {
    io.stderr.push(`inputKind: ${result.inputKind}`);
  }
  return EXIT.INVALID;
}

export function printBoletoDetect(
  inputKind: ReturnType<typeof detectBoletoInputKind>,
  options: { json: boolean; quiet: boolean },
  io: { stdout: string[] } = { stdout: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify({ inputKind }, null, 2));
  } else if (!options.quiet) {
    io.stdout.push(inputKind);
  }
  return EXIT.OK;
}

export function printBoletoConvert(
  result: BoletoValidationResult,
  options: { json: boolean; quiet: boolean },
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        result.ok
          ? { ok: true, value: result.value, inputKind: result.inputKind, format: result.format }
          : { ok: false, code: result.code, message: result.message, ...(result.inputKind ? { inputKind: result.inputKind } : {}) },
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
    io.stdout.push(result.value);
    return EXIT.OK;
  }

  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  return EXIT.INVALID;
}

export function printBoletoFormat(
  input: string,
  options: { json: boolean; quiet: boolean },
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  return printFormat(formatBoleto(input), { json: options.json, quiet: options.quiet }, io);
}

export function printBoletoStrip(
  input: string,
  options: { json: boolean; quiet: boolean },
  io: { stdout: string[] } = { stdout: [] },
): number {
  const kind = detectBoletoInputKind(input);
  const stripped = kind === 'codigo-barras' ? stripCodigoBarras(input) : stripLinhaDigitavel(input);
  if (options.json) {
    io.stdout.push(JSON.stringify({ stripped, inputKind: kind }, null, 2));
  } else if (!options.quiet) {
    io.stdout.push(stripped);
  }
  return EXIT.OK;
}

export function runBoletoCommand(
  action: BoletoAction,
  input: string,
  options: BoletoOptions,
  direction?: BoletoConvertDirection,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? BOLETO_OFFICIAL_SOURCE_URL : undefined;
  const validateOptions = options.kind ? { kind: options.kind } : undefined;

  switch (action) {
    case 'validate':
      return printBoletoValidation(validateBoleto(input, validateOptions), { json: options.json, quiet: options.quiet, source }, io);
    case 'detect':
      return printBoletoDetect(detectBoletoInputKind(input), { json: options.json, quiet: options.quiet }, io);
    case 'convert': {
      if (direction === 'linha-to-barras') {
        return printBoletoConvert(convertLinhaToCodigoBarras(input), { json: options.json, quiet: options.quiet }, io);
      }
      if (direction === 'barras-to-linha') {
        return printBoletoConvert(convertCodigoBarrasToLinhaDigitavel(input), { json: options.json, quiet: options.quiet }, io);
      }
      io.stderr.push('Missing convert direction. Use linha-to-barras or barras-to-linha.');
      return EXIT.USAGE;
    }
    case 'format':
      return printBoletoFormat(input, { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printBoletoStrip(input, { json: options.json, quiet: options.quiet }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runBoleto(
  action: BoletoAction,
  value: string | undefined,
  options: BoletoOptions,
  direction?: BoletoConvertDirection,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing boleto value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runBoletoCommand(action, input, options, direction, io);
}
