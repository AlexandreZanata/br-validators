import { describe, expect, it } from 'vitest';

import {
  mergeCategoriaRecords,
  normalizeEsocialCategoriaCodigo,
  parseEsocialCategoriasHtml,
} from './parse-esocial-tabelas-html.js';

const TABLE01_FIXTURE = `
<table id="01" class="table is-fullwidth is-bordered tabela quebra-anterior">
<thead>
<tr>
<th id="t_01" colspan="5">Tabela 01 - Categorias de Trabalhadores</th>
</tr>
<tr class="grupo">
<td>GRUPO</td><td>CÓDIGO</td><td>DESCRIÇÃO</td><td>INÍCIO</td><td>TÉRMINO</td>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="3">Empregado e Trabalhador Temporário</td>
<td>101</td>
<td class="texto">Empregado - Geral, inclusive o empregado público da administração direta ou indireta contratado pela CLT</td>
<td>01/01/2014</td>
<td>-</td>
</tr>
<tr>
<td>103</td>
<td class="texto">Empregado - Aprendiz</td>
<td>01/01/2014</td>
<td>-</td>
</tr>
<tr>
<td>107</td>
<td class="texto">Empregado - Contrato de trabalho Verde e Amarelo - sem acordo</td>
<td>01/01/2020</td>
<td>31/12/2022</td>
</tr>
<tr>
<td rowspan="1">Bolsista</td>
<td>901</td>
<td class="texto">Estagiário</td>
<td>01/01/2014</td>
<td>-</td>
</tr>
</tbody>
</table>
<table id="02"></table>
`;

describe('normalizeEsocialCategoriaCodigo', () => {
  it('normalizes 3-digit worker category codes', () => {
    expect(normalizeEsocialCategoriaCodigo('101')).toBe('101');
    expect(normalizeEsocialCategoriaCodigo('1')).toBe('001');
    expect(normalizeEsocialCategoriaCodigo('abc')).toBe('');
  });
});

describe('parseEsocialCategoriasHtml', () => {
  it('parses Tabela 01 rows with grupo carry-over and open termino', () => {
    const records = parseEsocialCategoriasHtml(TABLE01_FIXTURE);
    expect(records).toEqual([
      {
        codigo: '101',
        grupo: 'Empregado e Trabalhador Temporário',
        descricao:
          'Empregado - Geral, inclusive o empregado público da administração direta ou indireta contratado pela CLT',
        inicio: '01/01/2014',
        termino: null,
      },
      {
        codigo: '103',
        grupo: 'Empregado e Trabalhador Temporário',
        descricao: 'Empregado - Aprendiz',
        inicio: '01/01/2014',
        termino: null,
      },
      {
        codigo: '107',
        grupo: 'Empregado e Trabalhador Temporário',
        descricao: 'Empregado - Contrato de trabalho Verde e Amarelo - sem acordo',
        inicio: '01/01/2020',
        termino: '31/12/2022',
      },
      {
        codigo: '901',
        grupo: 'Bolsista',
        descricao: 'Estagiário',
        inicio: '01/01/2014',
        termino: null,
      },
    ]);
  });
});

describe('mergeCategoriaRecords', () => {
  it('dedupes by codigo preferring longer descriptions', () => {
    const merged = mergeCategoriaRecords([
      {
        codigo: '101',
        grupo: 'Empregado e Trabalhador Temporário',
        descricao: 'Short',
        inicio: '01/01/2014',
        termino: null,
      },
      {
        codigo: '101',
        grupo: 'Empregado e Trabalhador Temporário',
        descricao: 'Empregado - Geral, inclusive o empregado público',
        inicio: '01/01/2014',
        termino: null,
      },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].descricao.startsWith('Empregado - Geral')).toBe(true);
  });
});
