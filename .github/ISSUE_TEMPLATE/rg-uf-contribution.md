---
name: RG UF contribution (historical)
about: Legacy template — all 27 UFs shipped; use rg-dv-upgrade.yml for DV algorithm upgrades
title: '[rg] Add RG validation for UF __'
labels: ['good first issue', 'rg-uf']
assignees: ''
---

> **Status:** 27/27 UFs shipped. For new contributions use [`.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml`](rg-dv-upgrade.yml) — official SSP/IGP DV walkthrough upgrades only.

## UF

- [ ] UF code: __ (e.g. `BA`, `GO`, `DF`)

> **Read first:** [docs/community/RG-CONTRIBUTOR-GUIDE.md](docs/community/RG-CONTRIBUTOR-GUIDE.md) — how to cite official sources and report algorithms. Most UFs **lack consistent official legacy RG/DV documentation**; format-only is acceptable only with a state issuer URL and honest algorithm scope.

## Official source

- [ ] State secretariat / IGP / SSP URL: __
- [ ] Algorithm documented? (modulo / format-only / unknown)
- [ ] If no published DV: confirm format-only scope in issue

## Format specification

| Field | Value |
|-------|-------|
| Canonical length | __ digits |
| Base length (if DV) | __ |
| Mask pattern | e.g. `XX.XXX.XXX-X` |
| Allowed prefixes | e.g. `M` (MG) |
| Check digit `X` allowed? | yes / no |

## Golden vectors

- [ ] `packages/br-validators/tests/vectors/rg.<uf>.official.json` added
- [ ] Valid raw + masked examples from official walkthrough or state doc
- [ ] At least one invalid example (wrong DV or length)

## Implementation checklist

- [ ] `src/core/rg/<uf>.ts` — `validateRg<Uf>`, `stripRg<Uf>`
- [ ] Registered in `RG_SUPPORTED_UFS` and `RG_UF_RULES`
- [ ] `getRgOfficialSourceUrl('<UF>')` URL set
- [ ] Playground UF selector includes new code (automatic when registered)
- [ ] Row in [docs/OFFICIAL-SOURCES.md § RG](docs/OFFICIAL-SOURCES.md#rg--reference-index)
- [ ] `pnpm --filter @br-validators/core test:coverage` — 100% on `src/**`
- [ ] CHANGELOG `[Unreleased]` updated

## Notes

RG is **not** auto-detected by `detect()` — UF is always required at the API boundary.
