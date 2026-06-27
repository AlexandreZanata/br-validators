/**
 * Regenerate ISS municipal coverage gap JSON + docs/COVERAGE-GAPS.md from embedded data.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeCoverageGapArtifacts } from './lib/coverage-gaps.js';
import { exitWithError } from './lib/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');
const ISS_MUNICIPAL_PATH = path.join(ROOT, 'packages/br-validators/src/iss-municipal/data/iss-municipal.json');
const OUTPUT_DIR = path.join(ROOT, 'data/coverage-gaps');
const MARKDOWN_PATH = path.join(ROOT, 'docs/COVERAGE-GAPS.md');

async function main(): Promise<void> {
  await writeCoverageGapArtifacts({
    ibgeMunicipiosPath: IBGE_MUNICIPIOS_PATH,
    issMunicipalPath: ISS_MUNICIPAL_PATH,
    outputDir: OUTPUT_DIR,
    markdownPath: MARKDOWN_PATH,
  });

  console.log(`Wrote coverage gaps to ${OUTPUT_DIR} and ${MARKDOWN_PATH}`);
}

main().catch(exitWithError);
