import { EXIT } from '../../constants.js';
import type { LookupResult } from '@br-validators/core/lookup';
import {
  isReferenceLookupCommand,
  REFERENCE_LOOKUP_MODULES,
  type ReferenceLookupCommand,
} from './registry.js';

export type ReferenceLookupOptions = {
  json: boolean;
  verbose: boolean;
};

function emitLookupFailure(
  result: Extract<LookupResult<never>, { ok: false }>,
  options: ReferenceLookupOptions,
  io: { stdout: string[]; stderr: string[] },
): void {
  if (options.json) {
    io.stdout.push(
      JSON.stringify({ ok: false, code: result.code, message: result.message }, null, 2),
    );
    return;
  }
  io.stderr.push(result.message);
}

export function runReferenceLookupCommand(
  command: ReferenceLookupCommand,
  input: string,
  options: ReferenceLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const module = REFERENCE_LOOKUP_MODULES[command];
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    io.stderr.push(`Missing code. Pass a lookup value for ${command}.`);
    return EXIT.USAGE;
  }

  const result = module.lookup(trimmed);
  if (!result.ok) {
    emitLookupFailure(result, options, io);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload = {
      ok: true as const,
      [module.resultKey]: result.value,
      ...(options.verbose ? { capturadoEm: module.capturadoEm } : {}),
    };
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(module.formatHuman(result.value));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${module.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runReferenceLookup(
  command: string,
  value: string | undefined,
  options: ReferenceLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isReferenceLookupCommand(command)) {
    io.stderr.push(`Unknown reference lookup command: ${command}`);
    return EXIT.USAGE;
  }
  if (!value?.trim()) {
    io.stderr.push(`Missing code. Usage: br-validators ${command} lookup <codigo>`);
    return EXIT.USAGE;
  }
  return runReferenceLookupCommand(command, value.trim(), options, io);
}
