/**
 * Read @br-validators/core package.json export subpaths (excluding types-only).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface CoreExportEntry {
  /** Import specifier suffix: '' for root, '/cnpj' for subpath */
  specifier: string;
  /** Export map key: '.' or './cnpj' */
  exportKey: string;
}

export function readCoreExportEntries(corePackageJsonPath: string): CoreExportEntry[] {
  const pkg = JSON.parse(readFileSync(corePackageJsonPath, 'utf8')) as {
    exports?: Record<string, { import?: string; types?: string }>;
  };

  const exportsMap = pkg.exports;
  if (exportsMap === undefined) {
    throw new Error(`Missing exports in ${corePackageJsonPath}`);
  }

  return Object.keys(exportsMap)
    .sort((left, right) => left.localeCompare(right))
    .map((exportKey) => ({
      exportKey,
      specifier: exportKey === '.' ? '' : exportKey.slice(1),
    }));
}

export function resolveCorePackageJson(repoRoot: string): string {
  return join(repoRoot, 'packages/br-validators/package.json');
}

export function listCoreExportSubpaths(repoRoot: string): string[] {
  return readCoreExportEntries(resolveCorePackageJson(repoRoot)).map((entry) => entry.exportKey);
}
