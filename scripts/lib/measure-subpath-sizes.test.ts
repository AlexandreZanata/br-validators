import { describe, expect, it } from 'vitest';

import {
  buildCoreDistAlias,
  buildMeasureEntrySource,
  buildTop10Markdown,
  classifySubpathNote,
  formatKiB,
  formatMarkdownTable,
  gzipByteLength,
  isSizeReportRow,
  parseSizeReportJson,
  resolveCoreDistFile,
  resolveImportPath,
  sortSizeRowsByGzipDesc,
  TOP_SUBPATH_HIGHLIGHTS,
  type SubpathSizeRow,
} from './measure-subpath-sizes.js';

const SAMPLE_ROWS: SubpathSizeRow[] = [
  {
    exportKey: './ncm',
    importPath: '@br-validators/core/ncm',
    rawBytes: 200_000,
    gzipBytes: 50_000,
    notes: 'includes embed',
  },
  {
    exportKey: './cpf',
    importPath: '@br-validators/core/cpf',
    rawBytes: 8_000,
    gzipBytes: 2_500,
    notes: 'validator only',
  },
  {
    exportKey: '.',
    importPath: '@br-validators/core',
    rawBytes: 5_000_000,
    gzipBytes: 900_000,
    notes: 'full barrel (all subpaths)',
  },
];

describe('buildMeasureEntrySource', () => {
  it('builds root and subpath import entries', () => {
    expect(buildMeasureEntrySource('@br-validators/core', '')).toContain(
      "from '@br-validators/core'",
    );
    expect(buildMeasureEntrySource('@br-validators/core', '/cpf')).toContain(
      "from '@br-validators/core/cpf'",
    );
  });
});

describe('resolveCoreDistFile', () => {
  it('maps export keys to dist bundle paths', () => {
    expect(resolveCoreDistFile('/repo', '.', '')).toBe('/repo/packages/br-validators/dist/index.js');
    expect(resolveCoreDistFile('/repo', './cpf', '/cpf')).toBe(
      '/repo/packages/br-validators/dist/cpf.js',
    );
  });
});

describe('buildCoreDistAlias', () => {
  it('builds esbuild alias map for root and subpaths', () => {
    const alias = buildCoreDistAlias('/repo', [
      { exportKey: '.', specifier: '' },
      { exportKey: './cpf', specifier: '/cpf' },
    ]);
    expect(alias['@br-validators/core']).toBe('/repo/packages/br-validators/dist/index.js');
    expect(alias['@br-validators/core/cpf']).toBe('/repo/packages/br-validators/dist/cpf.js');
  });
});

describe('resolveImportPath', () => {
  it('maps export keys to import paths', () => {
    expect(resolveImportPath('@br-validators/core', '.')).toBe('@br-validators/core');
    expect(resolveImportPath('@br-validators/core', './ncm')).toBe('@br-validators/core/ncm');
  });
});

describe('classifySubpathNote', () => {
  it('classifies embed, platform, validator, and barrel subpaths', () => {
    expect(classifySubpathNote('./ncm')).toBe('includes embed');
    expect(classifySubpathNote('./sanitize')).toBe('platform utilities');
    expect(classifySubpathNote('./cpf')).toBe('validator only');
    expect(classifySubpathNote('.')).toBe('full barrel (all subpaths)');
  });
});

describe('formatKiB', () => {
  it('formats bytes as kilobytes with one decimal', () => {
    expect(formatKiB(2048)).toBe('2.0 KB');
    expect(formatKiB(1536)).toBe('1.5 KB');
  });
});

describe('gzipByteLength', () => {
  it('returns gzip-compressed length', () => {
    const payload = Buffer.from('a'.repeat(1000));
    expect(gzipByteLength(payload)).toBeLessThan(payload.byteLength);
  });
});

describe('sortSizeRowsByGzipDesc', () => {
  it('sorts rows by gzip size descending', () => {
    const sorted = sortSizeRowsByGzipDesc(SAMPLE_ROWS);
    expect(sorted[0].exportKey).toBe('.');
    expect(sorted[sorted.length - 1].exportKey).toBe('./cpf');
  });
});

describe('formatMarkdownTable', () => {
  it('renders markdown table with subpath and size columns', () => {
    const table = formatMarkdownTable([SAMPLE_ROWS[1]]);
    expect(table).toContain('`@br-validators/core/cpf`');
    expect(table).toContain('2.4 KB');
    expect(table).toContain('validator only');
  });
});

describe('buildTop10Markdown', () => {
  it('includes only highlighted export keys in stable order', () => {
    const rows: SubpathSizeRow[] = TOP_SUBPATH_HIGHLIGHTS.map((exportKey, index) => ({
      exportKey,
      importPath: resolveImportPath('@br-validators/core', exportKey),
      rawBytes: 1000 + index,
      gzipBytes: 500 + index,
      notes: classifySubpathNote(exportKey),
    }));
    const markdown = buildTop10Markdown(rows);
    expect(markdown.split('\n').filter((line) => line.startsWith('| `@br-validators/core')).length).toBe(
      TOP_SUBPATH_HIGHLIGHTS.length,
    );
    expect(markdown.indexOf('/cpf')).toBeLessThan(markdown.indexOf('/ncm'));
  });
});

describe('parseSizeReportJson', () => {
  it('parses valid report JSON', () => {
    const report = parseSizeReportJson(
      JSON.stringify({
        measuredAt: '2026-06-27T00:00:00.000Z',
        coreVersion: '1.9.0',
        packageName: '@br-validators/core',
        toolchain: { esbuild: '0.25.12' },
        rows: SAMPLE_ROWS,
      }),
    );
    expect(report.rows).toHaveLength(3);
    expect(report.coreVersion).toBe('1.9.0');
  });

  it('rejects malformed report JSON', () => {
    expect(() => parseSizeReportJson('{"measuredAt":"x"}')).toThrow('Invalid size report JSON');
  });
});

describe('isSizeReportRow', () => {
  it('validates row shape', () => {
    expect(isSizeReportRow(SAMPLE_ROWS[0])).toBe(true);
    expect(isSizeReportRow({ exportKey: 'x' })).toBe(false);
  });
});
