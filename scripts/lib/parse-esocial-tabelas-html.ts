/**
 * Parse eSocial layout tables from official gov.br HTML publications.
 * @see https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html
 */

export interface EsocialCategoriaRecord {
  codigo: string;
  grupo: string;
  descricao: string;
  inicio: string;
  termino: string | null;
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
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' '));
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeTermino(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed === '-') {
    return null;
  }
  return trimmed;
}

export function normalizeEsocialCategoriaCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(3, '0').slice(-3);
}

function extractTable01Html(html: string): string {
  const tableStart = html.indexOf('<table id="01"');
  if (tableStart < 0) {
    return '';
  }
  const tableEnd = html.indexOf('<table id="02"', tableStart);
  if (tableEnd < 0) {
    return html.slice(tableStart);
  }
  return html.slice(tableStart, tableEnd);
}

function parseTable01Rows(tableHtml: string): EsocialCategoriaRecord[] {
  const records: EsocialCategoriaRecord[] = [];
  let currentGrupo = '';
  const rowPattern = /<tr>\s*(.*?)\s*<\/tr>/gis;
  let rowMatch: RegExpExecArray | null = rowPattern.exec(tableHtml);

  while (rowMatch !== null) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>(.*?)<\/td>/gis)].map((cell) =>
      collapseWhitespace(stripHtml(cell[1])),
    );

    if (cells.length === 5) {
      currentGrupo = cells[0];
      const codigo = normalizeEsocialCategoriaCodigo(cells[1]);
      if (codigo.length === 3) {
        records.push({
          codigo,
          grupo: currentGrupo,
          descricao: cells[2],
          inicio: cells[3],
          termino: normalizeTermino(cells[4]),
        });
      }
    } else if (cells.length === 4) {
      const codigo = normalizeEsocialCategoriaCodigo(cells[0]);
      if (codigo.length === 3) {
        records.push({
          codigo,
          grupo: currentGrupo,
          descricao: cells[1],
          inicio: cells[2],
          termino: normalizeTermino(cells[3]),
        });
      }
    }

    rowMatch = rowPattern.exec(tableHtml);
  }

  return mergeCategoriaRecords(records);
}

export function mergeCategoriaRecords(records: readonly EsocialCategoriaRecord[]): EsocialCategoriaRecord[] {
  const byCode = new Map<string, EsocialCategoriaRecord>();

  for (const record of records) {
    const existing = byCode.get(record.codigo);
    if (existing === undefined || record.descricao.length > existing.descricao.length) {
      byCode.set(record.codigo, record);
    }
  }

  return [...byCode.values()].sort((left, right) => left.codigo.localeCompare(right.codigo));
}

export function parseEsocialCategoriasHtml(html: string): EsocialCategoriaRecord[] {
  const tableHtml = extractTable01Html(html);
  if (tableHtml.length === 0) {
    return [];
  }
  return parseTable01Rows(tableHtml);
}
