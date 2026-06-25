/**
 * Parse LC 116/2003 ISS service list from official federal publications.
 * @see https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm
 * @see https://www.gov.br/nfse/pt-br/mei-e-demais-empresas/codigos-de-tributacao-nacional-nbs
 */

export interface Lc116Record {
  codigo: string;
  descricao: string;
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

export function normalizeLc116Codigo(codigo: string): string {
  const trimmed = codigo.trim();
  const dotted = /^(\d{1,2})\.(\d{1,2})$/u.exec(trimmed);
  if (dotted !== null) {
    const item = String(Number.parseInt(dotted[1], 10));
    const sub = dotted[2].padStart(2, '0');
    return `${item}.${sub}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 6) {
    const item = String(Number.parseInt(digits.slice(0, 2), 10));
    const sub = digits.slice(2, 4);
    return `${item}.${sub}`;
  }

  return '';
}

function isCategoryHeaderLine(line: string): boolean {
  return /^\d{1,2}\s*[-–]\s*[A-Za-zÀ-ÿ]/u.test(line) && !/^\d{1,2}\.\d{2}/u.test(line);
}

function mergeRecords(records: readonly Lc116Record[]): Lc116Record[] {
  const byCode = new Map<string, Lc116Record>();

  for (const record of records) {
    const existing = byCode.get(record.codigo);
    if (existing === undefined || record.descricao.length > existing.descricao.length) {
      byCode.set(record.codigo, record);
    }
  }

  return [...byCode.values()].sort((left, right) => {
    const [leftItem, leftSub] = left.codigo.split('.');
    const [rightItem, rightSub] = right.codigo.split('.');
    const itemCompare = Number.parseInt(leftItem, 10) - Number.parseInt(rightItem, 10);
    if (itemCompare !== 0) {
      return itemCompare;
    }
    return Number.parseInt(leftSub, 10) - Number.parseInt(rightSub, 10);
  });
}

export function parsePlanaltoLc116Text(text: string): Lc116Record[] {
  const records: Lc116Record[] = [];
  let current: Lc116Record | null = null;

  for (const rawLine of text.split('\n')) {
    const line = collapseWhitespace(rawLine);
    if (line.length === 0 || isCategoryHeaderLine(line)) {
      continue;
    }

    const newItemMatch = /^(\d{1,2})\.(\d{2})\s*[-–]\s*(.*)$/u.exec(line);
    if (newItemMatch !== null) {
      if (current !== null) {
        records.push(current);
      }

      const codigo = normalizeLc116Codigo(`${newItemMatch[1]}.${newItemMatch[2]}`);
      const descricao = newItemMatch[3].replace(/\.\s*$/u, '').trim();
      if (codigo.length > 0 && descricao.length >= 3) {
        current = { codigo, descricao };
      } else {
        current = null;
      }
      continue;
    }

    if (current !== null) {
      const continuation = line.replace(/\.\s*$/u, '').trim();
      if (continuation.length > 0) {
        current = { codigo: current.codigo, descricao: `${current.descricao} ${continuation}` };
      }
    }
  }

  if (current !== null) {
    records.push(current);
  }

  return mergeRecords(records);
}

export function parsePlanaltoLc116Html(html: string): Lc116Record[] {
  const annexMarker = /lista de servi[cç]os anexa/i;
  const match = annexMarker.exec(html);
  const annexHtml = match !== null ? html.slice(match.index) : html;
  const text = collapseWhitespace(stripHtml(annexHtml));
  return parsePlanaltoLc116Text(text.replace(/(\d{1,2}\.\d{2}\s*[-–])/gu, '\n$1'));
}

export function parseNfseLc116ListHtml(html: string): Lc116Record[] {
  const pattern = /(\d{6})\s*[-–]\s*([^<|]+)/gu;
  const records: Lc116Record[] = [];
  let match: RegExpExecArray | null = pattern.exec(html);

  while (match !== null) {
    const codigo = normalizeLc116Codigo(match[1]);
    const descricao = collapseWhitespace(stripHtml(match[2])).replace(/\.\s*$/u, '');
    if (codigo.length > 0 && descricao.length >= 3 && !descricao.includes('->')) {
      records.push({ codigo, descricao });
    }
    match = pattern.exec(html);
  }

  return mergeRecords(records);
}
