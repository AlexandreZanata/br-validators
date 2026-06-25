import { describe, expect, it } from 'vitest';

import {
  normalizeCstContribRecords,
  normalizeCstIcmsRecords,
  normalizeCstIpiRecords,
  parseSpedCstGridHtml,
} from './parse-sped-cst-html.js';

const FIXTURE_HTML = `
<table>
  <tr><td>Código</td><td>Descrição</td><td>Vigência Início</td><td>Vigência Fim</td></tr>
  <tr><td>000</td><td>Nacional - Tributada integralmente</td><td>01012009</td><td>31122012</td></tr>
  <tr><td>100</td><td>Estrangeira - Tributada integralmente</td><td>01012009</td><td>31122012</td></tr>
  <tr><td>201</td><td>Simples Nacional - Tributada pelo Simples Nacional</td><td>01012009</td><td>31122012</td></tr>
  <tr><td>50</td><td>Saída tributada</td><td>01012009</td><td></td></tr>
  <tr><td>01</td><td>Operação Tributável - Base antiga</td><td>01012009</td><td>15122009</td></tr>
  <tr><td>01</td><td>Operação Tributável com Alíquota Básica</td><td>16122009</td><td></td></tr>
</table>
`;

describe('parseSpedCstGridHtml', () => {
  it('parses SPED grid rows with optional vigência columns', () => {
    const rows = parseSpedCstGridHtml(FIXTURE_HTML);
    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({
      codigo: '000',
      descricao: 'Nacional - Tributada integralmente',
      vigenciaInicio: '01012009',
      vigenciaFim: '31122012',
    });
  });
});

describe('normalizeCstIcmsRecords', () => {
  it('maps SPED 3-digit rows to NF-e 2-digit CST excluding Simples Nacional', () => {
    const rows = parseSpedCstGridHtml(FIXTURE_HTML);
    const normalized = normalizeCstIcmsRecords(rows);
    expect(normalized).toEqual([
      { codigo: '00', descricao: 'Nacional - Tributada integralmente' },
    ]);
  });
});

describe('normalizeCstIpiRecords', () => {
  it('deduplicates IPI rows by code', () => {
    const ipiFixture = `
<table>
  <tr><td>50</td><td>Saída tributada</td><td>01012009</td></tr>
  <tr><td>50</td><td>Saída tributada duplicada</td><td>01012009</td></tr>
</table>
`;
    const rows = parseSpedCstGridHtml(ipiFixture);
    const normalized = normalizeCstIpiRecords(rows);
    expect(normalized).toEqual([{ codigo: '50', descricao: 'Saída tributada' }]);
  });
});

describe('normalizeCstContribRecords', () => {
  it('keeps the latest vigência row per PIS/COFINS code', () => {
    const contribFixture = `
<table>
  <tr><td>01</td><td>Operação Tributável - Base antiga</td><td>01012009</td><td>15122009</td></tr>
  <tr><td>01</td><td>Operação Tributável com Alíquota Básica</td><td>16122009</td><td></td></tr>
</table>
`;
    const rows = parseSpedCstGridHtml(contribFixture);
    const normalized = normalizeCstContribRecords(rows);
    expect(normalized).toEqual([
      { codigo: '01', descricao: 'Operação Tributável com Alíquota Básica' },
    ]);
  });
});
