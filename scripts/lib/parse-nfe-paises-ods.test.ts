import { describe, expect, it } from 'vitest';

import { parseNfePaisesOdsContent } from './parse-nfe-paises-ods.js';

const FIXTURE_XML = `
<table:table table:name="Paises">
  <table:table-row>
    <table:table-cell><text:p>0132</text:p></table:table-cell>
    <table:table-cell><text:p>AFEGANISTAO</text:p></table:table-cell>
    <table:table-cell><text:p>01/01/2006</text:p></table:table-cell>
  </table:table-row>
  <table:table-row>
    <table:table-cell><text:p>1058</text:p></table:table-cell>
    <table:table-cell><text:p>BRASIL</text:p></table:table-cell>
    <table:table-cell><text:p>01/01/2006</text:p></table:table-cell>
  </table:table-row>
  <table:table-row>
    <table:table-cell><text:p>9999</text:p></table:table-cell>
    <table:table-cell><text:p>PAIS EXCLUIDO</text:p></table:table-cell>
    <table:table-cell><text:p>EXCLUÍDO</text:p></table:table-cell>
    <table:table-cell><text:p>01/01/2020</text:p></table:table-cell>
  </table:table-row>
</table:table>
`;

describe('parseNfePaisesOdsContent', () => {
  it('extracts active countries and skips EXCLUÍDO rows', () => {
    const records = parseNfePaisesOdsContent(FIXTURE_XML);
    expect(records).toEqual([
      { codigo: '0132', nome: 'AFEGANISTAO' },
      { codigo: '1058', nome: 'BRASIL' },
    ]);
  });
});
