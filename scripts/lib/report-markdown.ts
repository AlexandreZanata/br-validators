import type { DatasetMetadata } from './metadata-writer.js';
import type { SourceAlert } from './source-fetch-outcome.js';

export interface RefreshReportDataset {
  id: string;
  status: 'changed' | 'unchanged';
  alteracoes: DatasetMetadata['alteracoes'];
  contagens: Record<string, number>;
}

export interface RefreshReport {
  executadoEm: string;
  agendamento: 'semanal';
  datasets: RefreshReportDataset[];
  sourceAlerts: SourceAlert[];
  resumo: {
    datasetsVerificados: number;
    datasetsAlterados: number;
    totalAdicionados: number;
    totalRemovidos: number;
    totalAlterados: number;
    sourceAlerts: number;
  };
}

function renderSourceAlertsSection(alerts: SourceAlert[]): string[] {
  if (alerts.length === 0) {
    return [
      '## Source health',
      '',
      'All official endpoints responded successfully. No embedded-data retention warnings.',
      '',
    ];
  }

  const lines: string[] = [
    '## Source health alerts',
    '',
    '> Official source unreachable, deprecated, or returned no usable data. **Embedded data was retained** — the published API continues to serve the last successful capture.',
    '',
    '| Dataset | Status | Embedded data from | Message |',
    '|---------|--------|--------------------|---------|',
  ];

  for (const alert of alerts) {
    const retained = alert.retainedEmbeddedDataFrom ?? 'unknown';
    lines.push(
      `| ${alert.datasetId} | ${alert.status} | ${retained} | ${alert.message} |`,
    );
  }

  lines.push(
    '',
    '### Maintainer action required',
    '',
    '1. Read [DATA-SOURCE-MAINTENANCE.md](DATA-SOURCE-MAINTENANCE.md).',
    '2. Verify whether the official URL moved (404) or the payload schema changed.',
    '3. Update `docs/OFFICIAL-SOURCES.md`, the relevant `scripts/fetch-*.ts` endpoint(s), and `metadata.json`.',
    '4. Run `pnpm data:refresh` locally and confirm `sourceAlerts` is empty in `data/refresh-reports/latest.json`.',
    '',
  );

  return lines;
}

export function generateDataFreshnessDoc(report: RefreshReport, datasets: DatasetMetadata[]): string {
  const lines: string[] = [
    '# Data freshness — reference datasets',
    '',
    '> **Auto-generated** by `scripts/data-refresh-bot.ts` — do not edit manually.',
    `> Last bot run: ${report.executadoEm}`,
    '',
    '## Summary',
    '',
    '| Dataset | Last capture | Records | + added | − removed | ~ changed | Official source |',
    '|---------|--------------|---------|---------|-----------|-----------|-----------------|',
  ];

  for (const dataset of datasets) {
    const counts = Object.entries(dataset.contagens)
      .map(([key, value]) => `${String(value)} ${key}`)
      .join(' / ');
    const source = dataset.endpoints[0] ?? dataset.fonte;
    const { adicionados, removidos, alterados } = dataset.alteracoes;
    lines.push(
      `| ${dataset.nome} | ${dataset.capturadoEm} | ${counts} | ${String(adicionados)} | ${String(removidos)} | ${String(alterados)} | [${dataset.fonte}](${source}) |`,
    );
  }

  lines.push(
    '',
    ...renderSourceAlertsSection(report.sourceAlerts),
    '## Verification',
    '',
    '- Schedule: weekly — Monday 06:00 UTC (`data-refresh-bot.yml`)',
    '- Fetch retries: 3 attempts, 2 s apart (`scripts/lib/fetch-utils.ts`)',
    '- On source failure: embedded JSON is **not** overwritten; weekly report records retention',
    '- Local dry run: `pnpm data:refresh`',
    '- Library API: `getDataCatalog()` from `@br-validators/core/data-catalog`',
    '- Maintainer guide: [DATA-SOURCE-MAINTENANCE.md](DATA-SOURCE-MAINTENANCE.md)',
    '',
    '## Report snapshot',
    '',
    '```json',
    JSON.stringify(report.resumo, null, 2),
    '```',
    '',
  );

  return `${lines.join('\n')}\n`;
}

export function generatePrBody(report: RefreshReport, datasets: DatasetMetadata[]): string {
  const lines: string[] = [
    `## Weekly data refresh — ${report.executadoEm.slice(0, 10)}`,
    '',
    '| Dataset | Records | + added | − removed | ~ changed | Captured | Source |',
    '|---------|---------|---------|-----------|-----------|----------|--------|',
  ];

  for (const dataset of datasets) {
    const counts = Object.entries(dataset.contagens)
      .map(([key, value]) => `${String(value)} ${key}`)
      .join(' / ');
    const source = dataset.endpoints[0] ?? '#';
    const { adicionados, removidos, alterados } = dataset.alteracoes;
    lines.push(
      `| ${dataset.id} | ${counts} | ${String(adicionados)} | ${String(removidos)} | ${String(alterados)} | ${dataset.capturadoEm} | [official](${source}) |`,
    );
  }

  lines.push(
    '',
    `**Totals:** +${String(report.resumo.totalAdicionados)} −${String(report.resumo.totalRemovidos)} ~${String(report.resumo.totalAlterados)}`,
    '',
  );

  if (report.sourceAlerts.length > 0) {
    lines.push('### Source health alerts', '');
    for (const alert of report.sourceAlerts) {
      const retained = alert.retainedEmbeddedDataFrom ?? 'unknown';
      lines.push(
        `- **${alert.datasetId}** (${alert.status}): ${alert.message} Embedded data from **${retained}** retained in the API.`,
      );
      lines.push(`  - Action: ${alert.documentationAction}`);
    }
    lines.push('');
  } else {
    lines.push('### Source health', '', 'All official endpoints responded successfully.', '');
  }

  lines.push(
    '### Verification',
    '',
    '- [ ] `pnpm verify` passed',
    '- [ ] All endpoints are official government domains',
    '- [ ] No unresolved `sourceAlerts` (or documented in PR if retention is expected)',
    '- [ ] Human review required before merge',
    '',
  );

  return lines.join('\n');
}

export function generateJobSummary(report: RefreshReport): string {
  const lines: string[] = [
    '### Data refresh report',
    '',
    `- Datasets checked: ${String(report.resumo.datasetsVerificados)}`,
    `- Datasets changed: ${String(report.resumo.datasetsAlterados)}`,
    `- Source alerts: ${String(report.resumo.sourceAlerts)}`,
    '',
  ];

  if (report.sourceAlerts.length === 0 && report.resumo.datasetsAlterados === 0) {
    lines.push('✅ No dataset drift. All official sources responded successfully.', '');
    return lines.join('\n');
  }

  if (report.sourceAlerts.length > 0) {
    lines.push('### ⚠️ Source health alerts', '');
    for (const alert of report.sourceAlerts) {
      const retained = alert.retainedEmbeddedDataFrom ?? 'unknown';
      lines.push(`- **${alert.datasetId}**: ${alert.message} (embedded data from ${retained} retained)`);
    }
    lines.push('', 'See `docs/DATA-SOURCE-MAINTENANCE.md` for remediation steps.', '');
  }

  if (report.resumo.datasetsAlterados > 0) {
    lines.push(
      `Dataset drift: +${String(report.resumo.totalAdicionados)} −${String(report.resumo.totalRemovidos)} ~${String(report.resumo.totalAlterados)}`,
      '',
    );
  }

  return lines.join('\n');
}
