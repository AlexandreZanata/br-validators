/**
 * Bundle size helpers — esbuild raw + gzip per @br-validators/core subpath.
 */

import path from 'node:path';
import { gzipSync } from 'node:zlib';

export interface SubpathSizeRow {
  exportKey: string;
  importPath: string;
  rawBytes: number;
  gzipBytes: number;
  notes: string;
}

export interface SizeReport {
  measuredAt: string;
  coreVersion: string;
  packageName: string;
  toolchain: { esbuild: string };
  rows: SubpathSizeRow[];
}

export const TOP_SUBPATH_HIGHLIGHTS: readonly string[] = [
  './cpf',
  './cnpj',
  './cep',
  './ncm',
  './cfop',
  './cst',
  './pix',
  './ptax',
  './ibge',
  './sanitize',
];

const EMBED_SUBPATHS = new Set<string>([
  './aeroportos',
  './anp-combustiveis',
  './bancos',
  './cbo',
  './cest',
  './cfop',
  './cnaes',
  './cnpj-motivos',
  './csosn',
  './cst',
  './data-catalog',
  './esocial',
  './feriados',
  './ibge',
  './ibpt',
  './incoterms',
  './inss',
  './irpf',
  './iss-municipal',
  './lc116',
  './moedas',
  './natureza-juridica',
  './nbs',
  './ncm',
  './nfe-cuf',
  './paises-bacen',
  './pncp-reference',
  './portos',
  './ptax',
  './selic',
  './simples-nacional',
  './transparencia-snapshots',
  './tse-municipios',
]);

const PLATFORM_SUBPATHS = new Set<string>([
  './batch',
  './compare',
  './detect',
  './diff',
  './generate',
  './lookup',
  './mask',
  './sanitize',
]);

export function buildMeasureEntrySource(packageName: string, specifier: string): string {
  const importPath = specifier.length === 0 ? packageName : `${packageName}${specifier}`;
  return `import * as mod from '${importPath}';\nexport default mod;\n`;
}

export function resolveImportPath(packageName: string, exportKey: string): string {
  if (exportKey === '.') {
    return packageName;
  }
  return `${packageName}${exportKey.slice(1)}`;
}

export function resolveCoreDistFile(repoRoot: string, exportKey: string, specifier: string): string {
  const distDir = path.join(repoRoot, 'packages/br-validators/dist');
  if (exportKey === '.') {
    return path.join(distDir, 'index.js');
  }
  const subpath = specifier.startsWith('/') ? specifier.slice(1) : specifier;
  return path.join(distDir, `${subpath}.js`);
}

export function buildCoreDistAlias(
  repoRoot: string,
  entries: readonly { exportKey: string; specifier: string }[],
  packageName: string = '@br-validators/core',
): Record<string, string> {
  const alias: Record<string, string> = {};
  for (const entry of entries) {
    alias[resolveImportPath(packageName, entry.exportKey)] = resolveCoreDistFile(
      repoRoot,
      entry.exportKey,
      entry.specifier,
    );
  }
  return alias;
}

export function classifySubpathNote(exportKey: string): string {
  if (exportKey === '.') {
    return 'full barrel (all subpaths)';
  }
  if (EMBED_SUBPATHS.has(exportKey)) {
    return 'includes embed';
  }
  if (PLATFORM_SUBPATHS.has(exportKey)) {
    return 'platform utilities';
  }
  return 'validator only';
}

export function formatKiB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function gzipByteLength(data: Buffer | Uint8Array): number {
  return gzipSync(data).byteLength;
}

export function sortSizeRowsByGzipDesc(rows: readonly SubpathSizeRow[]): SubpathSizeRow[] {
  return [...rows].sort((left, right) => {
    if (right.gzipBytes !== left.gzipBytes) {
      return right.gzipBytes - left.gzipBytes;
    }
    return left.exportKey.localeCompare(right.exportKey);
  });
}

export function formatMarkdownTable(rows: readonly SubpathSizeRow[]): string {
  const header = '| Subpath | Raw (esbuild) | Gzip | Notes |';
  const separator = '|---------|---------------|------|-------|';
  const lines = rows.map(
    (row) =>
      `| \`${row.importPath}\` | ${formatKiB(row.rawBytes)} | ${formatKiB(row.gzipBytes)} | ${row.notes} |`,
  );
  return [header, separator, ...lines].join('\n');
}

export function buildTop10Markdown(
  rows: readonly SubpathSizeRow[],
  highlightKeys: readonly string[] = TOP_SUBPATH_HIGHLIGHTS,
): string {
  const byKey = new Map(rows.map((row) => [row.exportKey, row]));
  const highlighted = highlightKeys
    .map((key) => byKey.get(key))
    .filter((row): row is SubpathSizeRow => row !== undefined);
  return formatMarkdownTable(highlighted);
}

export function parseSizeReportJson(raw: string): SizeReport {
  const parsed = JSON.parse(raw) as SizeReport;
  if (typeof parsed.measuredAt !== 'string' || !Array.isArray(parsed.rows)) {
    throw new Error('Invalid size report JSON');
  }
  return parsed;
}

export function isSizeReportRow(value: object): value is SubpathSizeRow {
  const row = value as SubpathSizeRow;
  return (
    typeof row.exportKey === 'string' &&
    typeof row.importPath === 'string' &&
    typeof row.rawBytes === 'number' &&
    typeof row.gzipBytes === 'number' &&
    typeof row.notes === 'string'
  );
}
