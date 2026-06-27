import { describe, expect, it } from 'vitest';
import {
  CNAES_GOLDEN_WEB_DESIGN,
  CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS,
} from '@br-validators/core/cnaes';
import { CFOP_GOLDEN_COMPRA_COMERCIALIZACAO } from '@br-validators/core/cfop';
import { CSOSN_GOLDEN_SEM_CREDITO } from '@br-validators/core/csosn';
import { NCM_GOLDEN_CAVALOS_REPRODUTORES } from '@br-validators/core/ncm';
import { CBO_GOLDEN_ANALISTA_SISTEMAS } from '@br-validators/core/cbo';
import { EXIT } from '../src/constants.js';
import { REFERENCE_LOOKUP_MODULES } from '../src/commands/reference-lookup/registry.js';
import { runReferenceSearch, runReferenceSearchCommand } from '../src/commands/reference-lookup/search.js';

describe('runReferenceSearchCommand — fiscal search', () => {
  it('searches CNAE by description', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceSearchCommand('cnae', 'web design', { json: true, verbose: true }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { cnaes: { codigo: string }[]; capturadoEm?: string };
    expect(parsed.cnaes.some((row) => row.codigo === CNAES_GOLDEN_WEB_DESIGN)).toBe(true);
    expect(parsed.capturadoEm).toBe(REFERENCE_LOOKUP_MODULES.cnae.capturadoEm);
  });

  it('searches CNAE by partial description', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceSearchCommand('cnae', 'desenvolvimento', { json: true, verbose: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { total: number; cnaes: { codigo: string }[] };
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.cnaes.some((row) => row.codigo === CNAES_GOLDEN_DESENVOLVIMENTO_PROGRAMAS)).toBe(true);
  });

  it('searches CFOP', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceSearchCommand('cfop', 'compra', { json: true, verbose: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { cfops: { codigo: string }[] };
    expect(parsed.cfops.some((row) => row.codigo === CFOP_GOLDEN_COMPRA_COMERCIALIZACAO)).toBe(true);
  });

  it('searches CSOSN', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceSearchCommand('csosn', 'simples nacional', { json: true, verbose: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { csosns: { codigo: string }[] };
    expect(parsed.csosns.some((row) => row.codigo === CSOSN_GOLDEN_SEM_CREDITO)).toBe(true);
  });

  it('prints human search output with verbose footer', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceSearchCommand('cfop', 'compra', { json: false, verbose: true }, io)).toBe(EXIT.OK);
    expect(io.stdout.at(-1)).toContain('capturadoEm:');
  });

  it('searches NCM', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceSearchCommand('ncm', 'reprodutor', { json: true, verbose: false, limit: 5 }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ncms: { codigo: string }[] };
    expect(parsed.ncms.some((row) => row.codigo === NCM_GOLDEN_CAVALOS_REPRODUTORES)).toBe(true);
  });

  it('searches CBO', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runReferenceSearchCommand('cbo', 'desenvolvimento de sistemas', { json: true, verbose: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { cbos: { codigo: string }[]; capturadoEm?: string };
    expect(parsed.cbos.some((row) => row.codigo === CBO_GOLDEN_ANALISTA_SISTEMAS)).toBe(true);
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('returns invalid for empty human search results', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceSearchCommand('ncm', 'zzzznonexistentterm', { json: false, verbose: false }, io)).toBe(
      EXIT.INVALID,
    );
  });

  it('returns usage for empty query', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceSearchCommand('cfop', '  ', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('runReferenceSearch', () => {
  it('dispatches known command', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceSearch('cnae', 'software', { json: true, verbose: false }, io)).toBe(EXIT.OK);
  });

  it('rejects unknown command', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceSearch('moedas', 'real', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('rejects missing query', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runReferenceSearch('cbo', undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});
