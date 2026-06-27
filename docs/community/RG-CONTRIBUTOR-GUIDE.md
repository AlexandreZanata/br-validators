# RG contributor guide — opening issues and citing official sources

> **Audience:** Contributors adding per-UF RG (Registro Geral) validators  
> **Labels:** `good-first-issue`, `rg-uf`  
> **Issue template:** [`.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml`](../../.github/ISSUE_TEMPLATE/rg-dv-upgrade.yml) (legacy net-new UF: `rg-uf-contribution.md`)  
> **Implementation checklist:** [CONTRIBUTING-UF.md](../../packages/br-validators/src/core/rg/CONTRIBUTING-UF.md)  
> **Open UF index:** [RG-GOOD-FIRST-ISSUES.md](RG-GOOD-FIRST-ISSUES.md)

---

## Why this guide exists

Brazil has **no federal RG algorithm**. Each state (UF) issued its own legacy numbering through SSP, Polícia Civil, or state identification institutes. The library ships validators only when a contribution cites **official** state documentation and documents what can (and cannot) be validated.

**Important caveat:** For **most UFs**, there is **no single, consistent official publication** of legacy RG format and check-digit (DV) rules comparable to Ghiorzi for SP/RJ/MG. Many states only document CIN (CPF-based) issuance today; legacy digit counts vary by issuance era. This repository therefore:

- Ships **format-only** validators when an official issuer URL exists but **no DV walkthrough** is published.
- Defers UFs with **variable legacy lengths** (e.g. CE) until the schema supports ranges or a defensible fixed length is cited.
- **Rejects** SEFAZ Inscrição Estadual calculators as RG sources — those validate **IE**, not identity RG.

---

## Step 1 — Pick a UF

1. Call `getRgPendingUfs()` or read [RG-GOOD-FIRST-ISSUES.md](RG-GOOD-FIRST-ISSUES.md).
2. Use `getRgResearchUrl(uf)` for the state SSP / Polícia Civil **entry point** (research hint only — not an algorithm source).
3. **One UF per issue and per PR.** Do not re-open shipped UFs (see good-first-issues table).

---

## Step 2 — Open a GitHub issue (before coding)

Use the template: **New issue → RG DV algorithm upgrade**  
Or copy the title: `[rg] Add RG validation for UF <CODE>`

### Required issue fields

| Section | What to provide |
|---------|-----------------|
| **UF** | Two-letter code (e.g. `MA`) |
| **Official source** | HTTPS URL from **state SSP / PCivil / identification institute** — not blogs, generators, or SEFAZ-IE pages |
| **Algorithm** | One of: `modulo-*` (with walkthrough), `format-only`, or `blocked — variable length` with evidence |
| **Format spec** | `canonicalLength`, mask (if any), prefixes (e.g. MG `M`), whether DV `X` is allowed |
| **Golden vectors** | Planned `rg.<uf>.official.json` — at least one valid + one invalid example |

### Official source hierarchy (use the highest available)

1. **State identification institute / PCivil** page describing legacy RG or CIN transition (preferred).
2. **Ghiorzi [DVnew.htm](http://ghiorzi.org/DVnew.htm)** — **only** documents RG DV for **SP, RJ, MG** (already shipped).
3. **Federal CIN docs** (Decreto 10.977, gov.br) — explain CPF as national ID; **do not** substitute for per-UF legacy RG digit rules unless the issue explicitly scopes format-only legacy numbers.

### What **not** to cite

| Source type | Reason |
|-------------|--------|
| SEFAZ / Sintegra IE calculators | Validates Inscrição Estadual, not RG |
| RG/CIN generators, blogs, forums | Not authoritative |
| Generic “7–9 digits” tables without UF-specific state doc | Insufficient for merge |

If you only find third-party digit counts, open the issue as **research** with links and state **“blocked — need official fixed length or DV walkthrough”**. Maintainers may accept **format-only** only after an official issuer URL is recorded, even when DV is unknown.

---

## Step 3 — Report the algorithm honestly

Use this decision tree in the issue:

```
Official DV walkthrough published?
├── YES → Implement DV (mod11 / mod10 / state-specific). Golden vectors from walkthrough.
└── NO  → Official issuer documents legacy RG?
          ├── YES + fixed digit count defensible → format-only (checkDigitValidated: false)
          ├── YES + variable lengths documented   → blocked; propose canonicalLength or range RFC
          └── NO  → issue stays research; do not open PR
```

**Format-only** means: normalize digits, enforce length and character set, **do not** claim DV validation. Set `checkDigitValidated: false` in the validator result (see shipped `ac.ts`, `go.ts`, etc.).

---

## Step 4 — Golden vectors (`rg.<uf>.official.json`)

Path: `packages/br-validators/tests/vectors/rg.<uf>.official.json`

```json
{
  "source": "Human-readable citation — issuer + what is validated",
  "url": "https://official-state-url.example/",
  "valid": { "raw": "123456789" },
  "invalid": { "raw": "12345678", "code": "INVALID_LENGTH" }
}
```

Rules:

- `url` MUST be the same official page cited in the issue and `RG_OFFICIAL_SOURCE_URLS`.
- Valid/invalid examples MUST match the stated algorithm (wrong DV only when DV is implemented).
- Do not copy vectors from random generators.

---

## Step 5 — Implementation PR (after issue approval)

Follow [CONTRIBUTING-UF.md](../../packages/br-validators/src/core/rg/CONTRIBUTING-UF.md). Verify:

```bash
pnpm --filter @br-validators/core build
pnpm --filter @br-validators/core test:coverage   # 100% on packages/br-validators/src/**
pnpm lint
```

Update `docs/OFFICIAL-SOURCES.md` § RG and `CHANGELOG.md` `[Unreleased]`.

---

## API contract (do not change in UF PRs)

| Rule | Behavior |
|------|----------|
| `validateRg(raw, { uf })` | UF **required** |
| Unsupported UF | `{ ok: false, code: 'UF_NOT_IMPLEMENTED' }` |
| `detect()` | Does **not** auto-classify RG |
| Coverage | 100% on `packages/br-validators/src/**` — real tests, no mocked DV |

---

## Maintainer merge bar

- Official URL recorded in issue, vector, and `RG_OFFICIAL_SOURCE_URLS`.
- Algorithm scope matches evidence (DV vs format-only vs blocked).
- No regression on `UF_NOT_IMPLEMENTED` tests (pending UF used in tests must stay pending).
- `RG_RESEARCH_URLS` keys must match `RG_PENDING_UFS` exactly.

---

## Related references

| Document | Purpose |
|----------|---------|
| [OFFICIAL-SOURCES.md § RG](../OFFICIAL-SOURCES.md#rg--reference-index) | Shipped UF table and golden vectors |
| [RG-GOOD-FIRST-ISSUES.md](RG-GOOD-FIRST-ISSUES.md) | Shipped vs open UF list |
| [Phase 33c OFFICIAL-REFERENCE](../../.local/phases/33-post-v183-maturity/33c-rg-remaining-ufs/OFFICIAL-REFERENCE.md) | Research matrix (locked; many UFs still TBD) |

Questions: comment on your issue or tag maintainers with the `rg-uf` label.
