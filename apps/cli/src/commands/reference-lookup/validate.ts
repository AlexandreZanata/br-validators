import { EXIT } from '../../constants.js';
import type { FiscalCodeValidationResult } from '@br-validators/core/lookup';
import { validateCfop } from '@br-validators/core/cfop';
import { validateNcm } from '@br-validators/core/ncm';

export type ReferenceValidateCommand = 'ncm' | 'cfop';

export const REFERENCE_VALIDATE_COMMANDS = ['ncm', 'cfop'] as const;

export type ReferenceValidateOptions = {
  json: boolean;
  verbose: boolean;
};

const VALIDATORS: Record<ReferenceValidateCommand, (input: string) => FiscalCodeValidationResult> = {
  ncm: validateNcm,
  cfop: validateCfop,
};

const CAPTURED_AT: Record<ReferenceValidateCommand, string> = {
  ncm: 'ncm',
  cfop: 'cfop',
};

function emitFailure(
  result: Extract<FiscalCodeValidationResult, { ok: false }>,
  options: ReferenceValidateOptions,
  io: { stdout: string[]; stderr: string[] },
): void {
  if (options.json) {
    io.stdout.push(JSON.stringify({ ok: false, code: result.code, message: result.message }, null, 2));
    return;
  }
  io.stderr.push(result.message);
}

export function isReferenceValidateCommand(command: string): command is ReferenceValidateCommand {
  return (REFERENCE_VALIDATE_COMMANDS as readonly string[]).includes(command);
}

export function runReferenceValidateCommand(
  command: ReferenceValidateCommand,
  input: string,
  options: ReferenceValidateOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    io.stderr.push(`Missing code. Pass a value to validate for ${command}.`);
    return EXIT.USAGE;
  }

  const result = VALIDATORS[command](trimmed);
  if (!result.ok) {
    emitFailure(result, options, io);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload = {
      ok: true as const,
      value: result.value,
      description: result.description,
      ...(result.format !== undefined ? { format: result.format } : {}),
      ...(options.verbose ? { module: CAPTURED_AT[command] } : {}),
    };
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  const lines = [`${result.value} — ${result.description}`];
  if (result.format !== undefined) {
    lines.push(`format: ${result.format}`);
  }
  io.stdout.push(lines.join('\n'));
  return EXIT.OK;
}

export function runReferenceValidate(
  command: string,
  value: string | undefined,
  options: ReferenceValidateOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isReferenceValidateCommand(command)) {
    io.stderr.push(`Unknown reference validate command: ${command}`);
    return EXIT.USAGE;
  }
  if (!value?.trim()) {
    io.stderr.push(`Missing code. Usage: br-validators ${command} validate <codigo>`);
    return EXIT.USAGE;
  }
  return runReferenceValidateCommand(command, value.trim(), options, io);
}
