import { describe, expect, it } from 'vitest';

import {
  buildSelicRequestUrl,
  mergeSelicRecords,
  parseSelicRows,
  parseSgsIsoDate,
  parseSgsValor,
  resolveSelicPeriodBounds,
  subtractCalendarDays,
} from './selic-sgs-api.js';

describe('selic-sgs-api', () => {
  it('parses SGS date and valor', () => {
    expect(parseSgsIsoDate('18/06/2026')).toBe('2026-06-18');
    expect(parseSgsIsoDate('2026-06-18')).toBe('2026-06-18');
    expect(parseSgsValor('14.25')).toBe(14.25);
    expect(parseSgsValor('bad')).toBeNull();
  });

  it('builds request URL for period', () => {
    const url = buildSelicRequestUrl('2026-03-29', '2026-06-26');
    expect(url).toContain('dataInicial=29/03/2026');
    expect(url).toContain('dataFinal=26/06/2026');
  });

  it('resolves rolling calendar window', () => {
    const bounds = resolveSelicPeriodBounds(new Date('2026-06-26T12:00:00.000Z'), 90);
    expect(bounds?.dataFinal).toBe('2026-06-26');
    expect(bounds?.dataInicial).toBe('2026-03-29');
    expect(subtractCalendarDays('2026-06-26', 1)).toBe('2026-06-25');
  });

  it('merges parsed rows by date', () => {
    const rows = parseSelicRows([
      { data: '01/06/2026', valor: '14.50' },
      { data: '02/06/2026', valor: '14.50' },
    ]);
    expect(rows.length).toBe(2);
    expect(mergeSelicRecords([...rows, { data: '2026-06-01', valor: 14.5 }]).length).toBe(2);
  });

  it('skips invalid rows when parsing SGS payload', () => {
    expect(parseSelicRows([{ data: 'bad', valor: '14.25' }, { data: '01/06/2026', valor: 'x' }])).toEqual([]);
    expect(buildSelicRequestUrl('bad', '2026-06-26')).toBe('');
    expect(subtractCalendarDays('bad', 1)).toBe('bad');
  });
});
