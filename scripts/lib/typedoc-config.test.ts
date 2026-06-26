import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../..');
const typedocConfig = JSON.parse(
  readFileSync(join(repoRoot, 'typedoc.json'), 'utf8'),
) as { entryPoints: string[] };

describe('typedoc.json', () => {
  it('lists an entry point for every core subpath barrel', () => {
    expect(typedocConfig.entryPoints).toContain('packages/br-validators/src/index.ts');
    expect(typedocConfig.entryPoints).toContain('packages/br-validators/src/ncm.ts');
    expect(typedocConfig.entryPoints).toContain('packages/br-validators/src/iss-municipal.ts');
    expect(typedocConfig.entryPoints.length).toBeGreaterThanOrEqual(60);
  });
});
