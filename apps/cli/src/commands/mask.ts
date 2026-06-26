import { isMaskableDocumentType, maskRuntime, type UfCode } from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat } from '../output.js';

export type MaskOptions = {
  json: boolean;
  quiet: boolean;
  uf?: string;
  file?: string;
};

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function runMask(
  type: string,
  value: string | undefined,
  options: MaskOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isMaskableDocumentType(type)) {
    io.stderr.push(`Unsupported mask type: ${type}`);
    return EXIT.USAGE;
  }

  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }

  const uf = options.uf?.toUpperCase() as UfCode | undefined;
  const result = maskRuntime(type, input, uf ? { uf } : {});
  return printFormat(result, options, io);
}
