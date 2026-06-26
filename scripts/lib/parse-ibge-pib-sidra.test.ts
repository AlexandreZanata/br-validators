import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  buildIbgeSidraPibUrl,
  IBGE_SIDRA_PIB_TABLE,
  IBGE_SIDRA_PIB_VARIABLE,
  IBGE_SIDRA_PIB_YEAR,
  parseIbgeSidraPibJson,
  parseIbgeSidraPibPayload,
  parseIbgeSidraPibValor,
  sortSidraPibRowsByPibDesc,
} from './parse-ibge-pib-sidra.js';

const FIXTURE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures/ibge-pib-sidra-sample.json',
);

describe('parse-ibge-pib-sidra', () => {
  it('builds SIDRA PIB URL for table 5938 variable 37', () => {
    const url = buildIbgeSidraPibUrl(IBGE_SIDRA_PIB_YEAR);
    expect(url).toContain(String(IBGE_SIDRA_PIB_TABLE));
    expect(url).toContain(String(IBGE_SIDRA_PIB_VARIABLE));
    expect(url).toContain(String(IBGE_SIDRA_PIB_YEAR));
  });

  it('parses BR thousands separator and skips sentinel values', () => {
    expect(parseIbgeSidraPibValor('945946483')).toBe(945946483);
    expect(parseIbgeSidraPibValor('1.234.567')).toBe(1234567);
    expect(parseIbgeSidraPibValor('-')).toBeNull();
    expect(parseIbgeSidraPibValor('...')).toBeNull();
    expect(parseIbgeSidraPibValor('bad')).toBeNull();
  });

  it('parses fixture municipalities in descending PIB order', () => {
    const raw = readFileSync(FIXTURE_PATH, 'utf8');
    const rows = parseIbgeSidraPibJson(raw);
    expect(rows).toHaveLength(11);

    const sorted = sortSidraPibRowsByPibDesc(rows);
    expect(sorted[0]?.codigoIbge).toBe(3550308);
    expect(sorted[1]?.codigoIbge).toBe(3304557);
    expect(sorted.find((row) => row.codigoIbge === 1721000)?.pibMilReais).toBe(11951579);
    expect(sorted.find((row) => row.codigoIbge === 9999993)?.pibMilReais).toBe(1234567);
  });

  it('skips header row and invalid payload entries', () => {
    const rows = parseIbgeSidraPibPayload([
      { NC: 'Nível Territorial (Código)', D1C: 'x', V: '1' },
      { NC: '6', D1C: '3550308', V: '100' },
      { NC: '6', D1C: 'bad', V: '100' },
    ]);
    expect(rows).toEqual([{ codigoIbge: 3550308, pibMilReais: 100 }]);
    expect(() => parseIbgeSidraPibJson('{}')).toThrow('Expected SIDRA JSON array');
  });
});
