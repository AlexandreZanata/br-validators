# Roadmap — BR Validators

> Phased delivery. Each module ships in **library + CLI + playground** (see [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md)).
> **TypeScript first** — [TECH-STACK.md](TECH-STACK.md).
> **npm:** `@br-validators/core` + `@br-validators/cli` + `@br-validators/zod` + `@br-validators/react-hook-form` · **Current:** `v0.12.0-alpha.3+`

---

## Phase 0 — Foundation ✅

- [x] Project documentation (`docs/`)
- [x] Official sources catalog
- [x] Architecture, **TECH-STACK**, **DELIVERY-SURFACES**
- [x] MIT license + governance
- [x] **Monorepo scaffold** — `packages/br-validators`, `apps/cli`, `apps/playground`
- [x] pnpm workspaces + CI (GitHub Actions)
- [x] Vercel project → `apps/playground` ([doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app/))

---

## Phase 1 — CNPJ (v0.1.0-alpha) ✅

| Deliverable | CNPJ |
|-------------|------|
| Library | `validateCnpj`, `formatCnpj`, `stripCnpj` — numeric + alphanumeric |
| CLI | `br-validators cnpj validate\|format\|strip` + `--json` |
| Playground | `/cnpj` |
| Source | [RFB CNPJ alfanumérico PDF](OFFICIAL-SOURCES.md) |

**Release criteria:** Golden vector `12ABC34501DE35`; all three surfaces live.

---

## Phase 1b — CPF + CEP (v0.1.0-beta) ✅

| Module | Library | CLI | Playground | Source |
|--------|---------|-----|------------|--------|
| **CPF** | ✓ | ✓ | `/cpf` | RFB |
| **CEP** | ✓ | ✓ | `/cep` | Correios |

---

## Phase 2 — Enterprise fields (v0.2.0) ✅

| Module | Library | CLI | Playground | Source |
|--------|---------|-----|------------|--------|
| **Placa** | ✓ | ✓ | `/placa` | CONTRAN 729/2018 |
| **PIX key** | ✓ | ✓ | `/pix` | Bacen DICT |
| **Cartão (Luhn)** | ✓ | ✓ | `/cartao` | ISO 7812 |

---

## Phase 3 — Financial (v0.3.0) — partial ✅

| Module | Library | CLI | Playground | Status |
|--------|---------|-----|------------|--------|
| **Boleto cobrança** | ✓ | ✓ | `/boleto` | Situação 1 + 2 shipped |
| **BR Code** | ✓ `@br-validators/core/brcode` | ✓ `brcode …` | ✓ `/brcode` | Shipped — [Bacen Manual BR Code](OFFICIAL-SOURCES.md) |
| **Boleto arrecadação** | ✓ | via `boleto` | via `boleto` | Shipped — [FEBRABAN Layout v7](OFFICIAL-SOURCES.md) |

---

## Phase 4 — Extended tax IDs (v0.10.0-alpha) ✅

| Module | Library | CLI | Playground | Status |
|--------|---------|-----|------------|--------|
| **PIS/PASEP** | ✓ | ✓ | `/pis` | Shipped |
| **IE (27 UFs)** | ✓ | ✓ | `/ie` | All states shipped |
| **Alphanumeric CPF** | Blocked | — | — | RFB spec TBD |

---

## v1.0.0 target (next milestone)

| Module / requirement | Library | CLI | Playground | Status |
|----------------------|---------|-----|------------|--------|
| **Telefone (F-01)** | ✓ `@br-validators/core/telefone` | ✓ `telefone …` | ✓ `/telefone` | Shipped — [Anatel](OFFICIAL-SOURCES.md) |
| **BR Code (F-03)** | ✓ `@br-validators/core/brcode` | ✓ `brcode …` | ✓ `/brcode` | Shipped — [Bacen Manual BR Code](OFFICIAL-SOURCES.md) |
| **Boleto arrecadação (F-02)** | ✓ | via `boleto` | via `boleto` | Shipped — [FEBRABAN Layout v7](OFFICIAL-SOURCES.md) |
| npm publish `@br-validators/core` + `@br-validators/cli` | — | — | — | `v0.12.0-alpha.3` |
| npm publish `@br-validators/zod` + `@br-validators/react-hook-form` | — | — | — | `v0.12.0-alpha.3` (release.yml) |
| Platform APIs: `detect`, `sanitize`, `mask`, `compare`, `batch`, `diff`, `generate` | ✓ | partial | partial | Shipped in core |
| API freeze (SemVer guarantees) | — | — | — | Pending |

**Deferred to post-v1.0 or v1.1:**

- Alphanumeric CPF (when RFB publishes spec)
- IE SP rural `P…` format — shipped in `validateIeProdutorRural`
- `@br-validators/adapters-correios` — CEP HTTP lookup (F-06)
- `@br-validators/react` — masked input hooks (F-07)
- Playwright E2E for playground

---

## Phase 10 — Integrations (v0.11.0-alpha) — partial ✅

| Module | Package | Status |
|--------|---------|--------|
| **Zod schemas (F-04)** | `@br-validators/zod` | Shipped + npm publish in release.yml |
| **React Hook Form (F-05)** | `@br-validators/react-hook-form` | Shipped + npm publish in release.yml |
| CEP HTTP lookup (F-06) | — | Backlog |
| React masked inputs (F-07) | — | Backlog |
| PHP port (F-08) | — | Backlog |

---

## Language ports (post v1.0)

| Order | Language | Package | When |
|-------|----------|---------|------|
| 1 | **TypeScript** | `@br-validators/core` | Phases 0–4 |
| 2 | PHP | Composer | After TS v1.0 if demand |
| 3 | Python | PyPI | If demand |

---

## External events

| Event | Action |
|-------|--------|
| RFB excluded CNPJ letters list published | Patch library + CLI + playground |
| RFB alphanumeric CPF spec | New module — all three surfaces |
| SEFAZ algorithm change | Patch ≤ 48h per [SECURITY.md](../SECURITY.md) |
