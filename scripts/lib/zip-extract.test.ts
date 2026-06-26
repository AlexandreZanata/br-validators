import { describe, expect, it } from 'vitest';

import { extractZipEntry } from './zip-extract.js';
import { parseNfePaisesOdsArchive } from './parse-nfe-paises-ods.js';
import { fetchAspNetPortalPayload } from './fetch-nfe-portal.js';
import { NFE_PAISES_TABLE_URL } from '../../packages/br-validators/src/paises-bacen/constants.js';

describe('zip-extract', () => {
  it('extracts content.xml from NF-e ODS archives that use data descriptors', async () => {
    const { payload } = await fetchAspNetPortalPayload(NFE_PAISES_TABLE_URL);
    const contentXml = new TextDecoder('utf-8').decode(extractZipEntry(payload, 'content.xml'));
    expect(contentXml).toContain('cPais');
    const paises = parseNfePaisesOdsArchive(payload);
    expect(paises.length).toBeGreaterThanOrEqual(240);
    expect(paises.some((pais) => pais.codigo === '1058' && pais.nome.includes('BRASIL'))).toBe(true);
  }, 30_000);
});
