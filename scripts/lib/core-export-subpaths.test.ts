import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  listCoreExportSubpaths,
  readCoreExportEntries,
  resolveCorePackageJson,
} from './core-export-subpaths.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../..');

describe('core-export-subpaths', () => {
  it('lists every package.json export key including lookup subpath', () => {
    const entries = readCoreExportEntries(resolveCorePackageJson(repoRoot));
    const keys = entries.map((entry) => entry.exportKey);

    expect(keys).toContain('.');
    expect(keys).toContain('./cnpj');
    expect(keys).toContain('./ncm');
    expect(keys).toContain('./cst');
    expect(keys).toContain('./compare');
    expect(keys).toContain('./lookup');
    expect(keys).toContain('./iss-municipal');
    expect(keys.length).toBeGreaterThanOrEqual(60);
  });

  it('matches integration manifest export count', () => {
    const manifestPath = join(
      repoRoot,
      'tests/integration/subpath-imports/export-manifest.json',
    );
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      exportKeys: string[];
    };
    expect(manifest.exportKeys).toEqual(listCoreExportSubpaths(repoRoot));
  });
});
