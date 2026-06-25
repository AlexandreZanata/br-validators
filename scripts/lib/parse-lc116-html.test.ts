import { describe, expect, it } from 'vitest';

import {
  normalizeLc116Codigo,
  parseNfseLc116ListHtml,
  parsePlanaltoLc116Text,
} from './parse-lc116-html.js';

const PLANALTO_FIXTURE = `
LISTA DE SERVIÇOS ANEXA À LEI COMPLEMENTAR Nº 116, DE 31 DE JULHO DE 2003
1 - Serviços de informática e congêneres.
1.01 - Análise e desenvolvimento de sistemas.
1.02 - Programação.
7.02 - Execução, por administração, empreitada ou subempreitada, de obras de construção
civil, hidráulica ou elétrica e de outras obras semelhantes.
`;

const NFSE_FIXTURE = `
| 010101 - Análise e desenvolvimento de sistemas. |
| 010201 - Programação. |
| 010301 - Processamento de dados, textos, imagens, vídeos, páginas eletrônicas, aplicativos e sistemas de informação, entre outros formatos, e congêneres. |
| 010302 - Armazenamento ou hospedagem de dados, textos, imagens, vídeos, páginas eletrônicas, aplicativos e sistemas de informação, entre outros formatos, e congêneres. |
| 070201 - Execução, por administração, empreitada ou subempreitada, de obras de construção civil. |
`;

describe('normalizeLc116Codigo', () => {
  it('normalizes dotted and NFSe 6-digit codes', () => {
    expect(normalizeLc116Codigo('1.01')).toBe('1.01');
    expect(normalizeLc116Codigo('01.01')).toBe('1.01');
    expect(normalizeLc116Codigo('7.2')).toBe('7.02');
    expect(normalizeLc116Codigo('010101')).toBe('1.01');
    expect(normalizeLc116Codigo('070201')).toBe('7.02');
    expect(normalizeLc116Codigo('abc')).toBe('');
  });
});

describe('parsePlanaltoLc116Text', () => {
  it('parses annex lines and joins wrapped descriptions', () => {
    const records = parsePlanaltoLc116Text(PLANALTO_FIXTURE);
    expect(records).toEqual([
      { codigo: '1.01', descricao: 'Análise e desenvolvimento de sistemas' },
      { codigo: '1.02', descricao: 'Programação' },
      {
        codigo: '7.02',
        descricao:
          'Execução, por administração, empreitada ou subempreitada, de obras de construção civil, hidráulica ou elétrica e de outras obras semelhantes',
      },
    ]);
  });
});

describe('parseNfseLc116ListHtml', () => {
  it('parses NFSe 6-digit codes into LC 116 dotted format with dedupe preference', () => {
    const records = parseNfseLc116ListHtml(NFSE_FIXTURE);
    expect(records).toEqual([
      { codigo: '1.01', descricao: 'Análise e desenvolvimento de sistemas' },
      { codigo: '1.02', descricao: 'Programação' },
      {
        codigo: '1.03',
        descricao:
          'Armazenamento ou hospedagem de dados, textos, imagens, vídeos, páginas eletrônicas, aplicativos e sistemas de informação, entre outros formatos, e congêneres',
      },
      {
        codigo: '7.02',
        descricao:
          'Execução, por administração, empreitada ou subempreitada, de obras de construção civil',
      },
    ]);
  });
});
