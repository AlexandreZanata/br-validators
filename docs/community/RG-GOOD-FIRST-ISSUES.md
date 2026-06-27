# RG good first issues — remaining UFs

> **Status:** Phase 33c complete — **27/27 UFs shipped** (2026-06-26 batch 3: CE, PE, PI, RN, RO, RR, SE, TO).

> **Labels:** `good first issue`, `rg-uf`  
> **Template:** [`.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml`](../../.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml) (legacy: `rg-uf-contribution.md`)  
> **Depends on:** Phase 27c RG phase 1 (SP, RJ, MG, PR, RS, SC shipped)

> **Contributor guide (how to open issues, official sources, algorithm reporting):** [RG-CONTRIBUTOR-GUIDE.md](RG-CONTRIBUTOR-GUIDE.md)  
> **Implementation checklist:** `packages/br-validators/src/core/rg/CONTRIBUTING-UF.md`  
> **Pending list API:** `getRgPendingUfs()` — returns `[]` when complete · **Research URLs:** `getRgResearchUrl(uf)`

All Brazilian states now have RG validators. New contributions should target **DV algorithm upgrades** (when official SSP walkthroughs are found) or **length-range support** for legacy booklets — not net-new UF registration.

## Shipped (all 27 UFs)

See [OFFICIAL-SOURCES.md § RG](../OFFICIAL-SOURCES.md#rg--reference-index) for the full table, golden vectors, and official URLs.

| Group | UFs | Notes |
|-------|-----|-------|
| Ghiorzi DV | SP, RJ, MG | Modulo-11 / mod10-alternating |
| Format-only + mask | SC | 9 digits + CIASC mask |
| Format-only | PR, RS, BA, AC, AL, AM, AP, DF, ES, GO, MA, MS, MT, PA, PB, CE, PE, PI, RN, RO, RR, SE, TO | `checkDigitValidated: false` |

## Open for contribution

None — `getRgPendingUfs()` is empty. File issues for DV upgrades or documented format corrections only.

## Maintainer checklist when merging a UF

- [ ] `packages/br-validators/tests/vectors/rg.<uf>.official.json`
- [ ] `src/core/rg/<uf>.ts` registered in `RG_SUPPORTED_UFS`
- [ ] Remove UF from `RG_PENDING_UFS` in `constants.ts`
- [ ] Row in [docs/OFFICIAL-SOURCES.md § RG](../OFFICIAL-SOURCES.md#rg--reference-index)
- [ ] `pnpm --filter @br-validators/core test:coverage` — 100% on `src/**`
- [ ] CHANGELOG `[Unreleased]`

## API rule

`validateRg(raw, { uf })` **requires UF**. `detect()` does **not** auto-classify RG.
