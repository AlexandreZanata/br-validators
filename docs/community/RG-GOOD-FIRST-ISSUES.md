# RG good first issues — remaining 21 UFs

> **Labels:** `good first issue`, `rg-uf`  
> **Template:** [.github/ISSUE_TEMPLATE/rg-uf-contribution.md](../../.github/ISSUE_TEMPLATE/rg-uf-contribution.md)  
> **Depends on:** Phase 27c RG phase 1 (SP, RJ, MG, PR, RS, SC shipped)

> **Contributor guide:** `packages/br-validators/src/core/rg/CONTRIBUTING-UF.md`  
> **Pending list API:** `getRgPendingUfs()` · **Research URLs:** `getRgResearchUrl(uf)`

Phase 1 covers six states (~70% of population). The remaining **21 UFs** are ideal **good first issues** for contributors who can cite a state **SSP / Polícia Civil** official source (not SEFAZ-IE calculators — those validate Inscrição Estadual, not RG).

## Shipped (do not re-open)

| UF | Algorithm | Golden vector |
|----|-----------|---------------|
| SP | Modulo 11 | `120300011` |
| RJ | Modulo 10 | `27998111` |
| MG | Modulo 10 + optional `M` | `27998111` |
| PR | Format-only (8 digits) | `12345678` |
| RS | Format-only (10 digits) | `1234567890` |
| SC | Format-only (9 digits) | `123456789` |
| BA | Format-only (10 digits; IIPM legacy) | `1234567800` |
| AC | Format-only (6 digits; SSP-AC legacy) | `123456` |
| AL | Format-only (7 digits; POLCAL/IIEAL legacy) | `1234567` |
| AM | Format-only (9 digits; IIACM/SSP-AM legacy) | `123456789` |
| AP | Format-only (9 digits; PCA/SSP-AP legacy) | `123456789` |
| DF | Format-only (7 digits; PCDF legacy) | `1234567` |

## Open for contribution

| UF | Issue title suggestion | Research URL (`getRgResearchUrl`) |
|----|------------------------|-----------------------------------|
| CE | `[rg] Add RG validation for UF CE` | PCivil CE |
| ES | `[rg] Add RG validation for UF ES` | PCivil ES |
| GO | `[rg] Add RG validation for UF GO` | PCivil GO |
| MA | `[rg] Add RG validation for UF MA` | PCivil MA |
| MS | `[rg] Add RG validation for UF MS` | PCivil MS |
| MT | `[rg] Add RG validation for UF MT` | PCivil MT |
| PA | `[rg] Add RG validation for UF PA` | PCivil PA |
| PB | `[rg] Add RG validation for UF PB` | PCivil PB |
| PE | `[rg] Add RG validation for UF PE` | PCivil PE |
| PI | `[rg] Add RG validation for UF PI` | PCivil PI |
| RN | `[rg] Add RG validation for UF RN` | PCivil RN |
| RO | `[rg] Add RG validation for UF RO` | PCivil RO |
| RR | `[rg] Add RG validation for UF RR` | PCivil RR |
| SE | `[rg] Add RG validation for UF SE` | PCivil SE |
| TO | `[rg] Add RG validation for UF TO` | PCivil TO |

## Maintainer checklist when merging a UF

- [ ] `packages/br-validators/tests/vectors/rg.<uf>.official.json`
- [ ] `src/core/rg/<uf>.ts` registered in `RG_SUPPORTED_UFS`
- [ ] Remove UF from `RG_PENDING_UFS` in `constants.ts`
- [ ] Row in [docs/OFFICIAL-SOURCES.md § RG](../OFFICIAL-SOURCES.md#rg--reference-index)
- [ ] `pnpm --filter @br-validators/core test:coverage` — 100% on `src/**`
- [ ] CHANGELOG `[Unreleased]`

## API rule

`validateRg(raw, { uf })` **requires UF**. `detect()` does **not** auto-classify RG.
