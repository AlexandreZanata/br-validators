# Contributing to BR Validators

Thank you for helping build a **100% open-source**, trustworthy validation library for Brazilian documents.

**Language:** All code, comments, docs, commits, and PR descriptions must be in **English**.

---

## Before you start

1. Read [docs/VISION.md](docs/VISION.md) and [docs/GLOSSARY.md](docs/GLOSSARY.md)
2. Check [docs/ROADMAP.md](docs/ROADMAP.md) for planned scope
3. Validators require an [official source](docs/OFFICIAL-SOURCES.md) — no algorithm without citation
4. Read [AGENTS.md](AGENTS.md) if using AI coding agents

---

## Open source commitment

This project is **permanently open source** under the [MIT License](LICENSE).

| Allowed | Not allowed |
|---------|-------------|
| MIT-compatible contributions | Proprietary or source-unavailable code |
| Forks and commercial use | "Open core" paid-only validators in this repo |
| Optional separate UI/adapters packages (also OSS) | CLA that assigns copyright away from contributors |

Full policy: [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md)

By contributing, you agree your contributions are licensed under MIT.

---

## How to contribute

### 1. Find or open an issue

Use a [GitHub issue template](.github/ISSUE_TEMPLATE/config.yml):

| Template | Labels | When to use |
|----------|--------|-------------|
| **Bug report** | `bug` | Wrong validation, formatting, or API behavior |
| **Data source alert** | `data-source` | Daily bot / `CRITICAL-ALERTS.md` — endpoint moved or failing |
| **ISS municipal rate contribution** | `good first issue`, `iss-municipal`, `enhancement` | Cite municipal ISS legislation — see [COVERAGE-GAPS.md](docs/COVERAGE-GAPS.md) |
| **RG DV algorithm upgrade** | `good first issue`, `rg-uf`, `enhancement` | Official SSP/IGP DV walkthrough for a format-only UF |
| **Feature request** | `enhancement` | New validator or dataset — check [ROADMAP](docs/ROADMAP.md) first |

Bot automation PRs use `data-refresh` and `automated-release` (do not open manually).

- **Security:** see [SECURITY.md](SECURITY.md) — no public issues

### 2. Fork and branch

```bash
git checkout -b feat/cnpj-alphanumeric-dv2
# or: fix/cpf-known-invalid-pattern
```

Branch naming: `feat/`, `fix/`, `docs/`, `test/`, `chore/`

### 3. Implement

- Smallest diff that solves one logical change
- Add/update tests with golden vectors from official docs
- Update [CHANGELOG.md](CHANGELOG.md) under `[Unreleased]`
- Update [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md) if adding a validator
- Follow [docs/LIBRARY-API.md](docs/LIBRARY-API.md) for public exports

### 4. Verify (when toolchain exists)

```bash
pnpm test
pnpm lint
pnpm typecheck
```

Until scaffold exists, document manual verification in PR.

### 5. Pull request

PR title: `[cpf] fix modulo 11 remainder mapping` or `[docs] add versioning policy`

PR description must include:

- [ ] What changed and why
- [ ] Official source link (if algorithm change)
- [ ] Test vectors added
- [ ] CHANGELOG updated
- [ ] No breaking change OR marked as breaking with migration note
- [ ] MIT-compatible only

---

## Security contributions

Security fixes are welcome and prioritized.

1. **Report first** via [SECURITY.md](SECURITY.md) (private advisory)
2. Wait for maintainer ack before public PR (or coordinate on advisory thread)
3. Include regression test with minimal reproducer
4. Do **not** add real PII (CPF/CNPJ from production) to tests

Security researchers: see severity table in [SECURITY.md](SECURITY.md).

---

## Validation algorithm contributions

Required checklist for new/changed validators:

- [ ] Row in [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md)
- [ ] Business rules in [docs/VALIDATION-RULES.md](docs/VALIDATION-RULES.md)
- [ ] Use case in `docs/use-cases/` (if new identifier type)
- [ ] Golden vectors in `tests/vectors/`
- [ ] Public API in [docs/LIBRARY-API.md](docs/LIBRARY-API.md)
- [ ] Version impact noted per [docs/VERSIONING.md](docs/VERSIONING.md)

**Wrong check digits are security bugs** — treat with same urgency as [SECURITY.md](SECURITY.md).

### RG per-UF contributions

RG has **no federal algorithm** — each state may use a different format and check digit rule. **27/27 UFs shipped**; remaining work is **DV algorithm upgrades** when official SSP/IGP walkthroughs are published.

1. Open an issue using [`.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml`](.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml) (labels: `good first issue`, `rg-uf`)
2. Cite an official state secretariat document — format-only is acceptable when no DV is published
3. Add `tests/vectors/rg.<uf>.official.json` with golden valid/invalid pairs
4. Implement or upgrade `validateRg<Uf>` in `packages/br-validators/src/core/rg/<uf>.ts`
5. Update [docs/OFFICIAL-SOURCES.md § RG](docs/OFFICIAL-SOURCES.md#rg--reference-index) coverage table

---

## Reference data contributions (IBGE, Bacen, etc.)

Required checklist for new static lookup modules:

- [ ] Official `.gov.br` source in [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md)
- [ ] `metadata.json` with `DatasetMetadata` fields (see [docs/DATA-FRESHNESS.md](docs/DATA-FRESHNESS.md))
- [ ] Register in `data-catalog/registry.ts`
- [ ] Fetch script in `scripts/fetch-*.ts` — **no runtime network** in `src/`
- [ ] Golden vectors in `tests/vectors/*.official.json` from official API samples

### Test policy — business logic, not coverage theater

Tests MUST prove **observable behavior** that consumers rely on:

| DO | DON'T |
|----|-------|
| Assert golden codes from official sources (e.g. IBGE `3550308` → São Paulo/SP) | Mirror implementation line-by-line just to hit 100% |
| Cover edge cases that occur in real government data (e.g. municipality with null `microrregiao`) | Assert `toBe(true)` on functions under test without independent expected value |
| Verify metadata transparency (`capturadoEm`, `endpoints`, row counts) | Mock embedded JSON or skip catalog registration |
| Fail when official vectors break after data refresh | Disable tests or exclude files from coverage to hide gaps |

100% coverage on `packages/br-validators/src/**` is mandatory — but every test must answer a **business question**: “Does this lookup return what IBGE says?” not “Did my function run?”

### ISS municipal rate contributions

Municipal ISS alíquotas are **per municipality** — INSS/IRPF are national tables and out of scope here.

1. Open issue: [`.github/ISSUE_TEMPLATE/iss-municipal-contribution.yml`](.github/ISSUE_TEMPLATE/iss-municipal-contribution.yml) (labels: `good first issue`, `iss-municipal`)
2. Check [docs/COVERAGE-GAPS.md](docs/COVERAGE-GAPS.md) — `data/coverage-gaps/iss-municipal-not-embedded.json` or `iss-municipal-estimativa-only.json`
3. Cite **municipal legislation** or official NFSe portal URL (`leiUrl`) — LC 116 Art. 8 band alone is estimation-only
4. Add golden row to `tests/vectors/iss-municipal.official.json`
5. Run `pnpm fetch:data:iss-municipal` (maintainers) or update capital seeds / embed builder
6. Run `pnpm generate:coverage-gaps` to refresh gap lists

### RG DV algorithm upgrades

All 27 UFs ship format or DV validators. New RG work is **DV upgrades** when official state documentation is found.

1. Open issue: [`.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml`](.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml) (labels: `good first issue`, `rg-uf`)
2. Follow [docs/community/RG-CONTRIBUTOR-GUIDE.md](docs/community/RG-CONTRIBUTOR-GUIDE.md)
3. Legacy net-new UF template: [`.github/ISSUE_TEMPLATE/rg-uf-contribution.md`](.github/ISSUE_TEMPLATE/rg-uf-contribution.md) (historical — 27/27 complete)

---

## Documentation contributions

Docs live in `docs/` and root (`README.md`, `SECURITY.md`, etc.).

- Use ubiquitous terms from [docs/GLOSSARY.md](docs/GLOSSARY.md)
- Link official PDFs/URLs, not secondary blogs
- Keep [docs/README.md](docs/README.md) index updated

---

## Versioning and releases

Maintainers follow [docs/VERSIONING.md](docs/VERSIONING.md).

Contributors:

- **Patch:** bug fix, docs fix, official spec alignment
- **Minor:** new validator module, new optional export
- **Major:** breaking public API or intentional behavior change on previously valid input

Pre-1.0 (`0.x`): minor bumps may include breaking changes — note in CHANGELOG.

---

## Code of conduct

Be respectful and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Questions

Open a [GitHub Discussion](https://github.com/AlexandreZanata/br-validators/discussions) for questions (when enabled) or an issue labeled `question`.
