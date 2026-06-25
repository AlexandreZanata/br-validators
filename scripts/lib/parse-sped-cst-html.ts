/**
 * Parse CST rows from SPED Fiscal "Tabelas de Situação Tributária" HTML grid.
 * @see http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal
 */

export interface SpedCstRow {
  codigo: string;
  descricao: string;
  vigenciaInicio?: string;
  vigenciaFim?: string;
}

const HTML_ENTITY_PATTERN = /&(#\d+|#x[\da-fA-F]+|[a-zA-Z]+);/g;

function decodeHtmlEntities(value: string): string {
  return value.replace(HTML_ENTITY_PATTERN, (entity, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      const parsed = Number.parseInt(code.slice(2), 16);
      return Number.isNaN(parsed) ? entity : String.fromCodePoint(parsed);
    }
    if (code.startsWith('#')) {
      const parsed = Number.parseInt(code.slice(1), 10);
      return Number.isNaN(parsed) ? entity : String.fromCodePoint(parsed);
    }
    const named: Record<string, string> = {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
      nbsp: ' ',
    };
    return named[code] ?? entity;
  });
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, '').trim());
}

export function parseSpedCstGridHtml(html: string): SpedCstRow[] {
  const rows: SpedCstRow[] = [];
  const trPattern = /<tr[^>]*>(.*?)<\/tr>/gis;
  let trMatch: RegExpExecArray | null = trPattern.exec(html);

  while (trMatch !== null) {
    const trHtml = trMatch[1];
    const tdPattern = /<td[^>]*>(.*?)<\/td>/gis;
    const cells: string[] = [];
    let tdMatch: RegExpExecArray | null = tdPattern.exec(trHtml);

    while (tdMatch !== null) {
      const cell = stripHtml(tdMatch[1]);
      if (cell.length > 0) {
        cells.push(cell);
      }
      tdMatch = tdPattern.exec(trHtml);
    }

    if (cells.length >= 2 && !cells[0].startsWith('Código') && !/^[\d]$/.test(cells[0])) {
      const row: SpedCstRow = {
        codigo: cells[0],
        descricao: cells[1],
      };
      if (cells.length > 2) {
        row.vigenciaInicio = cells[2];
      }
      if (cells.length > 3) {
        row.vigenciaFim = cells[3];
      }
      rows.push(row);
    }

    trMatch = trPattern.exec(html);
  }

  return rows;
}

export interface CstRecord {
  codigo: string;
  descricao: string;
}

function pickLatestVigencia(rows: readonly SpedCstRow[]): SpedCstRow[] {
  const bestByCode = new Map<string, SpedCstRow>();

  for (const row of rows) {
    const existing = bestByCode.get(row.codigo);
    const rowVigencia = row.vigenciaInicio ?? '';
    const existingVigencia = existing?.vigenciaInicio ?? '';
    if (existing === undefined || rowVigencia.localeCompare(existingVigencia) > 0) {
      bestByCode.set(row.codigo, row);
    }
  }

  return [...bestByCode.values()].sort((left, right) => left.codigo.localeCompare(right.codigo));
}

export function normalizeCstContribRecords(rows: readonly SpedCstRow[]): CstRecord[] {
  return pickLatestVigencia(rows).map((row) => ({
    codigo: row.codigo,
    descricao: row.descricao,
  }));
}

function isSimplesNacionalDescription(descricao: string): boolean {
  return descricao.toLowerCase().includes('simples nacional');
}

export function normalizeCstIcmsRecords(rows: readonly SpedCstRow[]): CstRecord[] {
  const bestByCst = new Map<string, { origem: string; descricao: string }>();

  for (const row of rows) {
    if (row.codigo.length !== 3) {
      continue;
    }

    const origem = row.codigo.charAt(0);
    if (origem !== '0' && origem !== '1') {
      continue;
    }

    if (isSimplesNacionalDescription(row.descricao)) {
      continue;
    }

    const codigo = row.codigo.slice(-2);
    const existing = bestByCst.get(codigo);
    if (existing === undefined || origem < existing.origem) {
      bestByCst.set(codigo, { origem, descricao: row.descricao });
    }
  }

  return [...bestByCst.entries()]
    .map(([codigo, entry]) => ({ codigo, descricao: entry.descricao }))
    .sort((left, right) => left.codigo.localeCompare(right.codigo));
}

export function normalizeCstIpiRecords(rows: readonly SpedCstRow[]): CstRecord[] {
  const byCode = new Map<string, CstRecord>();

  for (const row of rows) {
    if (!byCode.has(row.codigo)) {
      byCode.set(row.codigo, { codigo: row.codigo, descricao: row.descricao });
    }
  }

  return [...byCode.values()].sort((left, right) => left.codigo.localeCompare(right.codigo));
}
