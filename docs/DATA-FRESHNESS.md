# Data freshness — reference datasets

> **Auto-generated** by `scripts/data-refresh-bot.ts` — do not edit manually.
> Last bot run: 2026-06-23T15:50:13.718Z

## Summary

| Dataset | Last capture | Records | + added | − removed | ~ changed | Official source |
|---------|--------------|---------|---------|-----------|-----------|-----------------|
| IBGE Localidades | 2026-06-23 | 27 estados / 5571 municipios | 0 | 0 | 0 | [IBGE API v1 /localidades](https://servicodados.ibge.gov.br/api/v1/localidades/estados) |
| Bacen STR Participants | 2026-06-23 | 468 bancos | 0 | 0 | 0 | [Banco Central — Participantes STR](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| Anatel DDD Geographic Lookup | 2026-06-23 | 67 ddds | 0 | 0 | 0 | [Anatel Plano de Numeração + IBGE municipios](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |
| Feriados Nacionais Federais | 2026-06-23 | 9 feriadosNacionaisFixos / 1 feriadosNacionaisMoveis / 9 pontosFacultativosFederais | 0 | 0 | 0 | [Lei 662/1949 + Portaria MGI (calendário federal)](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) |

## Source health

All official endpoints responded successfully. No embedded-data retention warnings.

## Verification

- Schedule: weekly — Monday 06:00 UTC (`data-refresh-bot.yml`)
- Fetch retries: 3 attempts, 2 s apart (`scripts/lib/fetch-utils.ts`)
- On source failure: embedded JSON is **not** overwritten; weekly report records retention
- Local dry run: `pnpm data:refresh`
- Library API: `getDataCatalog()` from `@br-validators/core/data-catalog`
- Maintainer guide: [DATA-SOURCE-MAINTENANCE.md](DATA-SOURCE-MAINTENANCE.md)

## Report snapshot

```json
{
  "datasetsVerificados": 4,
  "datasetsAlterados": 0,
  "totalAdicionados": 0,
  "totalRemovidos": 0,
  "totalAlterados": 0,
  "sourceAlerts": 0
}
```

