import { searchCbo, type Cbo } from '@br-validators/core/cbo';
import { searchCnaes, type Cnae } from '@br-validators/core/cnaes';
import { searchCfop, type Cfop } from '@br-validators/core/cfop';
import { searchCsosn, type Csosn } from '@br-validators/core/csosn';
import { searchNcm, type Ncm } from '@br-validators/core/ncm';
import { EXIT } from '../../constants.js';
import {
  isReferenceSearchCommand,
  REFERENCE_LOOKUP_MODULES,
  type ReferenceSearchCommand,
} from './registry.js';

export type ReferenceSearchOptions = {
  json: boolean;
  verbose: boolean;
  limit?: number;
};

type SearchResult = Cnae | Cfop | Csosn | Ncm | Cbo;

function runSearch(
  command: ReferenceSearchCommand,
  query: string,
  limit: number,
): readonly SearchResult[] {
  switch (command) {
    case 'cnae':
      return searchCnaes(query, { limit });
    case 'cfop':
      return searchCfop(query, { limit });
    case 'csosn':
      return searchCsosn(query, { limit });
    case 'ncm':
      return searchNcm(query, { limit });
    case 'cbo':
      return searchCbo(query, { limit });
  }
}

function formatSearchHuman(command: ReferenceSearchCommand, results: readonly SearchResult[]): string[] {
  const module = REFERENCE_LOOKUP_MODULES[command];
  return results.map((row) => module.formatHuman(row));
}

export function runReferenceSearchCommand(
  command: ReferenceSearchCommand,
  query: string,
  options: ReferenceSearchOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    io.stderr.push(`Missing search query. Pass a description fragment for ${command}.`);
    return EXIT.USAGE;
  }

  const limit = options.limit !== undefined && options.limit > 0 ? options.limit : 10;
  const results = runSearch(command, trimmed, limit);
  const module = REFERENCE_LOOKUP_MODULES[command];
  const resultKey = `${module.resultKey}s`;

  if (options.json) {
    const payload = {
      ok: true as const,
      query: trimmed,
      total: results.length,
      [resultKey]: results,
      ...(options.verbose ? { capturadoEm: module.capturadoEm } : {}),
    };
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  if (results.length === 0) {
    io.stderr.push(`No matches for: ${trimmed}`);
    return EXIT.INVALID;
  }

  for (const line of formatSearchHuman(command, results)) {
    io.stdout.push(line);
  }
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${module.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runReferenceSearch(
  command: string,
  query: string | undefined,
  options: ReferenceSearchOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!isReferenceSearchCommand(command)) {
    io.stderr.push(`Unknown reference search command: ${command}`);
    return EXIT.USAGE;
  }
  if (!query?.trim()) {
    io.stderr.push(`Missing query. Usage: br-validators ${command} search <query>`);
    return EXIT.USAGE;
  }
  return runReferenceSearchCommand(command, query.trim(), options, io);
}
