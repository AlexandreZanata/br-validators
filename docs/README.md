# Documentation index — BR Validators

> **100% open-source library** for formatting and validating Brazilian document identifiers and related data.
> All docs in English. Official algorithms only — no guesswork on check digits.

---

## Start here

| Document | Purpose |
|----------|---------|
| [VISION.md](VISION.md) | Mission, scope, principles, non-goals |
| [GLOSSARY.md](GLOSSARY.md) | Ubiquitous language — use these terms in code |
| [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md) | Primary sources per data type (RFB, Bacen, CONTRAN, Correios) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Module layout, layers, design patterns |
| [LIBRARY-API.md](LIBRARY-API.md) | Public API contract (functions, types, errors) |
| [VALIDATION-RULES.md](VALIDATION-RULES.md) | Business rules in GIVEN/WHEN/THEN |
| [ROADMAP.md](ROADMAP.md) | Phases, priorities, CNPJ alphanumeric timeline |
| [CNPJ-ALPHANUMERIC.md](CNPJ-ALPHANUMERIC.md) | Deep dive: numeric + alphanumeric CNPJ (priority #1) |
| [TECH-STACK.md](TECH-STACK.md) | TypeScript first, monorepo, branded types |
| [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md) | Library + CLI + Vercel playground (all doc types) |
| [NEW-PROJECT-CHECKLIST.md](NEW-PROJECT-CHECKLIST.md) | Pre-implementation checklist |

## Governance (license, security, releases)

| Document | Purpose |
|----------|---------|
| [OPEN-SOURCE.md](OPEN-SOURCE.md) | 100% MIT open source commitment |
| [VERSIONING.md](VERSIONING.md) | SemVer, releases, support window |
| [../MIGRATION.md](../MIGRATION.md) | v1.x → v2.0 breaking changes (lookup API, deprecated getters) |
| [SECURITY-PRACTICES.md](SECURITY-PRACTICES.md) | Maintainer & integrator security |
| [GOVERNANCE.md](GOVERNANCE.md) | Document map and decision log |
| [../LICENSE](../LICENSE) | MIT license text |
| [../SECURITY.md](../SECURITY.md) | Report vulnerabilities (private) |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute |
| [COVERAGE-GAPS.md](COVERAGE-GAPS.md) | Missing municipalities / estimation-only ISS / RG DV gaps |
| [../CHANGELOG.md](../CHANGELOG.md) | Release history |
| [API Reference (TypeDoc)](https://docs.br-validators.dev/api-reference/) | Auto-generated signatures — `pnpm docs:api` |

## Use cases

| ID | File | Summary |
|----|------|---------|
| UC-001 | [use-cases/UC-001-validate-cpf.md](use-cases/UC-001-validate-cpf.md) | Validate and format CPF |
| UC-002 | [use-cases/UC-002-validate-cnpj.md](use-cases/UC-002-validate-cnpj.md) | Validate numeric + alphanumeric CNPJ |
| UC-003 | [use-cases/UC-003-format-document.md](use-cases/UC-003-format-document.md) | Raw input → official mask |
| UC-004 | [use-cases/UC-004-validate-placa.md](use-cases/UC-004-validate-placa.md) | Legacy plate + Mercosul + converter |
| UC-005 | [use-cases/UC-005-validate-pix-key.md](use-cases/UC-005-validate-pix-key.md) | PIX key types (CPF, CNPJ, email, phone, EVP) |

## For agents

1. Read [GLOSSARY.md](GLOSSARY.md) before naming anything in code.
2. Implement only algorithms traced to [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).
3. Check [LIBRARY-API.md](LIBRARY-API.md) before adding public exports.
4. CNPJ alphanumeric is **P0** — see [CNPJ-ALPHANUMERIC.md](CNPJ-ALPHANUMERIC.md) and [ROADMAP.md](ROADMAP.md).
