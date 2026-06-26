import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

import { exitWithError } from '../../../../scripts/lib/errors.js';

const packageRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const entryPath = join(packageRoot, 'src/entry-cnpj-only.mts');
const outDir = join(packageRoot, '.tmp');
const outFile = join(outDir, 'bundle-cnpj.mjs');
const metaFile = join(outDir, 'bundle-cnpj-meta.json');

const forbiddenInputFragments = [
  '/dist/boleto.js',
  '/dist/pix.js',
  '/dist/index.js',
  '/dist/cpf.js',
];

async function main(): Promise<void> {
  mkdirSync(outDir, { recursive: true });

  const result = await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    format: 'esm',
    platform: 'node',
    packages: 'bundle',
    outfile: outFile,
    metafile: true,
    logLevel: 'silent',
  });

  writeFileSync(metaFile, JSON.stringify(result.metafile, null, 2), 'utf8');

  const inputs = Object.keys(result.metafile.inputs);
  const violations = inputs.filter((input) =>
    forbiddenInputFragments.some((fragment) => input.includes(fragment)),
  );

  if (violations.length > 0) {
    console.error('Tree-shake regression — unrelated dist files bundled:');
    for (const violation of violations) {
      console.error(`  ${violation}`);
    }
    process.exit(1);
  }

  const hasCnpj = inputs.some((input) => input.includes('/dist/cnpj.js'));
  if (!hasCnpj) {
    console.error('Expected dist/cnpj.js in esbuild metafile inputs');
    process.exit(1);
  }

  console.log(`Tree-shake OK — ${String(inputs.length)} input(s), cnpj only (no boleto/pix/index/cpf)`);
}

main().catch(exitWithError);
