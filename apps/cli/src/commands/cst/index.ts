import { EXIT } from '../../constants.js';
import type { FiscalCodeValidationResult } from '@br-validators/core/lookup';
import type { CstTax } from '@br-validators/core/cst';
import {
  CST_DATA_VERSION,
  lookupCstCofinsPorCodigo,
  lookupCstIcmsPorCodigo,
  lookupCstIpiPorCodigo,
  lookupCstPisPorCodigo,
  searchCstCofins,
  searchCstIcms,
  searchCstIpi,
  searchCstPis,
  validateCst,
} from '@br-validators/core/cst';
import type { Cst } from '@br-validators/core/cst';
import type { LookupResult } from '@br-validators/core/lookup';

export type CstCliOptions = {
  json: boolean;
  verbose: boolean;
  tax?: string;
  limit?: number;
};

const CST_TAXES = ['icms', 'ipi', 'pis', 'cofins'] as const;

function parseCstTax(raw: string | undefined): CstTax | null {
  if (raw === undefined) {
    return null;
  }
  const normalized = raw.trim().toLowerCase();
  if ((CST_TAXES as readonly string[]).includes(normalized)) {
    return normalized as CstTax;
  }
  return null;
}

function lookupByTax(tax: CstTax, codigo: string): LookupResult<Cst> {
  switch (tax) {
    case 'icms':
      return lookupCstIcmsPorCodigo(codigo);
    case 'ipi':
      return lookupCstIpiPorCodigo(codigo);
    case 'pis':
      return lookupCstPisPorCodigo(codigo);
    case 'cofins':
      return lookupCstCofinsPorCodigo(codigo);
  }
}

function searchByTax(tax: CstTax, query: string, limit?: number): readonly Cst[] {
  const options = limit !== undefined ? { limit } : undefined;
  switch (tax) {
    case 'icms':
      return searchCstIcms(query, options);
    case 'ipi':
      return searchCstIpi(query, options);
    case 'pis':
      return searchCstPis(query, options);
    case 'cofins':
      return searchCstCofins(query, options);
  }
}

function emitLookupFailure(
  result: Extract<LookupResult<never>, { ok: false }>,
  options: CstCliOptions,
  io: { stdout: string[]; stderr: string[] },
): void {
  if (options.json) {
    io.stdout.push(JSON.stringify({ ok: false, code: result.code, message: result.message }, null, 2));
    return;
  }
  io.stderr.push(result.message);
}

function emitValidateFailure(
  result: Extract<FiscalCodeValidationResult, { ok: false }>,
  options: CstCliOptions,
  io: { stdout: string[]; stderr: string[] },
): void {
  if (options.json) {
    io.stdout.push(JSON.stringify({ ok: false, code: result.code, message: result.message }, null, 2));
    return;
  }
  io.stderr.push(result.message);
}

export function runCstLookup(
  codigo: string | undefined,
  options: CstCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const tax = parseCstTax(options.tax);
  if (tax === null) {
    io.stderr.push('Missing or invalid --tax. Expected: icms | ipi | pis | cofins');
    return EXIT.USAGE;
  }
  const trimmed = codigo?.trim() ?? '';
  if (trimmed.length === 0) {
    io.stderr.push('Missing code. Usage: br-validators cst lookup <codigo> --tax icms');
    return EXIT.USAGE;
  }

  const result = lookupByTax(tax, trimmed);
  if (!result.ok) {
    emitLookupFailure(result, options, io);
    return EXIT.INVALID;
  }

  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        {
          ok: true,
          cst: result.value,
          tax,
          ...(options.verbose ? { capturadoEm: CST_DATA_VERSION.capturadoEm } : {}),
        },
        null,
        2,
      ),
    );
    return EXIT.OK;
  }

  io.stdout.push(`${result.value.codigo} — ${result.value.descricao}`);
  if (options.verbose) {
    io.stdout.push(`tax: ${tax}`);
    io.stdout.push(`capturadoEm: ${CST_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runCstSearch(
  query: string | undefined,
  options: CstCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const tax = parseCstTax(options.tax);
  if (tax === null) {
    io.stderr.push('Missing or invalid --tax. Expected: icms | ipi | pis | cofins');
    return EXIT.USAGE;
  }
  const trimmed = query?.trim() ?? '';
  if (trimmed.length === 0) {
    io.stderr.push('Missing query. Usage: br-validators cst search <query> --tax icms');
    return EXIT.USAGE;
  }

  const rows = searchByTax(tax, trimmed, options.limit);
  if (options.json) {
    io.stdout.push(JSON.stringify({ ok: true, tax, results: rows }, null, 2));
    return EXIT.OK;
  }

  if (rows.length === 0) {
    io.stdout.push('No matches.');
    return EXIT.OK;
  }

  for (const row of rows) {
    io.stdout.push(`${row.codigo} — ${row.descricao}`);
  }
  return EXIT.OK;
}

export function runCstValidate(
  codigo: string | undefined,
  options: CstCliOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const tax = parseCstTax(options.tax);
  if (tax === null) {
    io.stderr.push('Missing or invalid --tax. Expected: icms | ipi | pis | cofins');
    return EXIT.USAGE;
  }
  const trimmed = codigo?.trim() ?? '';
  if (trimmed.length === 0) {
    io.stderr.push('Missing code. Usage: br-validators cst validate <codigo> --tax icms');
    return EXIT.USAGE;
  }

  const result = validateCst(trimmed, { tax });
  if (!result.ok) {
    emitValidateFailure(result, options, io);
    return EXIT.INVALID;
  }

  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        {
          ok: true,
          tax,
          value: result.value,
          description: result.description,
        },
        null,
        2,
      ),
    );
    return EXIT.OK;
  }

  io.stdout.push(`${result.value} — ${result.description}`);
  if (options.verbose) {
    io.stdout.push(`tax: ${tax}`);
  }
  return EXIT.OK;
}
