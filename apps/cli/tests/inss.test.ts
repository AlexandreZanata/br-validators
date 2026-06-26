import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  formatInssFaixaHuman,
  runInssCalc,
  runInssCalcCommand,
  runInssTabela,
  runInssTabelaCommand,
} from '../src/commands/inss/index.js';
import { handleInssCalcCli, handleInssTabelaCli } from '../src/handlers.js';

describe('inss CLI', () => {
  it('lists 2025 table as json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runInssTabela({ json: true, verbose: true, ano: 2025 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ano: number; faixas: unknown[]; teto: number; capturadoEm?: string };
    expect(parsed.ano).toBe(2025);
    expect(parsed.faixas.length).toBe(4);
    expect(parsed.teto).toBe(8157.41);
    expect(parsed.capturadoEm).toBeDefined();
  });

  it('lists table human output with verbose capture date', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runInssTabelaCommand({ json: false, verbose: true, ano: 2025 }, io)).toBe(EXIT.OK);
    expect(io.stdout.length).toBe(6);
    expect(io.stdout[5]).toContain('capturadoEm:');
  });

  it('lists table human output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runInssTabelaCommand({ json: false, verbose: false, ano: 2025 }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('Teto:');
    expect(io.stdout[1]).toBe(formatInssFaixaHuman({
      faixa: 1,
      salarioMin: 0,
      salarioMax: 1518,
      aliquota: 0.075,
      descricao: 'Até 1.518,00',
    }));
    expect(io.stdout.length).toBe(5);
  });

  it('calculates golden salary 3000', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runInssCalc('3000', { json: true, verbose: false, ano: 2025 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { contribuicao: number; faixa: number };
    expect(parsed.faixa).toBe(3);
    expect(parsed.contribuicao).toBe(253.41);
  });

  it('calculates json output with verbose capture date', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runInssCalcCommand('3000', { json: true, verbose: true, ano: 2025 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { capturadoEm?: string };
    expect(parsed.capturadoEm).toBeDefined();
  });

  it('defaults invalid ano to embedded year', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runInssTabela({ json: true, verbose: false, ano: 99999 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ano: number };
    expect(parsed.ano).toBe(2025);
  });

  it('calculates human output with verbose', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runInssCalcCommand('8157.41', { json: false, verbose: true, ano: 2025 }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('contribuição R$ 951.63');
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('rejects unknown year and invalid salary', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runInssTabela({ json: false, verbose: false, ano: 1999 }, io)).toBe(EXIT.INVALID);
    expect(runInssCalcCommand('3000', { json: false, verbose: false, ano: 1999 }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('not found for year 1999');
    io.stderr.length = 0;
    expect(runInssCalc('abc', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runInssCalc('-1', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
    expect(runInssCalc(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('handler wrappers delegate', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleInssTabelaCli({ json: true, year: 2025 }, io)).toBe(EXIT.OK);
    io.stdout.length = 0;
    expect(handleInssCalcCli('3000', { json: true, year: 2025 }, io)).toBe(EXIT.OK);
  });
});
