import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  printBoletoConvert,
  printBoletoDetect,
  printBoletoFormat,
  printBoletoStrip,
  printBoletoValidation,
  resolveInput,
  runBoleto,
  runBoletoCommand,
} from '../src/commands/boleto.js';
import {
  BOLETO_GOLDEN_CODIGO_BARRAS,
  BOLETO_GOLDEN_LINHA_MASKED,
  BOLETO_GOLDEN_LINHA_STRIPPED,
  BOLETO_OFFICIAL_SOURCE_URL,
  validateBoleto,
} from '@br-validators/core';
import arrecadacaoVectors from '../../../packages/br-validators/tests/vectors/boleto-arrecadacao.official.json';

describe('resolveInput (boleto)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runBoletoCommand validate', () => {
  it('validates masked linha golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBoletoCommand('validate', BOLETO_GOLDEN_LINHA_MASKED, { json: false, quiet: false, source: false }, undefined, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes (linha-digitavel)');
    expect(io.stdout.some((line) => line.startsWith('situacao:'))).toBe(true);
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('validate', BOLETO_GOLDEN_LINHA_STRIPPED, { json: true, quiet: false, source: true }, undefined, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; inputKind?: string; source?: string; situacao?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.inputKind).toBe('linha-digitavel');
    expect(parsed.situacao).toBe('1');
    expect(parsed.source).toBe(BOLETO_OFFICIAL_SOURCE_URL);
  });

  it('validates human output with source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('validate', BOLETO_GOLDEN_LINHA_STRIPPED, { json: false, quiet: false, source: true }, undefined, io);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates with json without source field', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('validate', BOLETO_GOLDEN_LINHA_STRIPPED, { json: true, quiet: false, source: false }, undefined, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBeUndefined();
  });

  it('validates json failure without inputKind', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('validate', 'not-a-boleto', { json: true, quiet: false, source: false }, undefined, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; inputKind?: string };
    expect(parsed.ok).toBe(false);
    expect(parsed.inputKind).toBeUndefined();
  });

  it('validates json failure with inputKind on strict mismatch', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand(
      'validate',
      BOLETO_GOLDEN_CODIGO_BARRAS,
      { json: true, quiet: false, source: false, kind: 'linha-digitavel' },
      undefined,
      io,
    );
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; inputKind?: string };
    expect(parsed.ok).toBe(false);
    expect(parsed.inputKind).toBe('linha-digitavel');
  });

  it('validates quiet invalid', () => {
    expect(runBoletoCommand('validate', 'bad', { json: false, quiet: true, source: false }, undefined)).toBe(EXIT.INVALID);
  });
});

describe('runBoletoCommand detect', () => {
  it('detects codigo-barras', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('detect', BOLETO_GOLDEN_CODIGO_BARRAS, { json: false, quiet: false, source: false }, undefined, io);
    expect(io.stdout[0]).toBe('codigo-barras');
  });

  it('detects with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('detect', BOLETO_GOLDEN_CODIGO_BARRAS, { json: true, quiet: false, source: false }, undefined, io);
    expect(JSON.parse(io.stdout[0]).inputKind).toBe('codigo-barras');
  });

  it('detects quiet', () => {
    expect(
      runBoletoCommand('detect', BOLETO_GOLDEN_CODIGO_BARRAS, { json: false, quiet: true, source: false }, undefined),
    ).toBe(EXIT.OK);
  });
});

describe('runBoletoCommand convert', () => {
  it('converts linha to barras', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand(
      'convert',
      BOLETO_GOLDEN_LINHA_STRIPPED,
      { json: false, quiet: false, source: false },
      'linha-to-barras',
      io,
    );
    expect(io.stdout[0]).toBe(BOLETO_GOLDEN_CODIGO_BARRAS);
  });

  it('converts barras to linha', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand(
      'convert',
      BOLETO_GOLDEN_CODIGO_BARRAS,
      { json: false, quiet: false, source: false },
      'barras-to-linha',
      io,
    );
    expect(io.stdout[0]).toBe(BOLETO_GOLDEN_LINHA_STRIPPED);
  });

  it('convert json failure without inputKind', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('convert', '   ', { json: true, quiet: false, source: false }, 'linha-to-barras', io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; inputKind?: string };
    expect(parsed.ok).toBe(false);
    expect(parsed.inputKind).toBeUndefined();
  });

  it('convert json failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('convert', 'bad', { json: true, quiet: false, source: false }, 'linha-to-barras', io);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('convert human failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBoletoCommand('convert', 'bad', { json: false, quiet: false, source: false }, 'linha-to-barras', io),
    ).toBe(EXIT.INVALID);
    expect(io.stderr.length).toBeGreaterThan(0);
  });

  it('convert quiet failure', () => {
    expect(
      runBoletoCommand('convert', 'bad', { json: false, quiet: true, source: false }, 'linha-to-barras', undefined),
    ).toBe(EXIT.INVALID);
  });

  it('returns usage without direction', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBoletoCommand('convert', BOLETO_GOLDEN_LINHA_STRIPPED, { json: false, quiet: false, source: false }, undefined, io)).toBe(
      EXIT.USAGE,
    );
  });
});

describe('runBoletoCommand format and strip', () => {
  it('formats linha json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('format', BOLETO_GOLDEN_LINHA_STRIPPED, { json: true, quiet: false, source: false }, undefined, io);
    expect(JSON.parse(io.stdout[0]).formatted).toBe(BOLETO_GOLDEN_LINHA_MASKED);
  });

  it('formats linha', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('format', BOLETO_GOLDEN_LINHA_STRIPPED, { json: false, quiet: false, source: false }, undefined, io);
    expect(io.stdout[0]).toBe(BOLETO_GOLDEN_LINHA_MASKED);
  });

  it('format json invalid length', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('format', '123', { json: true, quiet: false, source: false }, undefined, io);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('format human invalid length', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('format', '123', { json: false, quiet: false, source: false }, undefined, io);
    expect(io.stderr[0]).toBe('code: INVALID_LENGTH');
  });

  it('strips linha', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('strip', BOLETO_GOLDEN_LINHA_MASKED, { json: false, quiet: false, source: false }, undefined, io);
    expect(io.stdout[0]).toBe(BOLETO_GOLDEN_LINHA_STRIPPED);
  });

  it('strip codigo json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBoletoCommand('strip', BOLETO_GOLDEN_CODIGO_BARRAS, { json: true, quiet: false, source: false }, undefined, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(BOLETO_GOLDEN_CODIGO_BARRAS);
  });
});

describe('runBoleto', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBoleto('validate', undefined, { json: false, quiet: false, source: false }, undefined, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing boleto');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBoleto('validate', undefined, { json: false, quiet: true, source: false, file: BOLETO_GOLDEN_LINHA_STRIPPED }, undefined, io),
    ).toBe(EXIT.OK);
  });
});

describe('runBoletoCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBoletoCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, undefined, io)).toBe(
      EXIT.USAGE,
    );
  });
});

describe('print helpers default io', () => {
  it('printBoletoValidation human error with inputKind', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printBoletoValidation(
      { ok: false, code: 'UNSUPPORTED_FORMAT', message: 'fail', inputKind: 'codigo-barras' },
      { json: false, quiet: false },
      io,
    );
    expect(io.stderr.some((line) => line.includes('inputKind: codigo-barras'))).toBe(true);
  });

  it('printBoletoValidation arrecadacao json and human output', () => {
    const result = validateBoleto(arrecadacaoVectors.primary.linha);
    expect(result.ok).toBe(true);
    const jsonIo = { stdout: [] as string[], stderr: [] as string[] };
    printBoletoValidation(result, { json: true, quiet: false }, jsonIo);
    const parsed = JSON.parse(jsonIo.stdout[0]) as { segment: string; valueType: string };
    expect(parsed.segment).toBe(arrecadacaoVectors.primary.segment);
    expect(parsed.valueType).toBe(arrecadacaoVectors.primary.valueType);

    const humanIo = { stdout: [] as string[], stderr: [] as string[] };
    printBoletoValidation(result, { json: false, quiet: false }, humanIo);
    expect(humanIo.stdout.some((line) => line.startsWith('segment:'))).toBe(true);
    expect(humanIo.stdout.some((line) => line.startsWith('valueType:'))).toBe(true);
  });

  it('printBoletoDetect uses default io', () => {
    expect(printBoletoDetect('linha-digitavel', { json: false, quiet: false })).toBe(EXIT.OK);
  });

  it('printBoletoConvert json success', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printBoletoConvert(
      { ok: true, value: BOLETO_GOLDEN_CODIGO_BARRAS as never, inputKind: 'codigo-barras', format: 'codigo-barras', situacao: '1' },
      { json: true, quiet: false },
      io,
    );
    expect(JSON.parse(io.stdout[0]).ok).toBe(true);
  });

  it('printBoletoFormat quiet success', () => {
    expect(printBoletoFormat(BOLETO_GOLDEN_LINHA_STRIPPED, { json: false, quiet: true })).toBe(EXIT.OK);
  });

  it('printBoletoStrip quiet', () => {
    expect(printBoletoStrip(BOLETO_GOLDEN_LINHA_MASKED, { json: false, quiet: true })).toBe(EXIT.OK);
  });
});
