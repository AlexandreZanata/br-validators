/**
 * Minimal RFC 4180 CSV column extractor for batch ETL (zero runtime deps).
 * @see docs/OFFICIAL-SOURCES.md
 */

export type ParseBatchCsvOptions = {
  col: string;
  delimiter?: string;
  skipHeader?: boolean;
};

export type ParseBatchCsvSuccess = {
  ok: true;
  values: string[];
};

export type ParseBatchCsvFailure = {
  ok: false;
  message: string;
};

export type ParseBatchCsvResult = ParseBatchCsvSuccess | ParseBatchCsvFailure;

function parseCsvRow(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === delimiter && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  fields.push(current);
  return fields;
}

function resolveColumnIndex(col: string, header: readonly string[]): number | null {
  const trimmed = col.trim();
  if (/^\d+$/.test(trimmed)) {
    const index = Number.parseInt(trimmed, 10);
    if (index >= 0 && index < header.length) {
      return index;
    }
    return null;
  }

  const index = header.findIndex((field) => field.trim().toLowerCase() === trimmed.toLowerCase());
  return index >= 0 ? index : null;
}

export function parseBatchCsv(raw: string, options: ParseBatchCsvOptions): ParseBatchCsvResult {
  const delimiter = options.delimiter ?? ',';
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { ok: false, message: 'CSV input is empty' };
  }

  const skipHeader = options.skipHeader ?? true;
  let colIdx: number;
  let startIdx = 0;

  if (skipHeader) {
    const header = parseCsvRow(lines[0], delimiter);
    const resolved = resolveColumnIndex(options.col, header);
    if (resolved === null) {
      return {
        ok: false,
        message: `Column "${options.col}" not found in header: [${header.join(', ')}]`,
      };
    }
    colIdx = resolved;
    startIdx = 1;
  } else {
    const asIndex = Number.parseInt(options.col.trim(), 10);
    if (!/^\d+$/.test(options.col.trim())) {
      return {
        ok: false,
        message: `Column "${options.col}" requires --skip-header when using header name`,
      };
    }
    colIdx = asIndex;
  }

  const values: string[] = [];
  for (let rowIndex = startIdx; rowIndex < lines.length; rowIndex += 1) {
    const row = parseCsvRow(lines[rowIndex], delimiter);
    const field = row.at(colIdx);
    if (field === undefined) {
      continue;
    }
    const cell = field.trim();
    if (cell.length > 0) {
      values.push(cell);
    }
  }

  if (values.length === 0) {
    return { ok: false, message: 'No values found in CSV column' };
  }

  return { ok: true, values };
}
