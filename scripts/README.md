# Data fetch scripts

> Dev/CI only — **not published** to npm.

## Commands

```bash
pnpm fetch:data:ibge      # IBGE estados + municípios → packages/br-validators/src/ibge/data/
pnpm fetch:data:bancos    # Bacen STR participants → packages/br-validators/src/bancos/data/
pnpm fetch:data:ddd       # Anatel DDD lookup → packages/br-validators/src/core/telefone/data/
pnpm fetch:data           # All fetchers above
pnpm data:refresh         # All datasets + diff report + docs/DATA-FRESHNESS.md
pnpm data:refresh:report  # Regenerate reports from committed JSON (no fetch)
```

## Policy

- Fetch only from official `.gov.br` domains
- **3 retries**, **2 s** apart per HTTP request (`scripts/lib/fetch-utils.ts`)
- On source failure: **retain** embedded JSON; write alert to `data/refresh-reports/fetch-outcomes/`
- Commit generated JSON with readable 2-space indent
- Weekly automation: `.github/workflows/data-refresh-bot.yml`
- Maintainer guide when sources break: [docs/DATA-SOURCE-MAINTENANCE.md](../docs/DATA-SOURCE-MAINTENANCE.md)
