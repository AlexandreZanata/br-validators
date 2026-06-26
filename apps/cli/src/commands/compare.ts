import { compareRuntime, type CompareResult, type UfCode } from '@br-validators/core';
import { EXIT } from '../constants.js';
import { isPlatformDocumentType } from './platform-document-types.js';

export type CompareOptions = {
  json: boolean;
  quiet: boolean;
  uf?: string;
};

type ComparePrintResult = CompareResult | { equal: false; code: string; message: string };

export function printCompare(
  result: ComparePrintResult,
  options: Pick<CompareOptions, 'json' | 'quiet'>,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify(result, null, 2));
    if ('code' in result) {
      return EXIT.USAGE;
    }
    return result.equal ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    if ('code' in result) {
      return EXIT.USAGE;
    }
    return result.equal ? EXIT.OK : EXIT.INVALID;
  }

  if ('code' in result) {
    io.stderr.push(`code: ${result.code}`);
    io.stderr.push(`message: ${result.message}`);
    return EXIT.USAGE;
  }

  io.stdout.push(`equal: ${result.equal ? 'yes' : 'no'}`);
  return result.equal ? EXIT.OK : EXIT.INVALID;
}

export function runCompare(
  type: string,
  valueA: string | undefined,
  valueB: string | undefined,
  options: CompareOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isPlatformDocumentType(type)) {
    io.stderr.push(`Unsupported compare type: ${type}`);
    return EXIT.USAGE;
  }

  if (!valueA || !valueB) {
    io.stderr.push('Missing values. Usage: compare <type> <valueA> <valueB>');
    return EXIT.USAGE;
  }

  const uf = options.uf?.toUpperCase() as UfCode | undefined;
  const platformOptions = uf ? { uf } : {};
  const result = compareRuntime(valueA, valueB, type, platformOptions);
  return printCompare(result, options, io);
}
