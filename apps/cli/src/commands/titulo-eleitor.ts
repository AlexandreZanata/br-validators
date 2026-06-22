import {
  TITULO_ELEITOR_OFFICIAL_SOURCE_URL,
  formatTituloEleitor,
  stripTituloEleitor,
  validateTituloEleitor,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printStrip, printValidation } from '../output.js';

export type TituloEleitorAction = 'validate' | 'format' | 'strip';

export type TituloEleitorOptions = {
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

export function runTituloEleitorCommand(
  action: TituloEleitorAction,
  input: string,
  options: TituloEleitorOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? TITULO_ELEITOR_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validateTituloEleitor(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatTituloEleitor(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripTituloEleitor(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runTituloEleitor(
  action: TituloEleitorAction,
  value: string | undefined,
  options: TituloEleitorOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing Título de Eleitor value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runTituloEleitorCommand(action, input, options, io);
}
