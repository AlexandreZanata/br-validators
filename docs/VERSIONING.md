# Versioning policy

> **BR Validators** follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) (SemVer).
> Package name (working): `br-validators` — version applies to npm releases and git tags.

---

## Version format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

| Segment | When to increment | Example |
|---------|-------------------|---------|
| **MAJOR** | Breaking public API or intentional behavior change on inputs previously considered valid | `1.0.0` → `2.0.0` |
| **MINOR** | New backward-compatible functionality | `1.1.0` — new `validatePis()` export |
| **PATCH** | Backward-compatible bug fix | `1.1.1` — fix CNPJ DV2 weight |
| **PRERELEASE** | Pre-release quality | `0.1.0-alpha.1`, `1.0.0-rc.2` |

---

## Pre-1.0 policy (`0.x.y`)

During alpha/beta:

- **`0.MINOR.PATCH`** — public API may change between minors
- Breaking changes documented in [CHANGELOG.md](../CHANGELOG.md)
- Consumers should pin exact version: `"br-validators": "0.1.0"`

Planned milestones:

| Version | Meaning |
|---------|---------|
| `0.1.0-alpha` | CNPJ (dual) + CPF + pipeline |
| `0.2.0` | Placa + PIX keys |
| `0.3.0` | Boleto / BR Code (partial) |
| `1.0.0` | **Stable API contract** — SemVer guarantees apply fully (see [API freeze](#api-freeze-100)) |

---

## API freeze (1.0.0)

**Effective:** v1.0.0 (2026-06-23)

Until **v2.0.0**, the following are **frozen**:

| Surface | Frozen items |
|---------|----------------|
| `@br-validators/core` | All exports in [LIBRARY-API.md](LIBRARY-API.md); `ValidationErrorCode` values; validator result shapes |
| Subpaths | `cpf`, `cnpj`, `cep`, `telefone`, `cnh`, `renavam`, `titulo-eleitor`, `nfe-chave`, `placa`, `pis-pasep`, `pix`, `brcode`, `boleto`, `cartao-credito`, `inscricao-estadual`, `inscricao-estadual-produtor-rural`, `detect`, `sanitize`, `mask`, `compare`, `batch`, `diff`, `generate` |
| `@br-validators/cli` | Command names and `--json` / `--uf` flags for shipped types |
| `@br-validators/zod` | Schema export names |
| `@br-validators/react-hook-form` | `*Rule()` / `*Resolver()` export names |

**Allowed without MAJOR bump:**

- PATCH: validation bug fixes aligned with official sources (documented in CHANGELOG Security/Fixed)
- MINOR: new optional exports, new validator modules, new `generate()` types
- Official spec changes (RFB/Bacen) — follow [Algorithm versioning](#algorithm-versioning-domain-specific)

**Breaking changes** → v2.0.0 only.

---

## What counts as breaking (MAJOR)

### Always breaking

- Removing or renaming exported function/type
- Changing function signature (required params, return type shape)
- Changing `ValidationErrorCode` enum values without deprecation
- Valid input becomes invalid (or vice versa) **without official spec change**

### Breaking with official spec change

When RFB/Bacen/CONTRAN **changes rules** (e.g. CNPJ excluded letters confirmed):

- If we **align to new official spec** and behavior changes → **MAJOR** + migration guide
- If we add support while keeping old behavior for old format → **MINOR** (e.g. new `validateCnpjV2`)

Document in CHANGELOG with links to [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).

### Not breaking (PATCH or MINOR)

| Change | Bump |
|--------|------|
| Fix wrong check digit (bug vs official spec) | **PATCH** (security/correctness) |
| Add new optional export | **MINOR** |
| Add new validator module | **MINOR** |
| Internal refactor, same public API | **PATCH** if released alone |
| Docs-only | No version bump required (or PATCH) |

---

## Public API surface

Version applies to exports documented in [LIBRARY-API.md](LIBRARY-API.md):

- Package root `br-validators`
- Subpath exports `br-validators/cpf`, `br-validators/cnpj`, etc.
- TypeScript types shipped in package

**Not versioned (internal):**

- Private helpers
- Test utilities
- `docs/` (tracked in repo, not npm SemVer)

---

## Release process

### 1. Prepare

- [ ] All changes in [CHANGELOG.md](../CHANGELOG.md) under `[Unreleased]`
- [ ] **npm READMEs** — `packages/br-validators/README.md` (primary npm page), root `README.md`, and all five adapter/cli `README.md` files show the new version in **Current release** / intro lines (see `.cursor/rules/release-version-publish.mdc`)
- [ ] New subpaths/features reflected in `packages/br-validators/README.md` document and reference-data tables
- [ ] Tests pass (CI green)
- [ ] Official sources cited for algorithm changes
- [ ] SECURITY review for validation logic changes

### 2. Version bump

```bash
# Example — tooling TBD (changesets or manual)
npm version patch|minor|major --no-git-tag-version
```

Update `CHANGELOG.md`: move `[Unreleased]` → `[X.Y.Z] - YYYY-MM-DD`

### 3. Tag

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

Tag format: **`v` + SemVer** (e.g. `v0.1.0-alpha.1`)

### 4. Publish (npm) — CI only

**All publishes go through GitHub Actions.** Do not run `pnpm publish` locally — `prepublishOnly` blocks it.

Push a version tag on `main`:

```bash
git tag -a v1.6.1 -m "Release v1.6.1"
git push origin v1.6.1
```

Requires GitHub secret `NPM_TOKEN` (Automation or granular token with read/write on **all** `@br-validators/*` packages, including create).

**Re-run after failure:** Actions → **Release** → **Run workflow** with the tag name.

Published packages (same semver on each tag):

| Package | Path |
|---------|------|
| `@br-validators/core` | `packages/br-validators/` |
| `@br-validators/cli` | `apps/cli/` |
| `@br-validators/zod` | `packages/br-validators-zod/` |
| `@br-validators/react-hook-form` | `packages/br-validators-rhf/` |
| `@br-validators/express` | `packages/br-validators-express/` |
| `@br-validators/vue` | `packages/br-validators-vue/` |

See [README](../README.md#install).

### 5. GitHub Release

Created automatically by the Release workflow when the tag is pushed. Or manually:

```bash
gh release create v0.11.0-alpha.0 --generate-notes
```

---

## Support window

| Release line | Support |
|--------------|---------|
| **Latest `1.x`** | Features + patches + security |
| **Previous minor** | Security patches only (6 months after next minor) |
| **`0.x`** | Best effort until `1.0.0` |
| **EOL** | No patches; upgrade recommended |

Critical validation bugs (false accept/reject) may receive backports to previous minor at maintainer discretion — see [SECURITY.md](../SECURITY.md).

---

## Deprecation policy

1. **Mark deprecated** in JSDoc + [LIBRARY-API.md](LIBRARY-API.md) — at least **one minor release** before removal
2. **Emit runtime warning** (optional `console.warn` in dev) — one minor release
3. **Remove** in next **MAJOR**

Example:

```
1.2.0 — deprecate isValidCnpjLegacy()
1.3.0 — still present, warning
2.0.0 — removed; use isValidCnpjNumeric()
```

---

## Algorithm versioning (domain-specific)

Validators track **government spec versions** in docs, not only SemVer:

| Field | Location |
|-------|----------|
| CNPJ alphanumeric | IN RFB 2.229/2024 — [CNPJ-ALPHANUMERIC.md](CNPJ-ALPHANUMERIC.md) |
| Spec change date | [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md) |
| Breaking spec alignment | MAJOR + CHANGELOG "Migration" section |

When spec changes mid-release-line:

```
## Migration 1.x → 1.y (CNPJ excluded letters)

Before: all A-Z accepted in base
After:  I, O, U excluded per RFB notice DATE

Action: audit stored CNPJs; re-validate with v1.y.z+
```

---

## Data-only releases (automated daily bot)

When the daily data refresh bot (`.github/workflows/data-refresh-bot.yml`) detects embedded JSON drift or is triggered with `force_publish`:

| Trigger | Version format | Example |
|---------|----------------|---------|
| Human code/data fix release | `MAJOR.MINOR.PATCH` | `1.8.3` |
| Bot drift (daily) | `MAJOR.MINOR.PATCH-data.N` | `1.8.3-data.1`, `1.8.3-data.2` |
| Manual `force_publish` | Same as bot drift | `reason` input required |

**Why not `1.8.0001`?** npm/SemVer treat `1.8.0001` as `1.8.1` (leading zeros stripped), which sorts **below** `1.8.3` and would break `latest`. The `-data.N` suffix keeps the human base (`1.8.3`) and a numeric daily counter (`1`, `2`, …) identical in **git tags, `package.json`, and npm**.

| Automation | Script |
|------------|--------|
| Drift detected | `scripts/bump-data-patch.ts` → tag `v1.8.3-data.1` → `release.yml` |
| No drift | Reports commit only — no version bump |

**Not handled by the bot:** MINOR (new dataset module) or MAJOR (API break) — human release per [Release process](#2-version-bump).

---

## Changelog discipline

Every user-facing change → [CHANGELOG.md](../CHANGELOG.md):

- **Added** — new features
- **Changed** — behavior changes (non-breaking)
- **Deprecated** — soon-to-remove APIs
- **Removed** — removed APIs
- **Fixed** — bug fixes
- **Security** — CVE-worthy or validation correctness fixes

Security fixes: always under **Security** section even if patch release.

---

## Compatibility targets (planned)

| Target | Policy |
|--------|--------|
| Node.js | `>=18` (LTS) |
| Bun / Deno | Best effort |
| Browsers | ESM bundle; no Node-only APIs in core |
| TypeScript | `>=5.0`; types included |

Breaking Node baseline → **MAJOR**.

---

## Related

| Document | Link |
|----------|------|
| Public API | [LIBRARY-API.md](LIBRARY-API.md) |
| Migration guide | [MIGRATION.md](../MIGRATION.md) |
| Changelog | [CHANGELOG.md](../CHANGELOG.md) |
| Security | [SECURITY.md](../SECURITY.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |
| Open source | [OPEN-SOURCE.md](OPEN-SOURCE.md) |
