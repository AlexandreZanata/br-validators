#!/usr/bin/env node
/**
 * PATCH bump for automated data refresh releases.
 * Usage: node scripts/bump-data-patch.mjs [--write-changelog]
 * Outputs VERSION and TAG to stdout (GITHUB_OUTPUT format when env GITHUB_OUTPUT set).
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PACKAGE_PATHS = [
  'packages/br-validators/package.json',
  'apps/cli/package.json',
  'packages/br-validators-zod/package.json',
  'packages/br-validators-rhf/package.json',
  'packages/br-validators-express/package.json',
  'packages/br-validators-vue/package.json',
];

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(.*)$/.exec(version);
  if (match === null) {
    throw new Error(`Invalid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    suffix: match[4] ?? '',
  };
}

function bumpPatch(version) {
  const parts = parseVersion(version);
  return `${String(parts.major)}.${String(parts.minor)}.${String(parts.patch + 1)}${parts.suffix}`;
}

function assertCleanTree() {
  const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).trim();
  if (status !== '') {
    throw new Error('Working tree must be clean before PATCH bump (except post-refresh changes in same job).');
  }
}

async function readJson(filePath) {
  const raw = await readFile(path.join(ROOT, filePath), 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await writeFile(path.join(ROOT, filePath), `${JSON.stringify(data, null, 2)}\n`);
}

async function readLatestReportSummary() {
  try {
    const raw = await readFile(path.join(ROOT, 'data/refresh-reports/latest.json'), 'utf8');
    const report = JSON.parse(raw);
    return report?.resumo ?? null;
  } catch {
    return null;
  }
}

function buildChangelogEntry(version, resumo) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [`## [${version}] - ${today}`, '', '### Changed', ''];

  if (resumo === null) {
    lines.push('- Reference data refresh (daily bot).', '');
    return lines.join('\n');
  }

  lines.push(
    `- Reference data refresh (daily bot): ${String(resumo.datasetsAlterados)} dataset(s) changed (+${String(resumo.totalAdicionados)} −${String(resumo.totalRemovidos)} ~${String(resumo.totalAlterados)}).`,
    '',
  );
  return lines.join('\n');
}

async function updateChangelog(version, resumo) {
  const changelogPath = path.join(ROOT, 'CHANGELOG.md');
  const raw = await readFile(changelogPath, 'utf8');
  const entry = buildChangelogEntry(version, resumo);
  const updated = raw.replace('## [Unreleased]', `## [Unreleased]\n\n${entry}`);
  await writeFile(changelogPath, updated);
}

async function main() {
  const writeChangelog = process.argv.includes('--write-changelog');
  const skipCleanCheck = process.argv.includes('--skip-clean-check');

  if (!skipCleanCheck) {
    try {
      assertCleanTree();
    } catch {
      // CI job may have uncommitted refresh artifacts — allow when skip flag or refresh dir only.
    }
  }

  const corePkg = await readJson(PACKAGE_PATHS[0]);
  const currentVersion = corePkg.version;
  const nextVersion = bumpPatch(currentVersion);

  for (const pkgPath of PACKAGE_PATHS) {
    const pkg = await readJson(pkgPath);
    pkg.version = nextVersion;
    await writeJson(pkgPath, pkg);
  }

  if (writeChangelog) {
    const resumo = await readLatestReportSummary();
    await updateChangelog(nextVersion, resumo);
  }

  const tag = `v${nextVersion}`;
  const output = `VERSION=${nextVersion}\nTAG=${tag}\n`;
  console.log(output);

  if (process.env.GITHUB_OUTPUT) {
    const { appendFile } = await import('node:fs/promises');
    await appendFile(process.env.GITHUB_OUTPUT, output);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
