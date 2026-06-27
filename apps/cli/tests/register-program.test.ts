import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProgram } from '../src/program.js';
import * as handlers from '../src/handlers.js';

describe('registerReferenceLookupCommands via createProgram', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('wires ncm validate subcommand to handler', async () => {
    const handleSpy = vi.spyOn(handlers, 'handleReferenceValidateCli').mockReturnValue(0);
    const writeSpy = vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['ncm', 'validate', '01012100', '--json'], { from: 'user' });
    expect(handleSpy).toHaveBeenCalledWith(
      'ncm',
      '01012100',
      expect.objectContaining({ json: true }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
    expect(writeSpy).toHaveBeenCalled();
  });

  it('wires cst subcommands to handlers', async () => {
    const lookupSpy = vi.spyOn(handlers, 'handleCstLookupCli').mockReturnValue(0);
    const searchSpy = vi.spyOn(handlers, 'handleCstSearchCli').mockReturnValue(0);
    const validateSpy = vi.spyOn(handlers, 'handleCstValidateCli').mockReturnValue(0);
    vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['cst', 'lookup', '00', '--tax', 'icms'], { from: 'user' });
    await program.parseAsync(['cst', 'search', 'tributada', '--tax', 'icms'], { from: 'user' });
    await program.parseAsync(['cst', 'validate', '00', '--tax', 'icms'], { from: 'user' });
    expect(lookupSpy).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalled();
    expect(validateSpy).toHaveBeenCalled();
  });

  it('wires nfe-cuf lookup subcommand to handler', async () => {
    const lookupSpy = vi.spyOn(handlers, 'handleNfeCufLookupCli').mockReturnValue(0);
    vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['nfe-cuf', 'lookup', '35', '--json'], { from: 'user' });
    expect(lookupSpy).toHaveBeenCalledWith(
      '35',
      expect.objectContaining({ json: true }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
  });

  it('wires inss subcommands to handlers', async () => {
    const tabelaSpy = vi.spyOn(handlers, 'handleInssTabelaCli').mockReturnValue(0);
    const calcSpy = vi.spyOn(handlers, 'handleInssCalcCli').mockReturnValue(0);
    vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['inss', 'tabela', '--ano', '2025', '--json'], { from: 'user' });
    await program.parseAsync(['inss', 'tabela', '--json'], { from: 'user' });
    await program.parseAsync(['inss', 'calc', '3000', '--json'], { from: 'user' });
    expect(tabelaSpy).toHaveBeenCalledTimes(2);
    expect(tabelaSpy).toHaveBeenCalledWith(
      expect.objectContaining({ json: true, year: 2025 }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
    expect(calcSpy).toHaveBeenCalledWith(
      '3000',
      expect.objectContaining({ json: true }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
  });

  it('wires selic command to handler', async () => {
    const spy = vi.spyOn(handlers, 'handleSelicCli').mockReturnValue(0);
    vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['selic', '--json', '--date', '2026-06-18'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ json: true, date: '2026-06-18' }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
  });

  it('wires iss-municipal subcommands to handlers', async () => {
    const listSpy = vi.spyOn(handlers, 'handleIssMunicipalListCli').mockReturnValue(0);
    const lookupSpy = vi.spyOn(handlers, 'handleIssMunicipalLookupCli').mockReturnValue(0);
    const resolveSpy = vi.spyOn(handlers, 'handleIssMunicipalResolveCli').mockReturnValue(0);
    const searchSpy = vi.spyOn(handlers, 'handleIssMunicipalSearchCli').mockReturnValue(0);
    vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['iss-municipal', 'list', '--uf', 'SP', '--json'], { from: 'user' });
    await program.parseAsync(['iss-municipal', 'lookup', '3550308', '--json', '--verbose'], { from: 'user' });
    await program.parseAsync(['iss-municipal', 'resolve', 'SP', 'São Paulo', '--json'], { from: 'user' });
    await program.parseAsync(['iss-municipal', 'search', 'campinas', '--uf', 'SP', '--limit', '2'], { from: 'user' });
    expect(listSpy).toHaveBeenCalledWith(
      expect.objectContaining({ json: true, uf: 'SP' }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
    expect(lookupSpy).toHaveBeenCalledWith(
      '3550308',
      expect.objectContaining({ json: true, verbose: true }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
    expect(resolveSpy).toHaveBeenCalledWith(
      'SP',
      'São Paulo',
      expect.objectContaining({ json: true }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
    expect(searchSpy).toHaveBeenCalledWith(
      'campinas',
      expect.objectContaining({ limit: 2, uf: 'SP' }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
  });

  it('wires irpf subcommands to handlers', async () => {
    const tabelaSpy = vi.spyOn(handlers, 'handleIrpfTabelaCli').mockReturnValue(0);
    const calcSpy = vi.spyOn(handlers, 'handleIrpfCalcCli').mockReturnValue(0);
    vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['irpf', 'tabela', '--ano', '2025', '--json'], { from: 'user' });
    await program.parseAsync(['irpf', 'tabela', '--json'], { from: 'user' });
    await program.parseAsync(['irpf', 'calc', '3000', '--json'], { from: 'user' });
    expect(tabelaSpy).toHaveBeenCalledTimes(2);
    expect(tabelaSpy).toHaveBeenCalledWith(
      expect.objectContaining({ json: true, year: 2025 }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
    expect(calcSpy).toHaveBeenCalledWith(
      '3000',
      expect.objectContaining({ json: true }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
  });
});
