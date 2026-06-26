import { describe, expect, it, vi } from 'vitest';
import { EXIT } from '../src/constants.js';
import { CPF_GOLDEN_PRIMARY } from '@br-validators/core';

const readFileSyncMock = vi.hoisted(() => vi.fn());

vi.mock('node:module', () => ({
  createRequire: () => () => ({
    readFileSync: readFileSyncMock,
  }),
}));

import { handleBatchCli, readStdinSync } from '../src/handlers.js';

describe('handlers stdin (mocked fs via createRequire)', () => {
  it('readStdinSync reports failure', () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });
    readFileSyncMock.mockImplementation(() => {
      throw new Error('stdin read failed');
    });
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(readStdinSync(io)).toBeNull();
    expect(io.stderr[0]).toContain('Cannot read stdin');
    delete (process.stdin as { isTTY?: boolean }).isTTY;
  });

  it('handleBatchCli reads stdin when piped', () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });
    readFileSyncMock.mockReturnValue(`${CPF_GOLDEN_PRIMARY}\n`);
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBatchCli('cpf', { quiet: true }, io)).toBe(EXIT.OK);
    delete (process.stdin as { isTTY?: boolean }).isTTY;
  });

  it('returns null on TTY', () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(readStdinSync(io)).toBeNull();
    delete (process.stdin as { isTTY?: boolean }).isTTY;
  });
});
