import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EXIT } from '../src/constants.js';
import { handleCepCli, handleCnpjCli, handleCpfCli, handleTelefoneCli, handleCnhCli, handleRenavamCli, handleTituloEleitorCli, handleBrCodeCli, handleListCli, handlePisPasepCli, handlePixCli, handleBoletoCli, handleCartaoCli, handleCartaoCreditoCli, handleIeCli, handlePlacaCli, readInputFile, writeCliIo } from '../src/handlers.js';
import { createProgram, run } from '../src/program.js';
import { CEP_GOLDEN_PRIMARY, CNPJ_GOLDEN_ALPHANUMERIC, CPF_GOLDEN_PRIMARY, CNH_GOLDEN_PRIMARY, RENAVAM_GOLDEN_PRIMARY, TITULO_ELEITOR_GOLDEN_PRIMARY, PIX_GOLDEN_EMAIL, PIS_PASEP_GOLDEN_PRIMARY, PLACA_GOLDEN_MERCOSUL, BOLETO_GOLDEN_LINHA_STRIPPED, CARTAO_GOLDEN_VISA, IE_SP_GOLDEN, TELEFONE_GOLDEN_CELULAR, BRCODE_GOLDEN_STATIC_EVP } from '@br-validators/core';

describe('handlers', () => {
  it('handleListCli lists types', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleListCli(io)).toBe(0);
    expect(io.stdout).toContain('cnpj');
    expect(io.stdout).toContain('cpf');
    expect(io.stdout).toContain('cep');
    expect(io.stdout).toContain('telefone');
    expect(io.stdout).toContain('cnh');
    expect(io.stdout).toContain('renavam');
    expect(io.stdout).toContain('titulo-eleitor');
    expect(io.stdout).toContain('brcode');
    expect(io.stdout).toContain('placa');
    expect(io.stdout).toContain('pis-pasep');
    expect(io.stdout).toContain('pix');
    expect(io.stdout).toContain('boleto');
    expect(io.stdout).toContain('cartao');
    expect(io.stdout).toContain('ie');
  });

  it('handleCartaoCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCli('validate', CARTAO_GOLDEN_VISA, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCartaoCli detects brand', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCli('detect', CARTAO_GOLDEN_VISA, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCartaoCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cartao.txt');
    writeFileSync(file, CARTAO_GOLDEN_VISA, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCartaoCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleCartaoCreditoCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCreditoCli('validate', CARTAO_GOLDEN_VISA, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePixCli formats phone key', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('format', '+5511999887766', { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCartaoCreditoCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cartao-credito.txt');
    writeFileSync(file, CARTAO_GOLDEN_VISA, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCreditoCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCartaoCreditoCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCreditoCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleBoletoCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBoletoCli('validate', BOLETO_GOLDEN_LINHA_STRIPPED, { quiet: true }, undefined, io)).toBe(EXIT.OK);
  });

  it('handleBoletoCli detects value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBoletoCli('detect', BOLETO_GOLDEN_LINHA_STRIPPED, { quiet: true }, undefined, io)).toBe(EXIT.OK);
  });

  it('handleBoletoCli converts linha to barras', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      handleBoletoCli('convert', BOLETO_GOLDEN_LINHA_STRIPPED, { quiet: true }, 'linha-to-barras', io),
    ).toBe(EXIT.OK);
  });

  it('handleBoletoCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'boleto.txt');
    writeFileSync(file, BOLETO_GOLDEN_LINHA_STRIPPED, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBoletoCli('validate', undefined, { file, quiet: true }, undefined, io)).toBe(EXIT.OK);
  });

  it('handleBoletoCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBoletoCli('validate', undefined, { file: '/no/such/file.txt' }, undefined, io)).toBe(EXIT.USAGE);
  });

  it('handlePixCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('validate', PIX_GOLDEN_EMAIL, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePixCli detects value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('detect', PIX_GOLDEN_EMAIL, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePixCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'pix.txt');
    writeFileSync(file, PIX_GOLDEN_EMAIL, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePixCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handlePisPasepCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePisPasepCli('validate', PIS_PASEP_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePisPasepCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'pis-pasep.txt');
    writeFileSync(file, PIS_PASEP_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePisPasepCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePisPasepCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePisPasepCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handlePlacaCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePlacaCli('validate', PLACA_GOLDEN_MERCOSUL, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePlacaCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'placa.txt');
    writeFileSync(file, PLACA_GOLDEN_MERCOSUL, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePlacaCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePlacaCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePlacaCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleCepCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCepCli('validate', CEP_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCepCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cep.txt');
    writeFileSync(file, CEP_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCepCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCepCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCepCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleTelefoneCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleTelefoneCli('validate', TELEFONE_GOLDEN_CELULAR, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleTelefoneCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'telefone.txt');
    writeFileSync(file, TELEFONE_GOLDEN_CELULAR, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleTelefoneCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleTelefoneCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleTelefoneCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleCnhCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnhCli('validate', CNH_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCnhCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cnh.txt');
    writeFileSync(file, CNH_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnhCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCnhCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnhCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleRenavamCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleRenavamCli('validate', RENAVAM_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleRenavamCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'renavam.txt');
    writeFileSync(file, RENAVAM_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleRenavamCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleRenavamCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleRenavamCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleTituloEleitorCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleTituloEleitorCli('validate', TITULO_ELEITOR_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleTituloEleitorCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'titulo-eleitor.txt');
    writeFileSync(file, TITULO_ELEITOR_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleTituloEleitorCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleTituloEleitorCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleTituloEleitorCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleBrCodeCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'brcode.txt');
    writeFileSync(file, BRCODE_GOLDEN_STATIC_EVP, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBrCodeCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleBrCodeCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBrCodeCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleCpfCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCpfCli('validate', CPF_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCpfCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cpf.txt');
    writeFileSync(file, CPF_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCpfCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCpfCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCpfCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleIeCli validates value with uf', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleIeCli('validate', IE_SP_GOLDEN, { uf: 'SP', quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleIeCli returns usage when uf missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleIeCli('validate', IE_SP_GOLDEN, {}, io)).toBe(EXIT.USAGE);
  });

  it('handleIeCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'ie.txt');
    writeFileSync(file, IE_SP_GOLDEN, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleIeCli('validate', undefined, { file, uf: 'SP', quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleIeCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleIeCli('validate', undefined, { file: '/no/such/file.txt', uf: 'SP' }, io)).toBe(EXIT.USAGE);
  });

  it('handleCnpjCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnpjCli('validate', CNPJ_GOLDEN_ALPHANUMERIC, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('readInputFile returns null on missing file', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(readInputFile('/no/such/file.txt', io)).toBeNull();
    expect(io.stderr[0]).toContain('Cannot read file');
  });

  it('handleCnpjCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cnpj.txt');
    writeFileSync(file, CNPJ_GOLDEN_ALPHANUMERIC, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnpjCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCnpjCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnpjCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('writeCliIo prints to console', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    writeCliIo({ stdout: ['a'], stderr: ['b'] });
    expect(log).toHaveBeenCalledWith('a');
    expect(err).toHaveBeenCalledWith('b');
    log.mockRestore();
    err.mockRestore();
  });
});

describe('program', () => {
  it('createProgram exposes list and cnpj commands', () => {
    const program = createProgram();
    expect(program.commands.map((c) => c.name())).toEqual(expect.arrayContaining(['list', 'cnpj', 'cpf', 'cep', 'telefone', 'cnh', 'renavam', 'titulo-eleitor', 'brcode', 'placa', 'pis-pasep', 'pix', 'boleto', 'cartao', 'cartao-credito']));
  });

  it('run parses list without throwing', () => {
    expect(() => { run(['node', 'br-validators', 'list']); }).not.toThrow();
  });

  it('run parses cnpj validate', () => {
    expect(() =>
      { run(['node', 'br-validators', 'cnpj', 'validate', CNPJ_GOLDEN_ALPHANUMERIC, '--quiet']); },
    ).not.toThrow();
  });

  it('run parses cpf validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'cpf', 'validate', CPF_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses cnpj format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'cnpj', 'format', CNPJ_GOLDEN_ALPHANUMERIC]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'cnpj', 'strip', CNPJ_GOLDEN_ALPHANUMERIC]); }).not.toThrow();
  });

  it('run parses cep validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'cep', 'validate', CEP_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses cep format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'cep', 'format', CEP_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'cep', 'strip', CEP_GOLDEN_PRIMARY]); }).not.toThrow();
  });

  it('run parses telefone validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'telefone', 'validate', TELEFONE_GOLDEN_CELULAR, '--quiet']);
    }).not.toThrow();
  });

  it('run parses telefone format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'telefone', 'format', TELEFONE_GOLDEN_CELULAR]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'telefone', 'strip', TELEFONE_GOLDEN_CELULAR]); }).not.toThrow();
  });

  it('run parses cnh validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'cnh', 'validate', CNH_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses cnh format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'cnh', 'format', CNH_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'cnh', 'strip', CNH_GOLDEN_PRIMARY]); }).not.toThrow();
  });

  it('run parses renavam validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'renavam', 'validate', RENAVAM_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses renavam format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'renavam', 'format', RENAVAM_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'renavam', 'strip', RENAVAM_GOLDEN_PRIMARY]); }).not.toThrow();
  });

  it('run parses titulo-eleitor validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'titulo-eleitor', 'validate', TITULO_ELEITOR_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses titulo-eleitor format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'titulo-eleitor', 'format', TITULO_ELEITOR_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'titulo-eleitor', 'strip', TITULO_ELEITOR_GOLDEN_PRIMARY]); }).not.toThrow();
  });

  it('run parses brcode validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'brcode', 'validate', BRCODE_GOLDEN_STATIC_EVP, '--quiet']);
    }).not.toThrow();
  });

  it('run parses brcode parse', () => {
    expect(() => {
      run(['node', 'br-validators', 'brcode', 'parse', BRCODE_GOLDEN_STATIC_EVP, '--json']);
    }).not.toThrow();
  });

  it('run parses placa validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'placa', 'validate', PLACA_GOLDEN_MERCOSUL, '--quiet']);
    }).not.toThrow();
  });

  it('run parses placa format strip and convert', () => {
    expect(() => { run(['node', 'br-validators', 'placa', 'format', PLACA_GOLDEN_MERCOSUL]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'placa', 'strip', PLACA_GOLDEN_MERCOSUL]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'placa', 'convert', 'ABC1234', '--quiet']); }).not.toThrow();
  });

  it('run parses pis-pasep validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'pis-pasep', 'validate', PIS_PASEP_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses pis-pasep format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'pis-pasep', 'format', PIS_PASEP_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'pis-pasep', 'strip', PIS_PASEP_GOLDEN_PRIMARY]); }).not.toThrow();
  });

  it('run parses pix validate detect format', () => {
    expect(() => {
      run(['node', 'br-validators', 'pix', 'validate', PIX_GOLDEN_EMAIL, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'pix', 'detect', PIX_GOLDEN_EMAIL]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'pix', 'format', '+5511999887766', '--quiet']);
    }).not.toThrow();
  });

  it('run parses boleto validate detect convert format strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'validate', BOLETO_GOLDEN_LINHA_STRIPPED, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'detect', BOLETO_GOLDEN_LINHA_STRIPPED]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'convert', 'linha-to-barras', BOLETO_GOLDEN_LINHA_STRIPPED, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'format', BOLETO_GOLDEN_LINHA_STRIPPED]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'strip', BOLETO_GOLDEN_LINHA_STRIPPED]);
    }).not.toThrow();
  });

  it('run parses cartao validate detect format strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'cartao', 'validate', CARTAO_GOLDEN_VISA, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'cartao', 'detect', CARTAO_GOLDEN_VISA]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'cartao', 'format', CARTAO_GOLDEN_VISA]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'cartao', 'strip', CARTAO_GOLDEN_VISA]);
    }).not.toThrow();
  });

  it('run parses cartao-credito format', () => {
    expect(() => {
      run(['node', 'br-validators', 'cartao-credito', 'format', CARTAO_GOLDEN_VISA, '--quiet']);
    }).not.toThrow();
  });

  it('run parses ie validate format strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'ie', 'validate', IE_SP_GOLDEN, '--uf', 'SP', '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ie', 'format', IE_SP_GOLDEN, '--uf', 'SP', '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ie', 'strip', IE_SP_GOLDEN, '--uf', 'SP', '--quiet']);
    }).not.toThrow();
  });
});
