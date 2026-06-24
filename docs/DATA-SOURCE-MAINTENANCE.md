# Data source maintenance — when official endpoints fail

> **Audience:** maintainers running the daily data refresh bot or investigating `sourceAlerts` in reports.

---

## Critical alerts (scan first)

| File | Purpose |
|------|---------|
| [`data/refresh-reports/CRITICAL-ALERTS.md`](../data/refresh-reports/CRITICAL-ALERTS.md) | Human-readable table — **2+ consecutive failure days** |
| [`data/refresh-reports/CRITICAL-ALERTS.log`](../data/refresh-reports/CRITICAL-ALERTS.log) | Plain text — `rg CRITICAL` |

---

## What triggers an alert?

The daily bot (`pnpm data:refresh` / `data-refresh-bot.yml`) fetches reference datasets from official government sources. Each fetch uses **5 attempts** with **2 minutes** between retries.

### Escalation

| Day | Severity | Message |
|-----|----------|---------|
| 1st failure day | **warning** | Possible link deprecation |
| 2+ consecutive failure days | **critical** | Consultation link deprecated |

An alert is recorded when:

| Condition | `status` in report |
|-----------|-------------------|
| HTTP error (e.g. 404 — URL moved or deprecated) | `source_unavailable` |
| Empty or invalid payload (zero rows, missing columns) | `source_empty` |
| Downstream dependency missing (e.g. DDD without IBGE municipios) | `dependency_failed` |
| Algorithm dataset endpoint probe fails (e.g. feriados Gov.br link) | `source_unavailable` |

**Policy:** embedded JSON in `packages/br-validators/src/**/data/` is **never deleted** on fetch failure. The published API keeps serving the last successful capture (`capturadoEm` in `metadata.json`).

---

## What consumers see

Daily artifacts:

| File | Content |
|------|---------|
| `data/refresh-reports/latest.json` | `sourceAlerts[]` with severity + retention date |
| `data/refresh-reports/daily/YYYY-MM-DD.json` | Archived run snapshot |
| `data/refresh-reports/field-changes/YYYY-MM-DD.json` | Field-level drift (`camposAlterados`) or `no_drift` |
| `data/refresh-reports/CRITICAL-ALERTS.md` | Critical maintainer file |
| `docs/DATA-FRESHNESS.md` | Auto-generated freshness table + alert section |
| GitHub Actions job summary | Human-readable warning with embedded-data date |

Example warning message (day 1):

> Possible link deprecation — official source unreachable after 5 attempts (interval 120000ms) (HTTP 404). No new data returned — embedded data from **2026-06-23** retained in the API.

Example critical message (day 2+):

> Consultation link deprecated — official source unreachable for 2 or more consecutive days.

---

## Maintainer checklist

1. **Scan** [`CRITICAL-ALERTS.md`](../data/refresh-reports/CRITICAL-ALERTS.md) when severity is **critical**.
2. **Confirm** the official URL in `docs/OFFICIAL-SOURCES.md` still works in a browser.
3. **Update** the endpoint in the relevant `scripts/fetch-*.ts` (or `metadata.json` `endpoints` for algorithm modules).
4. **Update** `docs/OFFICIAL-SOURCES.md` anchor for the dataset.
5. **Run** `pnpm data:refresh` locally — confirm alerts are cleared in `latest.json`.
6. **Run** `pnpm verify` before merging.
7. **CHANGELOG** — note the source URL fix under `[Unreleased]` if consumers rely on freshness metadata.

---

## Files to touch per dataset

| Dataset | Fetch script | Embedded data | OFFICIAL-SOURCES anchor |
|---------|--------------|---------------|-------------------------|
| IBGE | `scripts/fetch-ibge.ts` | `src/ibge/data/*.json` | `#ibge-localities` |
| Bacen | `scripts/fetch-bancos.ts` | `src/bancos/data/bancos.json` | `#bacen-banks` |
| DDD | `scripts/fetch-ddd.ts` | `src/core/telefone/data/ddd-municipios.json` | `#anatel-ddd-lookup` |
| Feriados | _(probe only)_ | `src/feriados/data/portaria-extras.json` | `#feriados-nacionais` |

---

## Feriados (algorithm + portaria extras)

**Planalto law URLs** (Lei 662, 6.802, 14.759) are documented references — the bot probes only the **operational** Gov.br/MGI calendar URL, not Planalto HTML pages (often blocked to automated clients).

If the Gov.br calendar URL moves:

1. Update `FERIADOS_GOV_CALENDARIO_URL` in `src/feriados/facultativos.ts`.
2. Add new bridge days to `src/feriados/data/portaria-extras.json` when Portaria MGI publishes them.
3. Update golden vectors in `tests/vectors/feriados.official.json`.

---

**See also:** [DATA-FRESHNESS.md](DATA-FRESHNESS.md) · [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md) · `.local/phases/30-daily-data-refresh-bot/TASKS.md`
