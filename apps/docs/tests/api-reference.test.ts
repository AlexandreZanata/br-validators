import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const docsRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const apiDir = join(docsRoot, 'api-reference');

describe('api-reference (TypeDoc)', () => {
  it('includes subpath module pages with exported validators', () => {
    expect(existsSync(join(apiDir, 'ncm.md'))).toBe(true);
    expect(existsSync(join(apiDir, 'cnpj.md'))).toBe(true);
    expect(existsSync(join(apiDir, 'iss-municipal.md'))).toBe(true);

    const ncm = readFileSync(join(apiDir, 'ncm.md'), 'utf8');
    expect(ncm).toContain('validateNcm');
    expect(ncm).toContain('getAllNcm');
  });
});
