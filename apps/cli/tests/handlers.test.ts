import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EXIT } from '../src/constants.js';
import { handleCepCli, handleCnpjCli, handleCpfCli, handleTelefoneCli, handleCnhCli, handleRenavamCli, handleTituloEleitorCli, handleProcessoJudicialCli, handleRgCli, handleNfeChaveCli, handleBrCodeCli, handleListCli, handlePisPasepCli, handleCnisCli, handlePixCli, handleBoletoCli, handleCartaoCli, handleCartaoCreditoCli, handleEanCli, handleIeCli, handlePlacaCli, handleDetectCli, handleSanitizeCli, handleMaskCli, handleCompareCli, handleBatchCli, handleDiffCli, handleGenerateCli, handleBancosLookupCli, handleBancosListCli, handlePtaxHistoricoCli, readInputFile, writeCliIo } from '../src/handlers.js';
import { createProgram, run } from '../src/program.js';
import { CEP_GOLDEN_PRIMARY, CNPJ_GOLDEN_ALPHANUMERIC, CPF_GOLDEN_PRIMARY, CPF_GOLDEN_PRIMARY_MASKED, CPF_GOLDEN_SECONDARY, CNH_GOLDEN_PRIMARY, RENAVAM_GOLDEN_PRIMARY, TITULO_ELEITOR_GOLDEN_PRIMARY, PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, NFE_CHAVE_GOLDEN_PRIMARY, PIX_GOLDEN_EMAIL, PIS_PASEP_GOLDEN_PRIMARY, CNIS_GOLDEN_INSS_NIT, PLACA_GOLDEN_MERCOSUL, BOLETO_GOLDEN_LINHA_STRIPPED, CARTAO_GOLDEN_VISA, EAN_GOLDEN_13, IE_SP_GOLDEN, RG_SP_GOLDEN, TELEFONE_GOLDEN_CELULAR, BRCODE_GOLDEN_STATIC_EVP } from '@br-validators/core';

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
    expect(io.stdout).toContain('processo-judicial');
    expect(io.stdout).toContain('rg');
    expect(io.stdout).toContain('nfe-chave');
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

  it('handleEanCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleEanCli('validate', EAN_GOLDEN_13, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleEanCli detects format', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleEanCli('detect', EAN_GOLDEN_13, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleEanCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-ean-'));
    const file = join(dir, 'ean.txt');
    writeFileSync(file, EAN_GOLDEN_13, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleEanCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleEanCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleEanCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
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

  it('handleCnisCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnisCli('validate', CNIS_GOLDEN_INSS_NIT, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCnisCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cnis.txt');
    writeFileSync(file, CNIS_GOLDEN_INSS_NIT, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnisCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCnisCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnisCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
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

  it('handleProcessoJudicialCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      handleProcessoJudicialCli('validate', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, { quiet: true }, io),
    ).toBe(EXIT.OK);
  });

  it('handleProcessoJudicialCli parses value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      handleProcessoJudicialCli('parse', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, { quiet: true }, io),
    ).toBe(EXIT.OK);
  });

  it('handleProcessoJudicialCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'processo-judicial.txt');
    writeFileSync(file, PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleProcessoJudicialCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleProcessoJudicialCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleProcessoJudicialCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleRgCli validates value with uf', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleRgCli('validate', RG_SP_GOLDEN, { uf: 'SP', quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleRgCli returns usage when uf missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleRgCli('validate', RG_SP_GOLDEN, {}, io)).toBe(EXIT.USAGE);
  });

  it('handleRgCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'rg.txt');
    writeFileSync(file, RG_SP_GOLDEN, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleRgCli('validate', undefined, { file, uf: 'SP', quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleRgCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleRgCli('validate', undefined, { file: '/no/such/file.txt', uf: 'SP' }, io)).toBe(EXIT.USAGE);
  });

  it('handleNfeChaveCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleNfeChaveCli('validate', NFE_CHAVE_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleNfeChaveCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'nfe-chave.txt');
    writeFileSync(file, NFE_CHAVE_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleNfeChaveCli('parse', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleNfeChaveCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleNfeChaveCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
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
    expect(program.commands.map((c) => c.name())).toEqual(expect.arrayContaining(['list', 'cnpj', 'cpf', 'cep', 'telefone', 'cnh', 'renavam', 'titulo-eleitor', 'processo-judicial', 'rg', 'nfe-chave', 'brcode', 'placa', 'pis-pasep', 'pix', 'boleto', 'cartao', 'cartao-credito']));
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

  it('run parses processo-judicial validate and parse', () => {
    expect(() => {
      run(['node', 'br-validators', 'processo-judicial', 'validate', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'processo-judicial', 'parse', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED, '--json']);
    }).not.toThrow();
  });

  it('run parses processo-judicial format and strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'processo-judicial', 'format', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'processo-judicial', 'strip', PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED]);
    }).not.toThrow();
  });

  it('run parses rg validate format and strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'rg', 'validate', RG_SP_GOLDEN, '--uf', 'SP', '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'rg', 'format', RG_SP_GOLDEN, '--uf', 'SP']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'rg', 'strip', RG_SP_GOLDEN, '--uf', 'SP']);
    }).not.toThrow();
  });

  it('run parses nfe-chave validate and parse', () => {
    expect(() => {
      run(['node', 'br-validators', 'nfe-chave', 'validate', NFE_CHAVE_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'nfe-chave', 'parse', NFE_CHAVE_GOLDEN_PRIMARY, '--json']);
    }).not.toThrow();
  });

  it('run parses nfe-chave format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'nfe-chave', 'format', NFE_CHAVE_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'nfe-chave', 'strip', NFE_CHAVE_GOLDEN_PRIMARY]); }).not.toThrow();
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

  it('run parses cnis validate format strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'cnis', 'validate', CNIS_GOLDEN_INSS_NIT, '--quiet']);
    }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'cnis', 'format', CNIS_GOLDEN_INSS_NIT]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'cnis', 'strip', CNIS_GOLDEN_INSS_NIT]); }).not.toThrow();
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

  it('run parses ean validate detect format strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'ean', 'validate', EAN_GOLDEN_13, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ean', 'detect', EAN_GOLDEN_13]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ean', 'format', EAN_GOLDEN_13]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ean', 'strip', EAN_GOLDEN_13]);
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

  it('handleDetectCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'detect.txt');
    writeFileSync(file, CPF_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleDetectCli(undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleDetectCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleDetectCli(undefined, { file: '/no/such/detect.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleSanitizeCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'sanitize.txt');
    writeFileSync(file, CPF_GOLDEN_PRIMARY_MASKED, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleSanitizeCli('cpf', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleSanitizeCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleSanitizeCli('cpf', undefined, { file: '/no/such/sanitize.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleMaskCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-mask-'));
    const file = join(dir, 'mask.txt');
    writeFileSync(file, CPF_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleMaskCli('cpf', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleMaskCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleMaskCli('cpf', undefined, { file: '/no/such/mask.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleGenerateCli generates document', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleGenerateCli('cpf', { quiet: true, seed: 42 }, io)).toBe(EXIT.OK);
  });

  it('handleBancosLookupCli resolves COMPE', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBancosLookupCli('001', { json: true }, io)).toBe(EXIT.OK);
    expect(JSON.parse(io.stdout[0]).ok).toBe(true);
  });

  it('handleBancosListCli returns rows', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBancosListCli({ limit: 2 }, io)).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(2);
  });

  it('run parses platform detect sanitize mask generate compare batch diff', () => {
    expect(() => {
      run(['node', 'br-validators', 'detect', CPF_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'sanitize', 'cpf', CPF_GOLDEN_PRIMARY_MASKED, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'mask', 'cpf', CPF_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'generate', 'cpf', '--quiet', '--seed', '42']);
    }).not.toThrow();
    expect(() => {
      run([
        'node',
        'br-validators',
        'compare',
        'cpf',
        CPF_GOLDEN_PRIMARY_MASKED,
        CPF_GOLDEN_PRIMARY,
        '--quiet',
      ]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'diff', 'cpf', CPF_GOLDEN_PRIMARY, CPF_GOLDEN_SECONDARY, '--quiet']);
    }).not.toThrow();
    const batchDir = mkdtempSync(join(tmpdir(), 'br-validators-batch-run-'));
    const batchFile = join(batchDir, 'values.txt');
    writeFileSync(batchFile, `${CPF_GOLDEN_PRIMARY}\n`, 'utf8');
    expect(() => {
      run(['node', 'br-validators', 'batch', 'cpf', '--file', batchFile, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'compare', 'cpf', CPF_GOLDEN_PRIMARY]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'diff', 'cpf', CPF_GOLDEN_PRIMARY]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'bancos', 'lookup', '001', '--json']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'bancos', 'list', '--limit', '2']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'moedas', 'lookup', 'BRL', '--json']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'portos', 'lookup', 'BRSSZ']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ibge', 'lookup', '3550308', '--json']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'feriados', 'list', '--year', '2026']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'cnae', 'search', 'software', '--limit', '2']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'tse-municipios', 'lookup', '71072', '--json']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ddd', 'lookup', '11']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ptax', 'lookup', 'USD', '--verbose']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ptax', 'historico', 'USD', '2026-06-23', '2026-06-24', '--json']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'cep', 'faixa', '01310']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ibge', 'list', 'invalid']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'ibge', 'list', 'estados', '--limit', '1']);
    }).not.toThrow();
  });

  it('handleCompareCli compares values', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      handleCompareCli('cpf', CPF_GOLDEN_PRIMARY_MASKED, CPF_GOLDEN_PRIMARY, { quiet: true }, io),
    ).toBe(EXIT.OK);
  });

  it('handleDiffCli diffs values', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      handleDiffCli('cpf', CPF_GOLDEN_PRIMARY, CPF_GOLDEN_SECONDARY, { quiet: true }, io),
    ).toBe(EXIT.INVALID);
  });

  it('handleBatchCli reads from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-batch-handler-'));
    const file = join(dir, 'values.txt');
    writeFileSync(file, CPF_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBatchCli('cpf', { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleBatchCli returns usage for missing file', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBatchCli('cpf', { file: '/nonexistent/values.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handlePtaxHistoricoCli returns historico JSON', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      handlePtaxHistoricoCli('USD', '2026-06-23', '2026-06-24', { json: true, verbose: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.length).toBeGreaterThan(0);
  });
});
