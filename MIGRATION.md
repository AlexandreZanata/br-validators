# Migration guide — br-validators

> **Status:** v1.x → v2.0 scaffold (phase 33p) — expanded before the v2.0.0 tag.  
> **Baseline:** `@br-validators/*@1.8.3` · structured `LookupResult` shipped in v1.9 (33i).  
> **SemVer:** [docs/VERSIONING.md](docs/VERSIONING.md) · **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

## v1.x → v2.0

> **v2.0.0 is not released.** Existing v1.x callers remain supported until then.

### Overview

v2.0 removes deprecated list-getter aliases (33h) and legacy `get*PorCodigo` helpers that return `undefined` on any failure (33i). Until v2.0:

- **`get*PorCodigo`** — still present; delegates to `lookup*` via `unwrapLookupValue` (v1.x semantics).
- **`lookup*PorCodigo`** — recommended for new code; returns `LookupResult<T>` with explicit error codes.
- **`search*`** — unchanged; still returns `T[]` (empty array = no match).

---

### Lookup API (33i)

#### v1.x behavior (removed in v2.0)

```typescript
import { getNcmPorCodigo } from '@br-validators/core/ncm';

const row = getNcmPorCodigo('12011000'); // Ncm | undefined
if (row === undefined) {
  // Could be empty input, bad format, OR not in table — indistinguishable
}
```

| Situation | v1.x `get*` | v2.0 |
|-----------|-------------|------|
| Empty / whitespace input | `undefined` | Use `lookup*` → `{ ok: false, code: 'INVALID_INPUT' }` |
| Malformed code (wrong length, bad UF, …) | `undefined` | `lookup*` → `{ ok: false, code: 'INVALID_FORMAT' }` |
| Valid key not in embed | `undefined` | `lookup*` → `{ ok: false, code: 'NOT_FOUND' }` |

#### v1.9+ structured lookups (recommended now; required in v2.0)

```typescript
import { lookupNcmPorCodigo } from '@br-validators/core/ncm';
import type { LookupResult } from '@br-validators/core/lookup';

const result: LookupResult<Ncm> = lookupNcmPorCodigo('12011000');

if (result.ok) {
  console.log(result.value.descricao);
} else {
  // result.code: 'NOT_FOUND' | 'INVALID_FORMAT' | 'INVALID_INPUT'
  console.error(result.message);
}
```

**Before / after (error handling):**

```typescript
// Before (v1.x) — silent collapse
const ncm = getNcmPorCodigo(raw) ?? defaultNcm;

// After (v2.0) — explicit branches
const result = lookupNcmPorCodigo(raw);
const ncm = result.ok ? result.value : defaultNcm;
```

| `LookupResult` code | Meaning |
|---------------------|---------|
| `INVALID_INPUT` | Empty / whitespace-only input |
| `INVALID_FORMAT` | Normalized shape fails module rules (length, regex, UF set, …) |
| `NOT_FOUND` | Valid key not present in embedded table |

#### Modules with `lookup*PorCodigo`

All offline lookup modules expose `lookup*` returning `LookupResult<T>`:

| Category | Modules |
|----------|---------|
| Fiscal | NCM, CFOP, CNAE, CBO, CEST, NBS, CST (ICMS / IPI / PIS / COFINS), LC 116, eSocial |
| Financial / trade | bancos, moedas, países Bacen, incoterms, portos, aeroportos |
| Registry | natureza jurídica, IBGE, TSE cross-walk, PNCP reference, IBPT, Simples Nacional, ANP combustíveis, CNPJ motivos, NF-e cUF |

Shared helpers: `@br-validators/core/lookup` (`unwrapLookupValue`, `lookupNotFound`, …).

#### CLI JSON (v1.9+)

```bash
br-validators ncm lookup 99999999 --json
# {"ok":false,"code":"NOT_FOUND","message":"NCM 99999999 not in embedded table"}
```

Human mode still prints errors on **stderr**; JSON mode emits structured `{ ok: false, code, message }` on **stdout**.

---

### Deprecated `getAll*` list getters (33h)

Renamed to consistent `getAll{Entity}()` in v1.9. Legacy names are `@deprecated` and **removed in v2.0**.

| Module | Deprecated (v1.x) | Use instead (v2.0) |
|--------|-------------------|---------------------|
| NCM | `getNcms()` | `getAllNcm()` |
| CFOP | `getCfops()` | `getAllCfop()` |
| CNAE | `getCnaes()` | `getAllCnae()` |
| CBO | `getCbos()` | `getAllCbo()` |
| CEST | `getCests()` | `getAllCest()` |
| NBS | `getNbsList()` | `getAllNbs()` |
| LC 116 | `getLc116List()` | `getAllLc116()` |
| CST ICMS / IPI / PIS / COFINS | `getCstIcms()` … | `getAllCstIcms()` … |
| Bancos | `getBancos()` | `getAllBancos()` |
| Moedas | `getMoedas()` | `getAllMoedas()` |
| Países Bacen | `getPaisesBacen()` | `getAllPaisesBacen()` |
| Incoterms | `getIncoterms()` | `getAllIncoterms()` |
| Portos | `getPortos()` | `getAllPortos()` |
| Aeroportos | (legacy getters) | `getAllAeroportos()` |
| Natureza jurídica | (legacy getters) | `getAllNaturezaJuridica()` |
| eSocial categorias | (legacy getters) | `getAllEsocialCategorias()` |
| IBGE | `getEstados()`, `getMunicipios()` | `getAllEstados()`, `getAllMunicipios()` |
| Feriados | `getFeriadosNacionais(year)` | `getAllFeriados(year)` |
| PNCP reference | `getPncpReferenceTable()`, `getPncpModalidades()`, `getPncpAmparosLegais()` | `getAllPncpReference()`, `getAllPncpModalidades()`, `getAllPncpAmparosLegais()` |
| Simples Nacional | `getSimplesAnexos()` | `getAllSimplesAnexos()` |
| IBPT | (legacy getters) | `getAllIbptCargas()` |
| ANP combustíveis | `getAnpSemanasPesquisa()`, `getAnpPrecosMediosEmbedded()` | `getAllAnpSemanasPesquisa()`, `getAllAnpPrecosMedios()` |
| NF-e cUF | (legacy getters) | `getAllCuf()` |

**Before / after:**

```typescript
// Before (v1.x)
import { getNcms } from '@br-validators/core/ncm';
const rows = getNcms();

// After (v2.0)
import { getAllNcm } from '@br-validators/core/ncm';
const rows = getAllNcm();
```

---

### Upgrade checklist (v1.x → v2.0)

1. Stay on **v1.9.x** while migrating — no breaking changes to existing `get*` callers.
2. Replace `get*PorCodigo` with `lookup*PorCodigo` where you need `INVALID_FORMAT` vs `NOT_FOUND` UX.
3. Replace deprecated `getNcms()`-style aliases with `getAll*` names.
4. Update CLI / API integrations parsing JSON to handle `{ ok: false, code, message }`.
5. Run your test suite on a v2.0.0-rc prerelease before upgrading production.

---

### Maintainer policy

Every pull request that introduces or finalizes a **breaking** public API change **must** update this file **before** the v2.0.0 tag:

1. Add a subsection under [v1.x → v2.0](#v1x--v20) with **before / after** TypeScript snippets.
2. Add a row to the deprecation or lookup tables above.
3. Move notes from `[Unreleased]` → version section in [CHANGELOG.md](CHANGELOG.md) under **Breaking**.
4. Follow [docs/VERSIONING.md — Deprecation policy](docs/VERSIONING.md#deprecation-policy) (deprecate ≥ one minor before removal).

---

## v0.x → v1.0

Pre-1.0 releases (`0.x.y`) allowed API changes between minors. **v1.0.0** (2026-06-23) froze the public contract documented in [docs/LIBRARY-API.md](docs/LIBRARY-API.md).

| Version | Milestone |
|---------|-----------|
| `0.1.0-alpha` | CNPJ (dual) + CPF + pipeline |
| `0.2.0` | Placa + PIX keys |
| `0.3.0` | Boleto / BR Code (partial) |
| **`1.0.0`** | **Stable API contract** — full SemVer guarantees |

**Full history:** [CHANGELOG.md](CHANGELOG.md) — sections `[0.1.0-alpha.0]` through `[1.0.0]`.

**Upgrading from 0.x:** pin `1.0.0` or latest `1.x`, audit imports against [LIBRARY-API.md](docs/LIBRARY-API.md), and run `pnpm test` / your integration suite. There is no separate 0.x archive file; the changelog is the authoritative record.

---

## References

| Document | Purpose |
|----------|---------|
| [docs/LIBRARY-API.md](docs/LIBRARY-API.md) | Public API + `LookupResult` section |
| [docs/VERSIONING.md](docs/VERSIONING.md) | SemVer, deprecation policy, release process |
| [CHANGELOG.md](CHANGELOG.md) | Release-by-release changes |
| [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md) | Algorithm / data source citations |
