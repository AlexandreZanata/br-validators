import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  PTAX_DATA_VERSION,
  PTAX_GOLDEN_USD,
  PTAX_STALE_WARNING,
} from '@br-validators/core/ptax';
import { EXIT } from '../src/constants.js';
import {
  formatPtaxCotacaoHuman,
  runPtaxLookup,
  runPtaxLookupCommand,
} from '../src/commands/ptax/lookup.js';
import {
  formatPtaxHistoricoHuman,
  runPtaxHistorico,
  runPtaxHistoricoCommand,
} from '../src/commands/ptax/historico.js';

describe('runPtaxLookupCommand', () => {
  it('prints USD último dia útil with verbose staleness metadata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-27T15:00:00.000Z'));
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxLookupCommand(PTAX_GOLDEN_USD, undefined, { json: false, verbose: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.includes('USD Fechamento PTAX'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('dataReferencia:'))).toBe(true);
    expect(io.stdout).toContain('isStale: false');
    expect(io.stdout).toContain(`capturadoEm: ${PTAX_DATA_VERSION.capturadoEm}`);
  });

  it('emits JSON with cotacao staleness fields', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-27T15:00:00.000Z'));
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxLookupCommand(PTAX_GOLDEN_USD, '2026-06-23', { json: true, verbose: true }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as {
      ok: boolean;
      cotacao: { isStale: boolean; warning?: string; dataReferencia: string };
      capturadoEm?: string;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.cotacao.isStale).toBe(true);
    expect(parsed.cotacao.warning).toBe(PTAX_STALE_WARNING);
    expect(parsed.cotacao.dataReferencia).toBe('2026-06-23');
    expect(parsed.capturadoEm).toBe(PTAX_DATA_VERSION.capturadoEm);
  });

  it('prints warning in verbose human mode for stale quotes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-27T15:00:00.000Z'));
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxLookupCommand(PTAX_GOLDEN_USD, '2026-06-23', { json: false, verbose: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout).toContain(`warning: ${PTAX_STALE_WARNING}`);
    expect(io.stdout).toContain('isStale: true');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats human output without verbose lines', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPtaxLookupCommand('EUR', undefined, { json: false, verbose: false }, io);
    expect(io.stdout).toHaveLength(1);
    expect(formatPtaxCotacaoHuman).toBeTypeOf('function');
  });

  it('rejects missing currency and unknown quotes', () => {
    const usageIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPtaxLookupCommand('   ', undefined, { json: false, verbose: false }, usageIo)).toBe(
      EXIT.USAGE,
    );

    const invalidIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPtaxLookupCommand('XYZ', undefined, { json: false, verbose: false }, invalidIo)).toBe(
      EXIT.INVALID,
    );

    const datedInvalidIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxLookupCommand('USD', '1999-01-01', { json: false, verbose: false }, datedInvalidIo),
    ).toBe(EXIT.INVALID);
    expect(datedInvalidIo.stderr[0]).toContain('1999-01-01');
  });
});

describe('runPtaxHistoricoCommand', () => {
  it('prints USD historico rows in human mode with verbose metadata', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxHistoricoCommand(
        'USD',
        '2026-06-20',
        '2026-06-26',
        { json: false, verbose: true },
        io,
      ),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('USD PTAX historico');
    expect(formatPtaxHistoricoHuman).toBeTypeOf('function');
    expect(io.stdout).toContain(`capturadoEm: ${PTAX_DATA_VERSION.capturadoEm}`);
    expect(io.stdout).toContain(`janelaDiasUteis: ${String(PTAX_DATA_VERSION.janelaDiasUteis)}`);
  });

  it('emits JSON historico payload with cotacoes array', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxHistoricoCommand(
        'USD',
        '2026-06-23',
        '2026-06-24',
        { json: true, verbose: true },
        io,
      ),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as {
      ok: boolean;
      total: number;
      cotacoes: { dataReferencia: string; isStale: boolean }[];
      janelaDiasUteis?: number;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.total).toBe(2);
    expect(parsed.cotacoes.every((row) => row.dataReferencia.length > 0)).toBe(true);
    expect(parsed.janelaDiasUteis).toBe(90);
  });

  it('rejects missing args and empty historico range', () => {
    const usageIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxHistoricoCommand('   ', '2026-06-01', '2026-06-26', { json: false, verbose: false }, usageIo),
    ).toBe(EXIT.USAGE);

    const missingRangeIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxHistoricoCommand('USD', '   ', '2026-06-26', { json: false, verbose: false }, missingRangeIo),
    ).toBe(EXIT.USAGE);

    const emptyIo = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxHistoricoCommand('USD', '1999-01-01', '1999-01-02', { json: false, verbose: false }, emptyIo),
    ).toBe(EXIT.INVALID);
  });
});

describe('runPtaxLookup', () => {
  it('delegates with moeda and optional date', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPtaxLookup('USD', undefined, { json: true, verbose: false }, io)).toBe(EXIT.OK);
    expect(runPtaxLookup('USD', '   ', { json: true, verbose: false }, io)).toBe(EXIT.OK);
  });

  it('requires moeda argument', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPtaxLookup(undefined, undefined, { json: false, verbose: false }, io)).toBe(
      EXIT.USAGE,
    );
  });
});

describe('runPtaxHistorico', () => {
  it('delegates with moeda and date range', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPtaxHistorico('USD', '2026-06-23', '2026-06-24', { json: true, verbose: false }, io),
    ).toBe(EXIT.OK);
  });

  it('requires moeda and date range arguments', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPtaxHistorico(undefined, '2026-06-01', '2026-06-26', { json: false, verbose: false }, io)).toBe(
      EXIT.USAGE,
    );
    expect(runPtaxHistorico('USD', undefined, '2026-06-26', { json: false, verbose: false }, io)).toBe(
      EXIT.USAGE,
    );
  });
});
