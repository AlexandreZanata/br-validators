import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from '../lib/errors.js';
import { patchReleaseDatasetCount, type PatchReleaseResumo } from '../lib/should-patch-release.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function readNumberField(obj: object, key: string): number {
  if (!Object.hasOwn(obj, key)) {
    return 0;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined || typeof descriptor.value !== 'number') {
    return 0;
  }
  return descriptor.value;
}

function isJsonObject(value: string | number | boolean | object | null): value is object {
  return typeof value === 'object' && value !== null;
}

function parseResumo(raw: string): PatchReleaseResumo | null {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (!isJsonObject(parsed) || !Object.hasOwn(parsed, 'resumo')) {
    return null;
  }
  const resumoDescriptor = Object.getOwnPropertyDescriptor(parsed, 'resumo');
  if (resumoDescriptor === undefined) {
    return null;
  }
  const resumoField = resumoDescriptor.value as string | number | boolean | object | null;
  if (!isJsonObject(resumoField)) {
    return null;
  }
  const resumo = resumoField;
  return {
    datasetsAlterados: readNumberField(resumo, 'datasetsAlterados'),
    totalAdicionados: readNumberField(resumo, 'totalAdicionados'),
    totalRemovidos: readNumberField(resumo, 'totalRemovidos'),
    totalAlterados: readNumberField(resumo, 'totalAlterados'),
  };
}

async function main(): Promise<void> {
  const reportPath = path.join(ROOT, 'data/refresh-reports/latest.json');
  let changed = 0;

  try {
    const raw = await readFile(reportPath, 'utf8');
    const resumo = parseResumo(raw);
    if (resumo !== null) {
      changed = patchReleaseDatasetCount(resumo);
    }
  } catch {
    changed = 0;
  }

  const output = `changed=${String(changed)}\n`;
  process.stdout.write(output);

  if (process.env.GITHUB_OUTPUT !== undefined && process.env.GITHUB_OUTPUT.length > 0) {
    await appendFile(process.env.GITHUB_OUTPUT, output);
  }
}

main().catch(exitWithError);
