import { describe, expect, it } from 'vitest';

import { mergePaisesBacenRecords, parseNfePaisesTable } from './parse-nfe-paises.js';

describe('parseNfePaisesTable', () => {
  it('parses pipe-delimited NF-e rows', () => {
    const records = parseNfePaisesTable('1058|Brasil\n0132|Afeganistão');
    expect(records).toEqual([
      { codigo: '0132', nome: 'Afeganistão' },
      { codigo: '1058', nome: 'Brasil' },
    ]);
  });

  it('parses Bacen FTP space-separated rows', () => {
    const records = parseNfePaisesTable('00132 AFEGANISTAO\n01058 BRASIL');
    expect(records).toEqual([
      { codigo: '0132', nome: 'AFEGANISTAO' },
      { codigo: '1058', nome: 'BRASIL' },
    ]);
  });
});

describe('mergePaisesBacenRecords', () => {
  it('prefers primary names over supplemental duplicates', () => {
    const merged = mergePaisesBacenRecords(
      [{ codigo: '1058', nome: 'BRASIL' }],
      [{ codigo: '1058', nome: 'Brasil (old)' }, { codigo: '0132', nome: 'Afeganistão' }],
    );
    expect(merged).toEqual([
      { codigo: '0132', nome: 'Afeganistão' },
      { codigo: '1058', nome: 'BRASIL' },
    ]);
  });
});
