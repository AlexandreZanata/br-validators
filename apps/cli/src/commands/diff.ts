import { diff, type DiffResult, type UfCode } from '@br-validators/core';
import { EXIT } from '../constants.js';
import { isPlatformDocumentType } from './platform-document-types.js';

export type DiffOptions = {
  json: boolean;
  quiet: boolean;
  uf?: string;
};

export function printDiff(
  result: DiffResult,
  options: Pick<DiffOptions, 'json' | 'quiet'>,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify(result, null, 2));
    return result.changed ? EXIT.INVALID : EXIT.OK;
  }

  if (options.quiet) {
    return result.changed ? EXIT.INVALID : EXIT.OK;
  }

  io.stdout.push(`changed: ${result.changed ? 'yes' : 'no'}`);
  for (const field of result.fields) {
    io.stdout.push(`field: ${field.field}`);
    io.stdout.push(`  a: ${field.a}`);
    io.stdout.push(`  b: ${field.b}`);
  }
  return result.changed ? EXIT.INVALID : EXIT.OK;
}

export function runDiff(
  type: string,
  valueA: string | undefined,
  valueB: string | undefined,
  options: DiffOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isPlatformDocumentType(type)) {
    io.stderr.push(`Unsupported diff type: ${type}`);
    return EXIT.USAGE;
  }

  if (!valueA || !valueB) {
    io.stderr.push('Missing values. Usage: diff <type> <valueA> <valueB>');
    return EXIT.USAGE;
  }

  const uf = options.uf?.toUpperCase() as UfCode | undefined;
  const platformOptions = uf ? { uf } : {};
  const result = diff(valueA, valueB, type, platformOptions);
  return printDiff(result, options, io);
}
