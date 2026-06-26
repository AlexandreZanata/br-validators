# Security Policy

> BR Validators is a **100% open-source** validation library (MIT).
> Security issues in validation logic are **critical** — a false positive/negative on CPF/CNPJ undermines every downstream system.

---

## Supported versions

| Version | Supported |
|---------|-----------|
| Latest stable (`1.x`) | Yes |
| Previous minor (`1.(x-1)`) | Security fixes only |
| Pre-1.0 (`0.x`) | Best effort during alpha/beta |
| Unreleased `main` | Fix forward; no backports unless critical |

See [docs/VERSIONING.md](docs/VERSIONING.md) for release and support policy.

---

## Reporting a vulnerability

**Do not open a public GitHub issue** for security vulnerabilities.

### Preferred: GitHub Private Security Advisory

1. Go to [github.com/AlexandreZanata/br-validators/security/advisories](https://github.com/AlexandreZanata/br-validators/security/advisories)
2. Click **Report a vulnerability**
3. Describe the issue with reproduction steps and impact

Official guidance: [GitHub — Privately reporting a security vulnerability](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)

### Alternative: email

If GitHub advisories are unavailable, email the maintainers with subject `[SECURITY] br-validators`:

- Include steps to reproduce
- Affected version(s)
- Impact assessment (e.g. incorrect CNPJ validation accepts invalid input)

---

## CVE request SLA

| Severity | Acknowledge | Initial assessment | Target fix | CVE |
|----------|-------------|-------------------|------------|-----|
| **Critical** | 48 hours | 5 business days | Patch ≤ 72 h after official spec confirm | Requested when applicable |
| **High** | 48 hours | 5 business days | Patch ≤ 7 days | Requested when applicable |
| **Medium** | 5 business days | 10 business days | Next patch/minor | Maintainer discretion |
| **Low** | 10 business days | — | Next minor | Unlikely |

When official agencies (RFB, Bacen) change algorithms, we treat misalignment as **High** minimum until patched.

CVE issuance follows [GitHub repository security advisories](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/about-repository-security-advisories).

---

## What to report

| In scope | Out of scope |
|----------|--------------|
| Incorrect check-digit algorithm (false accept/reject) | Bugs in consumer apps using this library |
| ReDoS or catastrophic backtracking in regex validators | Social engineering |
| Supply-chain issues in published npm package | Vulnerabilities in devDependencies only (see [Dependency audit](#dependency-audit-ci)) |
| Documentation that leads to insecure integration | Missing features (use feature requests) |

---

## Severity (library-specific examples)

| Severity | Example | Target fix |
|----------|---------|------------|
| **Critical** | Valid CNPJ rejected / invalid CNPJ accepted at scale | Patch release ≤ 72h after official spec confirmation |
| **High** | Wrong behavior on edge case with official test vector | Patch release ≤ 7 days |
| **Medium** | Non-security correctness bug | Next patch/minor |
| **Low** | Documentation or DX issue with security implication | Next minor |

---

## Disclosure policy

- **Coordinated disclosure** — we request 90 days before public disclosure unless fix is released sooner.
- Credit given in [CHANGELOG.md](CHANGELOG.md) and GitHub advisory (unless reporter prefers anonymity).
- CVE requested for Critical/High when applicable.

---

## Security practices (project)

### Dependency audit (CI)

Every push to `main` / `developing` and every pull request runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

| Scope | Command | Policy |
|-------|---------|--------|
| **Runtime** (`dependencies` in published packages) | `pnpm audit --prod --audit-level=high` | **Fail CI** on high or critical |
| **Dev** (tooling, test, docs site) | `pnpm audit --audit-level=high` | **Warn only** — does not block merge |

Use `pnpm audit` (not bare `npm audit` at repo root) — lockfile is `pnpm-lock.yaml`.

References: [pnpm audit](https://pnpm.io/cli/audit) · [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)

#### False positives and accepted risks

1. **Confirm** the advisory applies to code paths we ship (`@br-validators/core` has **zero** runtime npm dependencies).
2. **Prefer upgrade** — bump the vulnerable package in `pnpm-lock.yaml` via `pnpm update <pkg>` and re-run `pnpm verify`.
3. **pnpm overrides** — only when upstream has no patch; document in [CHANGELOG.md](CHANGELOG.md) and `.local/security-audit.md` with review date.
4. **Dev-only high** — if the finding is in Vitest/VitePress/playground tooling with no production path, track in `.local/security-audit.md`; CI warns but does not fail.

Maintainers re-run `pnpm audit --prod --audit-level=high` before every release tag (also enforced in Release workflow via `pnpm verify`).

### npm publish integrity

| Control | Implementation |
|---------|----------------|
| **CI-only publish** | Local `pnpm publish` blocked by `scripts/assert-ci-publish.mjs` |
| **Frozen lockfile** | `pnpm install --frozen-lockfile` in CI and Release |
| **Version gate** | Release workflow verifies git tag matches all six `package.json` versions |
| **OIDC** | Release workflow sets `id-token: write` for npm trusted publishing / provenance |
| **Registry verify** | Post-publish `npm view @br-validators/*@version` smoke check |

Published runtime packages (`@br-validators/core`, adapters) bundle **no third-party runtime deps** — supply-chain risk is primarily **publish pipeline** integrity, not transitive npm deps in the tarball.

See [docs/BRANCHING.md](docs/BRANCHING.md) and [docs/SECURITY-PRACTICES.md](docs/SECURITY-PRACTICES.md).

### Other practices

- No network I/O in core validators (reduces attack surface)
- Golden test vectors from [official sources](docs/OFFICIAL-SOURCES.md)
- All contributions must be MIT-compatible — see [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md)

---

## Secure contribution

Contributors must **not** include:

- Real CPF/CNPJ numbers from production databases in tests (use synthetic/official examples only)
- Secrets, API keys, or `.env` files
- Code under incompatible licenses

See [CONTRIBUTING.md](CONTRIBUTING.md#security-contributions).
