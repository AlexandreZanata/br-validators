import type { DatasetMetadata } from './metadata-writer.js';
import type { SourceAlert } from './source-fetch-outcome.js';
import type { FieldChangesReport } from './field-change-report.js';

export interface RefreshReportDataset {
  id: string;
  status: 'changed' | 'unchanged';
  alteracoes: DatasetMetadata['alteracoes'];
  contagens: Record<string, number>;
  camposAlterados?: string[];
}

export interface RefreshReport {
  executadoEm: string;
  runDate: string;
  schedule: 'diario';
  agendamento: 'diario';
  datasets: RefreshReportDataset[];
  sourceAlerts: SourceAlert[];
  resumo: {
    datasetsVerificados: number;
    datasetsAlterados: number;
    totalAdicionados: number;
    totalRemovidos: number;
    totalAlterados: number;
    sourceAlerts: number;
    criticalAlerts: number;
  };
}

function renderCriticalBanner(criticalCount: number): string[] {
  if (criticalCount === 0) {
    return [];
  }
  return [
    '## ⚠️ Critical source alerts',
    '',
    `**${String(criticalCount)}** dataset(s) marked as **consultation link deprecated** (2+ consecutive failure days).`,
    'See [`data/refresh-reports/CRITICAL-ALERTS.md`](../data/refresh-reports/CRITICAL-ALERTS.md).',
    '',
  ];
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
    '> Official source unreachable or deprecated. **Embedded data was retained** — the published API continues to serve the last successful capture.',
    '',
    '| Dataset | Severity | Status | Embedded data from | Message |',
    '|---------|----------|--------|--------------------|---------|',
  ];

  for (const alert of alerts) {
    const retained = alert.retainedEmbeddedDataFrom ?? 'unknown';
    lines.push(
      `| ${alert.datasetId} | ${alert.severity} | ${alert.status} | ${retained} | ${alert.message} |`,
    );
  }

  lines.push(
    '',
    '### Maintainer action required',
    '',
    '1. Read [DATA-SOURCE-MAINTENANCE.md](DATA-SOURCE-MAINTENANCE.md).',
    '2. Scan [CRITICAL-ALERTS.md](../data/refresh-reports/CRITICAL-ALERTS.md) when severity is **critical**.',
    '3. Verify whether the official URL moved (404) or the payload schema changed.',
    '4. Update `docs/OFFICIAL-SOURCES.md`, the relevant `scripts/fetch-*.ts` endpoint(s), and `metadata.json`.',
    '5. Run `pnpm data:refresh` locally and confirm alerts are cleared in `data/refresh-reports/latest.json`.',
    '',
  );

  return lines;
}

function formatFieldsDelta(fields: string[] | undefined): string {
  if (fields === undefined || fields.length === 0) {
    return '—';
  }
  return fields.join(', ');
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
    '| Dataset | Last capture | Records | + added | − removed | ~ changed | Fields Δ | Official source |',
    '|---------|--------------|---------|---------|-----------|-----------|----------|-----------------|',
  ];

  for (const dataset of datasets) {
    const reportEntry = report.datasets.find((entry) => entry.id === dataset.id);
    const counts = Object.entries(dataset.contagens)
      .map(([key, value]) => `${String(value)} ${key}`)
      .join(' / ');
    const source = dataset.endpoints[0] ?? dataset.fonte;
    const { adicionados, removidos, alterados } = dataset.alteracoes;
    lines.push(
      `| ${dataset.nome} | ${dataset.capturadoEm} | ${counts} | ${String(adicionados)} | ${String(removidos)} | ${String(alterados)} | ${formatFieldsDelta(reportEntry?.camposAlterados)} | [${dataset.fonte}](${source}) |`,
    );
  }

  lines.push(
    '',
    ...renderCriticalBanner(report.resumo.criticalAlerts),
    ...renderSourceAlertsSection(report.sourceAlerts),
    '## Verification',
    '',
    '- Schedule: **daily** — 00:00 America/Sao_Paulo (`0 3 * * *` UTC in `data-refresh-bot.yml`)',
    '- Fetch retries: **5** attempts, **2 min** apart (`scripts/lib/fetch-retry-config.ts`)',
    '- Critical maintainer file: [`data/refresh-reports/CRITICAL-ALERTS.md`](../data/refresh-reports/CRITICAL-ALERTS.md)',
    '- On source failure: embedded JSON is **not** overwritten; daily report records retention',
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
    `## Daily data refresh — ${report.runDate}`,
    '',
    ...renderCriticalBanner(report.resumo.criticalAlerts),
    '| Dataset | Records | + added | − removed | ~ changed | Fields Δ | Captured | Source |',
    '|---------|---------|---------|-----------|-----------|----------|----------|--------|',
  ];

  for (const dataset of datasets) {
    const reportEntry = report.datasets.find((entry) => entry.id === dataset.id);
    const counts = Object.entries(dataset.contagens)
      .map(([key, value]) => `${String(value)} ${key}`)
      .join(' / ');
    const source = dataset.endpoints[0] ?? '#';
    const { adicionados, removidos, alterados } = dataset.alteracoes;
    lines.push(
      `| ${dataset.id} | ${counts} | ${String(adicionados)} | ${String(removidos)} | ${String(alterados)} | ${formatFieldsDelta(reportEntry?.camposAlterados)} | ${dataset.capturadoEm} | [official](${source}) |`,
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
        `- **${alert.datasetId}** (${alert.severity}/${alert.status}): ${alert.message} Embedded data from **${retained}** retained in the API.`,
      );
      lines.push(`  - Action: ${alert.documentationAction}`);
    }
    lines.push('');
  } else {
    lines.push('### Source health', '', 'All official endpoints responded successfully.', '');
  }

  if (report.resumo.datasetsAlterados === 0) {
    lines.push('### Drift', '', '✅ No dataset drift on this run.', '');
  }

  lines.push(
    '### Verification',
    '',
    '- [ ] `pnpm verify` passed',
    '- [ ] All endpoints are official government domains',
    '- [ ] No unresolved critical alerts (or documented in PR if retention is expected)',
    '',
  );

  return lines.join('\n');
}

export function generateJobSummary(
  report: RefreshReport,
  fieldChanges?: FieldChangesReport,
): string {
  const lines: string[] = [
    '### Data refresh report',
    '',
    `- Run date: ${report.runDate}`,
    `- Datasets checked: ${String(report.resumo.datasetsVerificados)}`,
    `- Datasets changed: ${String(report.resumo.datasetsAlterados)}`,
    `- Source alerts: ${String(report.resumo.sourceAlerts)}`,
    `- Critical alerts: ${String(report.resumo.criticalAlerts)}`,
    '',
  ];

  if (report.resumo.criticalAlerts > 0) {
    lines.push(
      '### ⚠️ Critical — consultation link deprecated',
      '',
      'See `data/refresh-reports/CRITICAL-ALERTS.md` for maintainer actions.',
      '',
    );
  }

  if (report.sourceAlerts.length === 0 && report.resumo.datasetsAlterados === 0) {
    lines.push(`✅ No dataset drift — all ${String(report.resumo.datasetsVerificados)} datasets unchanged on ${report.runDate}.`, '');
    return lines.join('\n');
  }

  if (report.sourceAlerts.length > 0) {
    lines.push('### Source health alerts', '');
    for (const alert of report.sourceAlerts) {
      const retained = alert.retainedEmbeddedDataFrom ?? 'unknown';
      lines.push(
        `- **${alert.datasetId}** (${alert.severity}): ${alert.message} (embedded data from ${retained} retained)`,
      );
    }
    lines.push('', 'See `docs/DATA-SOURCE-MAINTENANCE.md` for remediation steps.', '');
  }

  if (report.resumo.datasetsAlterados > 0) {
    lines.push(
      '### Dataset drift',
      '',
      `Totals: +${String(report.resumo.totalAdicionados)} −${String(report.resumo.totalRemovidos)} ~${String(report.resumo.totalAlterados)}`,
      '',
      '| Dataset | Δ | Fields |',
      '|---------|---|--------|',
    );

    for (const entry of report.datasets.filter((item) => item.status === 'changed')) {
      const delta = `+${String(entry.alteracoes.adicionados)} −${String(entry.alteracoes.removidos)} ~${String(entry.alteracoes.alterados)}`;
      lines.push(`| ${entry.id} | ${delta} | ${formatFieldsDelta(entry.camposAlterados)} |`);
    }

    lines.push('');
  } else if (fieldChanges?.summary === 'no_drift') {
    lines.push(`✅ No dataset drift — all datasets unchanged on ${report.runDate}.`, '');
  }

  return lines.join('\n');
}
