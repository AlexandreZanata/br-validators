import { batch, type BatchResult, type UfCode } from '@br-validators/core';
import { EXIT } from '../constants.js';
import { isPlatformDocumentType } from './platform-document-types.js';

export type BatchOptions = {
  json: boolean;
  quiet: boolean;
  uf?: string;
  /** Raw newline-separated values (from --file or stdin). */
  lines?: string;
  limit?: number;
};

export function parseBatchLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function resolveBatchInputs(options: BatchOptions): string[] | null {
  if (options.lines === undefined) {
    return null;
  }
  const parsed = parseBatchLines(options.lines);
  if (options.limit !== undefined && options.limit > 0) {
    return parsed.slice(0, options.limit);
  }
  return parsed;
}

export function printBatch(
  result: BatchResult,
  options: Pick<BatchOptions, 'json' | 'quiet'>,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify(result, null, 2));
    return result.summary.invalid === 0 ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    return result.summary.invalid === 0 ? EXIT.OK : EXIT.INVALID;
  }

  io.stdout.push(`total: ${String(result.summary.total)}`);
  io.stdout.push(`valid: ${String(result.summary.valid)}`);
  io.stdout.push(`invalid: ${String(result.summary.invalid)}`);
  for (const entry of result.valid) {
    io.stdout.push(`ok[${String(entry.index)}]: ${entry.value}`);
  }
  for (const entry of result.invalid) {
    io.stderr.push(`fail[${String(entry.index)}]: ${entry.code} — ${entry.message}`);
  }
  return result.summary.invalid === 0 ? EXIT.OK : EXIT.INVALID;
}

export function runBatch(
  type: string,
  options: BatchOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isPlatformDocumentType(type)) {
    io.stderr.push(`Unsupported batch type: ${type}`);
    return EXIT.USAGE;
  }

  const inputs = resolveBatchInputs(options);
  if (inputs === null) {
    io.stderr.push('Missing input. Pass --file <path> or pipe one value per line on stdin.');
    return EXIT.USAGE;
  }

  if (inputs.length === 0) {
    io.stderr.push('No values to validate.');
    return EXIT.USAGE;
  }

  const uf = options.uf?.toUpperCase() as UfCode | undefined;
  const platformOptions = uf ? { uf } : {};
  const result = batch(inputs, type, platformOptions);
  return printBatch(result, options, io);
}
