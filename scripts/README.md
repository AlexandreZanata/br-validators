# Data fetch scripts

> Dev/CI only — **not published** to npm.

## Commands

```bash
pnpm fetch:data:ibge      # IBGE estados + municípios → packages/br-validators/src/ibge/data/
pnpm fetch:data:bancos    # Bacen STR participants → packages/br-validators/src/bancos/data/
pnpm fetch:data:aeroportos # ANAC public aerodromos → packages/br-validators/src/aeroportos/data/
pnpm fetch:data:tse-municipios # TSE ↔ IBGE municipality codes → packages/br-validators/src/tse-municipios/data/
pnpm fetch:data:moedas       # ISO 4217 + Bacen PTAX → packages/br-validators/src/moedas/data/
pnpm fetch:data:ptax         # Bacen PTAX Fechamento → packages/br-validators/src/ptax/data/
pnpm fetch:data:paises-bacen # NF-e Bacen country codes → packages/br-validators/src/paises-bacen/data/
pnpm fetch:data:incoterms    # ICC Incoterms 2020 static list → packages/br-validators/src/incoterms/data/
pnpm fetch:data:ddd       # Anatel DDD lookup → packages/br-validators/src/core/telefone/data/
pnpm fetch:data:cnaes     # IBGE CNAE subclasses → packages/br-validators/src/cnaes/data/
pnpm fetch:data:cfop      # CONFAZ CFOP table → packages/br-validators/src/cfop/data/
pnpm fetch:data:natureza-juridica # RFB natureza jurídica → packages/br-validators/src/natureza-juridica/data/
pnpm fetch:data:nbs       # Comex NBS → packages/br-validators/src/nbs/data/
pnpm fetch:data:cest      # CONFAZ CEST → packages/br-validators/src/cest/data/
pnpm fetch:data:cst       # RFB SPED CST tables → packages/br-validators/src/cst/data/
pnpm fetch:data:lc116     # LC 116 ISS list → packages/br-validators/src/lc116/data/
pnpm fetch:data:esocial   # eSocial Tabela 01 categorias → packages/br-validators/src/esocial/data/
pnpm fetch:data:portos    # ANTAQ portos → packages/br-validators/src/portos/data/
pnpm fetch:data:pncp-reference # PNCP Cadastro domain tables → packages/br-validators/src/pncp-reference/data/
pnpm fetch:data:transparencia  # CGU Swagger audit registry → packages/br-validators/src/transparencia-snapshots/data/
pnpm fetch:data:ncm       # Siscomex NCM JSON → packages/br-validators/src/ncm/data/
pnpm fetch:data:cbo       # MTE CBO occupations → packages/br-validators/src/cbo/data/
pnpm fetch:data:cep-faixas # IBGE CNEFE CEP prefixes → packages/br-validators/src/core/cep/data/ (heavy ~4GB download)
pnpm fetch:data           # All lightweight fetchers above (excludes cep-faixas)
pnpm data:refresh         # All datasets + diff report + docs/DATA-FRESHNESS.md
pnpm data:refresh:report  # Regenerate reports from committed JSON (no fetch)
```

## Policy

- Fetch only from official `.gov.br` domains
- **5 retries**, **2 min** apart per HTTP request (`scripts/lib/fetch-retry-config.ts`)
- On source failure: **retain** embedded JSON; write alert to `data/refresh-reports/fetch-outcomes/`
- Commit generated JSON with readable 2-space indent
- Daily automation: `.github/workflows/data-refresh-bot.yml` (00:00 America/Sao_Paulo)
- Critical maintainer file: `data/refresh-reports/CRITICAL-ALERTS.md`
- Maintainer guide when sources break: [docs/DATA-SOURCE-MAINTENANCE.md](../docs/DATA-SOURCE-MAINTENANCE.md)
