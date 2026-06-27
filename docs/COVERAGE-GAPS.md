# Coverage gaps — municipalities, ISS rates, RG, payroll tables

> **Maintainers:** regenerate with `pnpm generate:coverage-gaps` after IBGE or ISS embed updates.
> **Generated:** 2026-06-27T10:39:58.449Z

This index lists **what is missing or estimation-only** in `@br-validators/core`. Full municipality lists live in JSON under [`data/coverage-gaps/`](../data/coverage-gaps/).

**Contributing:** follow [CONTRIBUTING.md](../CONTRIBUTING.md) — cite [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md), add golden vectors, keep 100% test coverage on `packages/br-validators/src/**`.

---

## Summary

| Dataset | Scope | Official source in library | Gap |
|---------|-------|----------------------------|-----|
| **INSS employee contribution** | National (Anexo II) | [Portaria MPS/MF nº 6/2025](OFFICIAL-SOURCES.md#inss) | **None** — not per municipality |
| **IRPF progressive (monthly)** | National | [RFB tables](OFFICIAL-SOURCES.md#irpf) | **None** — not per municipality |
| **ISS municipal alíquota** | Per municipality (5.571 IBGE) | [LC 116 Art. 8 band](OFFICIAL-SOURCES.md#iss-municipal) + 27 capital legislation URLs | **5071** municipalities not in embed; **473** embedded rows are **estimation-only** |
| **RG (Registro Geral)** | Per UF (27 states) | [§ RG index](OFFICIAL-SOURCES.md#rg--reference-index) | **24 UFs** format-only — no published official DV walkthrough |

---

## ISS municipal — `@br-validators/core/iss-municipal`

| Metric | Count |
|--------|------:|
| IBGE municipalities (total) | 5571 |
| Embedded in library | 500 |
| **Not embedded** (no lookup row) | **5071** |
| Embedded with **official municipal rate** (capital legislation URL) | 27 |
| Embedded with **estimation only** (LC 116 Art. 8 band — not verified municipal law) | **473** |

### Counts by UF

| UF | IBGE total | Embedded | Not embedded | Estimation-only (embedded) | Official municipal rate (embedded) |
|----|----------:|---------:|-------------:|---------------------------:|---------------------------------:|
| **AC** | 22 | 1 | 21 | 0 | 1 |
| **AL** | 102 | 3 | 99 | 2 | 1 |
| **AP** | 16 | 2 | 14 | 1 | 1 |
| **AM** | 62 | 2 | 60 | 1 | 1 |
| **BA** | 417 | 25 | 392 | 24 | 1 |
| **CE** | 184 | 8 | 176 | 7 | 1 |
| **DF** | 1 | 1 | 0 | 0 | 1 |
| **ES** | 78 | 14 | 64 | 13 | 1 |
| **GO** | 246 | 19 | 227 | 18 | 1 |
| **MA** | 217 | 7 | 210 | 6 | 1 |
| **MT** | 142 | 18 | 124 | 17 | 1 |
| **MS** | 79 | 14 | 65 | 13 | 1 |
| **MG** | 853 | 57 | 796 | 56 | 1 |
| **PA** | 144 | 14 | 130 | 13 | 1 |
| **PB** | 223 | 5 | 218 | 4 | 1 |
| **PR** | 399 | 31 | 368 | 30 | 1 |
| **PE** | 185 | 13 | 172 | 12 | 1 |
| **PI** | 224 | 3 | 221 | 2 | 1 |
| **RJ** | 92 | 43 | 49 | 42 | 1 |
| **RN** | 167 | 3 | 164 | 2 | 1 |
| **RS** | 497 | 44 | 453 | 43 | 1 |
| **RO** | 52 | 5 | 47 | 4 | 1 |
| **RR** | 15 | 1 | 14 | 0 | 1 |
| **SC** | 295 | 33 | 262 | 32 | 1 |
| **SP** | 645 | 127 | 518 | 126 | 1 |
| **SE** | 75 | 3 | 72 | 2 | 1 |
| **TO** | 139 | 4 | 135 | 3 | 1 |

### Machine-readable lists

| File | Description | Rows |
|------|-------------|-----:|
| [iss-municipal-not-embedded.json](../data/coverage-gaps/iss-municipal-not-embedded.json) | Municipalities with **no** ISS row in the library | 5071 |
| [iss-municipal-estimativa-only.json](../data/coverage-gaps/iss-municipal-estimativa-only.json) | Embedded rows using LC 116 band only — **need municipal legislation citation** | 473 |
| [iss-municipal-official-rate.json](../data/coverage-gaps/iss-municipal-official-rate.json) | State capitals with municipal legislation URLs | 27 |
| [summary.json](../data/coverage-gaps/summary.json) | Totals + per-UF counts | — |

### How to contribute ISS municipal data

1. Find the **municipal ISS law or NFSe portal** citing alíquota min/max (or fixed rate within LC 116 band).
2. Open a GitHub issue — template [`.github/ISSUE_TEMPLATE/iss-municipal-contribution.yml`](../.github/ISSUE_TEMPLATE/iss-municipal-contribution.yml) (labels `good first issue`, `iss-municipal`).
3. PR checklist: update capital seed or fetch script, golden row in `tests/vectors/iss-municipal.official.json`, `docs/OFFICIAL-SOURCES.md`, run `pnpm fetch:data:iss-municipal` + `pnpm generate:coverage-gaps`.
4. Set `estimativa: false` only when legislation URL is cited — never for NFSe emission validation.

Full 5.570-municipality table: deferred — see [ROADMAP.md](ROADMAP.md) S-09.

---

## RG — `@br-validators/core/rg`

All **27 UFs** ship a validator. **SP, RJ, MG** use Ghiorzi modulo check digits. **SC** is format-only with CIASC mask. **Remaining 24 UFs** are format-only because state issuers do not publish a consistent official DV algorithm.

| Need | Action |
|------|--------|
| Official SSP/IGP DV walkthrough for a UF | Issue template [`.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml`](../.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml) · [RG-CONTRIBUTOR-GUIDE.md](community/RG-CONTRIBUTOR-GUIDE.md) |
| Legacy booklet length ranges | Same guide — cite state documentation |

See [RG-GOOD-FIRST-ISSUES.md](community/RG-GOOD-FIRST-ISSUES.md).

---

## Payroll tables (INSS / IRPF)

INSS and IRPF modules are **federal** progressive tables — they do **not** vary by municipality. Sources are cited in [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md). Deferred v2 items: INSS RPPS / MEI, IRPF annual declaration / 13º — not municipality gaps.
