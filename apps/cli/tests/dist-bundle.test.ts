import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('dist bundle', () => {
  it('has exactly one shebang line for ESM bin compatibility', () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const dist = readFileSync(join(dir, '../dist/index.js'), 'utf8');
    const shebangs = dist.split('\n').filter((line) => line.startsWith('#!'));
    expect(shebangs).toEqual(['#!/usr/bin/env node']);
  });

  it('batch reads --file via dist entry', () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const cli = join(dir, '../dist/index.js');
    const batchDir = mkdtempSync(join(tmpdir(), 'br-validators-dist-batch-'));
    const batchFile = join(batchDir, 'values.txt');
    writeFileSync(batchFile, '12345678909\nbad\n', 'utf8');
    const result = spawnSync('node', [cli, 'batch', 'cpf', '--file', batchFile, '--json'], {
      encoding: 'utf8',
    });
    expect(result.status).toBe(1);
    const parsed = JSON.parse(result.stdout) as { summary: { valid: number; invalid: number } };
    expect(parsed.summary).toEqual({ total: 2, valid: 1, invalid: 1 });
  });

  it('batch reads stdin via dist entry', () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const cli = join(dir, '../dist/index.js');
    const result = spawnSync('node', [cli, 'batch', 'cpf', '--json'], {
      encoding: 'utf8',
      input: '12345678909\n123.456.789-09\n',
    });
    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout) as { summary: { valid: number; invalid: number } };
    expect(parsed.summary).toEqual({ total: 2, valid: 2, invalid: 0 });
  });
});
