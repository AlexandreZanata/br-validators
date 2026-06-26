import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  formatIrpfFaixaHuman,
  runIrpfCalc,
  runIrpfCalcCommand,
  runIrpfTabela,
  runIrpfTabelaCommand,
} from '../src/commands/irpf/index.js';
import { handleIrpfCalcCli, handleIrpfTabelaCli } from '../src/handlers.js';

describe('irpf CLI', () => {
  it('lists 2025 table as json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIrpfTabela({ json: true, verbose: true, ano: 2025 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ano: number; faixas: unknown[]; capturadoEm?: string };
    expect(parsed.ano).toBe(2025);
    expect(parsed.faixas.length).toBe(5);
    expect(parsed.capturadoEm).toBeDefined();
  });

  it('lists table human output with verbose capture date', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIrpfTabelaCommand({ json: false, verbose: true, ano: 2025 }, io)).toBe(EXIT.OK);
    expect(io.stdout.length).toBe(6);
    expect(io.stdout[5]).toContain('capturadoEm:');
  });

  it('lists table human output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIrpfTabelaCommand({ json: false, verbose: false, ano: 2025 }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toBe(formatIrpfFaixaHuman({
      faixa: 1,
      baseCalculoMin: 0,
      baseCalculoMax: 2259.2,
      aliquota: 0,
      parcelaDeduzir: 0,
      descricao: 'Até 2.259,20',
    }));
    expect(io.stdout.length).toBe(5);
  });

  it('calculates golden base 3000', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIrpfCalc('3000', { json: true, verbose: false, ano: 2025 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { imposto: number; faixa: number };
    expect(parsed.faixa).toBe(3);
    expect(parsed.imposto).toBe(68.56);
  });

  it('calculates json output with verbose capture date', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIrpfCalcCommand('3000', { json: true, verbose: true, ano: 2025 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { capturadoEm?: string };
    expect(parsed.capturadoEm).toBeDefined();
  });

  it('defaults invalid ano to embedded year', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIrpfTabela({ json: true, verbose: false, ano: 99999 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ano: number };
    expect(parsed.ano).toBe(2025);
  });

  it('calculates human output with verbose', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIrpfCalcCommand('5000', { json: false, verbose: true, ano: 2025 }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('imposto R$ 479.00');
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('rejects unknown year and invalid base', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIrpfTabela({ json: false, verbose: false, ano: 1999 }, io)).toBe(EXIT.INVALID);
    expect(runIrpfCalcCommand('3000', { json: false, verbose: false, ano: 1999 }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('not found for year 1999');
    io.stderr.length = 0;
    expect(runIrpfCalc('abc', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
    expect(runIrpfCalc('-1', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
    expect(runIrpfCalc(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });

  it('handler wrappers delegate', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleIrpfTabelaCli({ json: true, year: 2025 }, io)).toBe(EXIT.OK);
    io.stdout.length = 0;
    expect(handleIrpfCalcCli('3000', { json: true, year: 2025 }, io)).toBe(EXIT.OK);
  });
});
