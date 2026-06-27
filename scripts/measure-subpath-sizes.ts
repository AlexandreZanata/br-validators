import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as esbuild from 'esbuild';

import { listCoreExportSubpaths, readCoreExportEntries } from './lib/core-export-subpaths.js';
import { exitWithError } from './lib/errors.js';
import {
  buildCoreDistAlias,
  buildMeasureEntrySource,
  buildTop10Markdown,
  classifySubpathNote,
  formatMarkdownTable,
  gzipByteLength,
  resolveImportPath,
  sortSizeRowsByGzipDesc,
  type SizeReport,
  type SubpathSizeRow,
} from './lib/measure-subpath-sizes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PACKAGE_NAME = '@br-validators/core';
const OUTPUT_DIR = path.join(ROOT, 'data/bundle-sizes');
const TMP_DIR = path.join(OUTPUT_DIR, '.tmp');
const JSON_PATH = path.join(OUTPUT_DIR, 'subpath-sizes.json');
const MARKDOWN_PATH = path.join(OUTPUT_DIR, 'subpath-sizes.md');
const TOP10_PATH = path.join(OUTPUT_DIR, 'subpath-sizes-top10.md');

async function measureSubpath(
  exportKey: string,
  specifier: string,
  alias: Record<string, string>,
): Promise<SubpathSizeRow> {
  const slug = exportKey === '.' ? 'root' : exportKey.slice(2);
  const outFile = path.join(TMP_DIR, `${slug}.mjs`);
  const entrySource = buildMeasureEntrySource(PACKAGE_NAME, specifier);

  await esbuild.build({
    stdin: {
      contents: entrySource,
      resolveDir: ROOT,
      sourcefile: `measure-${slug}.mts`,
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    packages: 'bundle',
    alias,
    outfile: outFile,
    logLevel: 'silent',
  });

  const bundle = await readFile(outFile);
  const rawBytes = bundle.byteLength;
  const gzipBytes = gzipByteLength(bundle);

  return {
    exportKey,
    importPath: resolveImportPath(PACKAGE_NAME, exportKey),
    rawBytes,
    gzipBytes,
    notes: classifySubpathNote(exportKey),
  };
}

async function main(): Promise<void> {
  const corePackageJsonPath = path.join(ROOT, 'packages/br-validators/package.json');
  const corePackage = JSON.parse(await readFile(corePackageJsonPath, 'utf8')) as {
    version: string;
  };
  const entries = readCoreExportEntries(corePackageJsonPath);
  const manifestKeys = listCoreExportSubpaths(ROOT);

  if (entries.length !== manifestKeys.length) {
    throw new Error('Export manifest out of sync — run pnpm test:integration pretask sync');
  }

  await mkdir(TMP_DIR, { recursive: true });

  const alias = buildCoreDistAlias(ROOT, entries);
  const rows: SubpathSizeRow[] = [];
  for (const entry of entries) {
    rows.push(await measureSubpath(entry.exportKey, entry.specifier, alias));
  }

  const sorted = sortSizeRowsByGzipDesc(rows);
  const report: SizeReport = {
    measuredAt: new Date().toISOString(),
    coreVersion: corePackage.version,
    packageName: PACKAGE_NAME,
    toolchain: { esbuild: esbuild.version },
    rows: sorted,
  };

  const jsonIndent = 2;
  await writeFile(JSON_PATH, `${JSON.stringify(report, null, jsonIndent)}\n`);
  await writeFile(
    MARKDOWN_PATH,
    `# @br-validators/core subpath bundle sizes\n\n> Measured with \`pnpm measure:bundle-sizes\` — esbuild ESM bundle, gzip level default.\n> Sizes **include embedded JSON** for reference-data subpaths.\n\n${formatMarkdownTable(sorted)}\n`,
  );
  await writeFile(
    TOP10_PATH,
    `# Top subpaths (gzipped)\n\n${buildTop10Markdown(sorted)}\n`,
  );

  const largest = sorted[0];
  const smallest = sorted[sorted.length - 1];
  console.log(
    `Bundle sizes written: ${String(sorted.length)} subpaths (@br-validators/core@${corePackage.version})`,
  );
  console.log(
    `Range: ${smallest.importPath} ${String(smallest.gzipBytes)} B gzip .. ${largest.importPath} ${String(largest.gzipBytes)} B gzip`,
  );
  console.log(`JSON: ${JSON_PATH}`);
  console.log(`Markdown: ${MARKDOWN_PATH}`);
}

main().catch(exitWithError);
