/**
 * Compute ISS municipal coverage gaps vs full IBGE municipality list.
 * Generates machine-readable JSON + human index markdown for contributors.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

export interface IssEmbedRecord {
  codigoIbge: number;
  nome: string;
  uf: string;
  estimativa: boolean;
}

export interface MunicipioGapRow {
  codigoIbge: number;
  nome: string;
  uf: string;
}

export interface UfIssGapCounts {
  uf: string;
  ibgeTotal: number;
  embedded: number;
  notEmbedded: number;
  estimativaOnly: number;
  officialMunicipalRate: number;
}

export interface IssMunicipalGapTotals {
  ibgeMunicipioTotal: number;
  issEmbeddedTotal: number;
  issNotEmbeddedTotal: number;
  issEstimativaOnlyTotal: number;
  issOfficialMunicipalRateTotal: number;
}

export interface IssMunicipalGapResult {
  notEmbedded: MunicipioGapRow[];
  estimativaOnly: MunicipioGapRow[];
  officialMunicipalRate: MunicipioGapRow[];
  byUf: UfIssGapCounts[];
  totals: IssMunicipalGapTotals;
}

const UF_ORDER = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

function compareMunicipioRows(a: MunicipioGapRow, b: MunicipioGapRow): number {
  const ufCompare = a.uf.localeCompare(b.uf);
  if (ufCompare !== 0) {
    return ufCompare;
  }
  return a.nome.localeCompare(b.nome, 'pt-BR');
}

function toGapRow(record: { codigo?: number; codigoIbge?: number; nome: string; uf: string }): MunicipioGapRow {
  const codigoIbge = record.codigoIbge ?? record.codigo;
  if (codigoIbge === undefined) {
    throw new Error('Municipality row missing codigoIbge/codigo');
  }
  return { codigoIbge, nome: record.nome, uf: record.uf };
}

function initUfCounts(): Map<string, UfIssGapCounts> {
  const map = new Map<string, UfIssGapCounts>();
  for (const uf of UF_ORDER) {
    map.set(uf, {
      uf,
      ibgeTotal: 0,
      embedded: 0,
      notEmbedded: 0,
      estimativaOnly: 0,
      officialMunicipalRate: 0,
    });
  }
  return map;
}

function bumpUf(map: Map<string, UfIssGapCounts>, uf: string, field: keyof Omit<UfIssGapCounts, 'uf'>): void {
  const row = map.get(uf);
  if (row === undefined) {
    throw new Error(`Unexpected UF in gap computation: ${uf}`);
  }
  row[field] += 1;
}

export function computeIssMunicipalGaps(
  ibgeMunicipios: readonly MunicipioRecord[],
  issRows: readonly IssEmbedRecord[],
): IssMunicipalGapResult {
  const embeddedByCode = new Map<number, IssEmbedRecord>();
  for (const row of issRows) {
    embeddedByCode.set(row.codigoIbge, row);
  }

  const byUfMap = initUfCounts();
  const notEmbedded: MunicipioGapRow[] = [];
  const estimativaOnly: MunicipioGapRow[] = [];
  const officialMunicipalRate: MunicipioGapRow[] = [];

  for (const municipio of ibgeMunicipios) {
    bumpUf(byUfMap, municipio.uf, 'ibgeTotal');
    const embedded = embeddedByCode.get(municipio.codigo);
    if (embedded === undefined) {
      notEmbedded.push(toGapRow(municipio));
      bumpUf(byUfMap, municipio.uf, 'notEmbedded');
      continue;
    }

    bumpUf(byUfMap, municipio.uf, 'embedded');
    const gapRow = toGapRow(embedded);
    if (embedded.estimativa) {
      estimativaOnly.push(gapRow);
      bumpUf(byUfMap, municipio.uf, 'estimativaOnly');
    } else {
      officialMunicipalRate.push(gapRow);
      bumpUf(byUfMap, municipio.uf, 'officialMunicipalRate');
    }
  }

  notEmbedded.sort(compareMunicipioRows);
  estimativaOnly.sort(compareMunicipioRows);
  officialMunicipalRate.sort(compareMunicipioRows);

  const byUf = UF_ORDER.map((uf) => byUfMap.get(uf)).filter((row): row is UfIssGapCounts => row !== undefined);

  return {
    notEmbedded,
    estimativaOnly,
    officialMunicipalRate,
    byUf,
    totals: {
      ibgeMunicipioTotal: ibgeMunicipios.length,
      issEmbeddedTotal: issRows.length,
      issNotEmbeddedTotal: notEmbedded.length,
      issEstimativaOnlyTotal: estimativaOnly.length,
      issOfficialMunicipalRateTotal: officialMunicipalRate.length,
    },
  };
}

export function generateCoverageGapsMarkdown(result: IssMunicipalGapResult, generatedAt: string): string {
  const { totals, byUf } = result;

  const ufTable = byUf
    .map(
      (row) =>
        `| **${row.uf}** | ${String(row.ibgeTotal)} | ${String(row.embedded)} | ${String(row.notEmbedded)} | ${String(row.estimativaOnly)} | ${String(row.officialMunicipalRate)} |`,
    )
    .join('\n');

  return [
    '# Coverage gaps — municipalities, ISS rates, RG, payroll tables',
    '',
    '> **Maintainers:** regenerate with `pnpm generate:coverage-gaps` after IBGE or ISS embed updates.',
    `> **Generated:** ${generatedAt}`,
    '',
    'This index lists **what is missing or estimation-only** in `@br-validators/core`. Full municipality lists live in JSON under [`data/coverage-gaps/`](../data/coverage-gaps/).',
    '',
    '**Contributing:** follow [CONTRIBUTING.md](../CONTRIBUTING.md) — cite [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md), add golden vectors, keep 100% test coverage on `packages/br-validators/src/**`.',
    '',
    '---',
    '',
    '## Summary',
    '',
    '| Dataset | Scope | Official source in library | Gap |',
    '|---------|-------|----------------------------|-----|',
    '| **INSS employee contribution** | National (Anexo II) | [Portaria MPS/MF nº 6/2025](OFFICIAL-SOURCES.md#inss) | **None** — not per municipality |',
    '| **IRPF progressive (monthly)** | National | [RFB tables](OFFICIAL-SOURCES.md#irpf) | **None** — not per municipality |',
    `| **ISS municipal alíquota** | Per municipality (5.571 IBGE) | [LC 116 Art. 8 band](OFFICIAL-SOURCES.md#iss-municipal) + 27 capital legislation URLs | **${String(totals.issNotEmbeddedTotal)}** municipalities not in embed; **${String(totals.issEstimativaOnlyTotal)}** embedded rows are **estimation-only** |`,
    '| **RG (Registro Geral)** | Per UF (27 states) | [§ RG index](OFFICIAL-SOURCES.md#rg--reference-index) | **24 UFs** format-only — no published official DV walkthrough |',
    '',
    '---',
    '',
    '## ISS municipal — `@br-validators/core/iss-municipal`',
    '',
    '| Metric | Count |',
    '|--------|------:|',
    `| IBGE municipalities (total) | ${String(totals.ibgeMunicipioTotal)} |`,
    `| Embedded in library | ${String(totals.issEmbeddedTotal)} |`,
    `| **Not embedded** (no lookup row) | **${String(totals.issNotEmbeddedTotal)}** |`,
    `| Embedded with **official municipal rate** (capital legislation URL) | ${String(totals.issOfficialMunicipalRateTotal)} |`,
    `| Embedded with **estimation only** (LC 116 Art. 8 band — not verified municipal law) | **${String(totals.issEstimativaOnlyTotal)}** |`,
    '',
    '### Counts by UF',
    '',
    '| UF | IBGE total | Embedded | Not embedded | Estimation-only (embedded) | Official municipal rate (embedded) |',
    '|----|----------:|---------:|-------------:|---------------------------:|---------------------------------:|',
    ufTable,
    '',
    '### Machine-readable lists',
    '',
    '| File | Description | Rows |',
    '|------|-------------|-----:|',
    `| [iss-municipal-not-embedded.json](../data/coverage-gaps/iss-municipal-not-embedded.json) | Municipalities with **no** ISS row in the library | ${String(totals.issNotEmbeddedTotal)} |`,
    `| [iss-municipal-estimativa-only.json](../data/coverage-gaps/iss-municipal-estimativa-only.json) | Embedded rows using LC 116 band only — **need municipal legislation citation** | ${String(totals.issEstimativaOnlyTotal)} |`,
    `| [iss-municipal-official-rate.json](../data/coverage-gaps/iss-municipal-official-rate.json) | State capitals with municipal legislation URLs | ${String(totals.issOfficialMunicipalRateTotal)} |`,
    `| [summary.json](../data/coverage-gaps/summary.json) | Totals + per-UF counts | — |`,
    '',
    '### How to contribute ISS municipal data',
    '',
    '1. Find the **municipal ISS law or NFSe portal** citing alíquota min/max (or fixed rate within LC 116 band).',
    '2. Open a GitHub issue — template [`.github/ISSUE_TEMPLATE/iss-municipal-contribution.yml`](../.github/ISSUE_TEMPLATE/iss-municipal-contribution.yml) (labels `good first issue`, `iss-municipal`).',
    '3. PR checklist: update capital seed or fetch script, golden row in `tests/vectors/iss-municipal.official.json`, `docs/OFFICIAL-SOURCES.md`, run `pnpm fetch:data:iss-municipal` + `pnpm generate:coverage-gaps`.',
    '4. Set `estimativa: false` only when legislation URL is cited — never for NFSe emission validation.',
    '',
    'Full 5.570-municipality table: deferred — see [ROADMAP.md](ROADMAP.md) S-09.',
    '',
    '---',
    '',
    '## RG — `@br-validators/core/rg`',
    '',
    'All **27 UFs** ship a validator. **SP, RJ, MG** use Ghiorzi modulo check digits. **SC** is format-only with CIASC mask. **Remaining 24 UFs** are format-only because state issuers do not publish a consistent official DV algorithm.',
    '',
    '| Need | Action |',
    '|------|--------|',
    '| Official SSP/IGP DV walkthrough for a UF | Issue template [`.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml`](../.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml) · [RG-CONTRIBUTOR-GUIDE.md](community/RG-CONTRIBUTOR-GUIDE.md) |',
    '| Legacy booklet length ranges | Same guide — cite state documentation |',
    '',
    'See [RG-GOOD-FIRST-ISSUES.md](community/RG-GOOD-FIRST-ISSUES.md).',
    '',
    '---',
    '',
    '## Payroll tables (INSS / IRPF)',
    '',
    'INSS and IRPF modules are **federal** progressive tables — they do **not** vary by municipality. Sources are cited in [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md). Deferred v2 items: INSS RPPS / MEI, IRPF annual declaration / 13º — not municipality gaps.',
    '',
  ].join('\n');
}

export interface CoverageGapSummaryJson {
  generatedAt: string;
  issMunicipal: IssMunicipalGapTotals & { byUf: UfIssGapCounts[] };
  notes: {
    inss: string;
    irpf: string;
    rg: string;
  };
}

export function buildCoverageGapSummaryJson(
  result: IssMunicipalGapResult,
  generatedAt: string,
): CoverageGapSummaryJson {
  return {
    generatedAt,
    issMunicipal: {
      ...result.totals,
      byUf: result.byUf,
    },
    notes: {
      inss: 'National employee contribution table — not per municipality; fully sourced.',
      irpf: 'National progressive monthly table — not per municipality; fully sourced.',
      rg: '27/27 UFs shipped; 24 UFs format-only pending official DV walkthrough.',
    },
  };
}

export interface WriteCoverageGapArtifactsOptions {
  ibgeMunicipiosPath: string;
  issMunicipalPath: string;
  outputDir: string;
  markdownPath: string;
  generatedAt?: string;
}

function parseJsonArray<T extends object>(raw: string, label: string): T[] {
  const parsed = JSON.parse(raw) as T[] | null;
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array in ${label}`);
  }
  return parsed;
}

export async function writeCoverageGapArtifacts(options: WriteCoverageGapArtifactsOptions): Promise<void> {
  const generatedAt = options.generatedAt ?? new Date().toISOString();

  const ibgeMunicipios = parseJsonArray<MunicipioRecord>(
    await readFile(options.ibgeMunicipiosPath, 'utf8'),
    options.ibgeMunicipiosPath,
  );
  const issRows = parseJsonArray<IssEmbedRecord>(
    await readFile(options.issMunicipalPath, 'utf8'),
    options.issMunicipalPath,
  );

  const gaps = computeIssMunicipalGaps(ibgeMunicipios, issRows);
  const summary = buildCoverageGapSummaryJson(gaps, generatedAt);
  const markdown = generateCoverageGapsMarkdown(gaps, generatedAt);

  await mkdir(options.outputDir, { recursive: true });

  const writeJson = async (filename: string, data: object): Promise<void> => {
    const filePath = path.join(options.outputDir, filename);
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  };

  await writeJson('summary.json', summary);
  await writeJson('iss-municipal-not-embedded.json', gaps.notEmbedded);
  await writeJson('iss-municipal-estimativa-only.json', gaps.estimativaOnly);
  await writeJson('iss-municipal-official-rate.json', gaps.officialMunicipalRate);
  await writeFile(options.markdownPath, markdown, 'utf8');
}
