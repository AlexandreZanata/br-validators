import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { parseNfePaisesOdsArchive } from './parse-nfe-paises-ods.js';
import { extractZipEntry } from './zip-extract.js';

const FIXTURE_ZIP = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/nfe-paises-minimal.zip');

describe('zip-extract', () => {
  it('extracts content.xml from NF-e ODS archives that use data descriptors', () => {
    const payload = new Uint8Array(readFileSync(FIXTURE_ZIP));
    const contentXml = new TextDecoder('utf-8').decode(extractZipEntry(payload, 'content.xml'));
    expect(contentXml).toContain('1058');
    const paises = parseNfePaisesOdsArchive(payload);
    expect(paises).toEqual([{ codigo: '1058', nome: 'BRASIL' }]);
  });
});
