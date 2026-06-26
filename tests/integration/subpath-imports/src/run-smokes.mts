import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from '../../../../scripts/lib/errors.js';
import { runSubpathSmoke } from './smokes.js';

const packageRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const manifestPath = join(packageRoot, 'export-manifest.json');

interface ExportManifest {
  exportKeys: string[];
  exceptions: string[];
}

function loadManifest(): ExportManifest {
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as ExportManifest;
}

async function main(): Promise<void> {
  const manifest = loadManifest();
  const failures: string[] = [];

  for (const exportKey of manifest.exportKeys) {
    if (manifest.exceptions.includes(exportKey)) {
      console.log(`SKIP ${exportKey} (documented exception)`);
      continue;
    }

    try {
      await runSubpathSmoke(exportKey);
      console.log(`OK   ${exportKey}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${exportKey}: ${message}`);
      console.error(`FAIL ${exportKey}: ${message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\n${String(failures.length)} subpath smoke(s) failed`);
    process.exit(1);
  }

  console.log(`\nAll ${String(manifest.exportKeys.length)} export map entries passed`);
}

main().catch(exitWithError);
