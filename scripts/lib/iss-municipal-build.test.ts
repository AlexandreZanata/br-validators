import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ISS_MUNICIPAL_CAPITAL_IBGE_CODES } from './iss-municipal-capital-seeds.js';
import {
  ISS_MUNICIPAL_TARGET_COUNT,
  buildIssMunicipalEmbed,
  buildMunicipioNameIndex,
} from './iss-municipal-build.js';
import type { IbgePibMunicipioRow } from './parse-ibge-pib-top-municipios.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');

interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

function syntheticPibTopRows(municipios: readonly MunicipioRecord[]): IbgePibMunicipioRow[] {
  const capitalSet = new Set(ISS_MUNICIPAL_CAPITAL_IBGE_CODES);
  const needed = ISS_MUNICIPAL_TARGET_COUNT - ISS_MUNICIPAL_CAPITAL_IBGE_CODES.length;
  return municipios
    .filter((municipio) => !capitalSet.has(municipio.codigo))
    .slice(0, needed)
    .map((municipio, index) => ({
      pibRank: index + 1,
      nome: municipio.nome,
      uf: municipio.uf,
    }));
}

describe('iss-municipal build', () => {
  it('lists 27 capital IBGE codes', () => {
    expect(ISS_MUNICIPAL_CAPITAL_IBGE_CODES).toHaveLength(27);
  });

  it('indexes municipios by normalized nome and UF', () => {
    const index = buildMunicipioNameIndex([
      { codigo: 1, nome: 'São Paulo', uf: 'SP' },
      { codigo: 2, nome: 'Campinas', uf: 'SP' },
    ]);
    expect(index.size).toBe(2);
    expect(index.get('sao paulo|SP')?.codigo).toBe(1);
    expect(index.get('campinas|SP')?.codigo).toBe(2);
  });

  it('builds 100-row embed from capitals and synthetic PIB rows', () => {
    const municipios = JSON.parse(readFileSync(MUNICIPIOS_PATH, 'utf8')) as MunicipioRecord[];
    const pibTopRows = syntheticPibTopRows(municipios);
    expect(pibTopRows.length).toBe(ISS_MUNICIPAL_TARGET_COUNT - ISS_MUNICIPAL_CAPITAL_IBGE_CODES.length);

    const rows = buildIssMunicipalEmbed({
      municipios,
      pibTopRows,
      capturadoEm: '2026-06-26',
    });

    expect(rows).toHaveLength(ISS_MUNICIPAL_TARGET_COUNT);
    expect(rows.filter((row) => !row.estimativa)).toHaveLength(27);
    expect(rows.some((row) => row.codigoIbge === 3550308)).toBe(true);
    expect(rows.some((row) => row.estimativa)).toBe(true);
  });
});
