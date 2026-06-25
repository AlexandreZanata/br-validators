# Delivery surfaces — library, CLI, playground

> Every Brazilian document type supported by the library is also testable via **CLI** and **web playground**.
> All three surfaces call the same TypeScript core — no duplicated algorithms.

---

## Three surfaces, one core

```
                    ┌─────────────────────────┐
                    │  packages/br-validators │
                    │  (strip / validate /    │
                    │   format — pure TS)     │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   import in app          br-validators           apps/playground
   (npm package)          (terminal CLI)          (Vercel web UI)
```

| Surface | User | Use case |
|---------|------|----------|
| **Library** | Developers | Embed in API, forms, ETL |
| **CLI** | Devs, DevOps, support | Quick check, CI gates, scripts |
| **Playground** | Anyone | Try validators without installing; demos, docs |

---

## Per document type matrix

As each module ships, **all three** must be updated:

| Type | Library export | CLI command | Playground tab | Official source |
|------|----------------|-------------|----------------|-----------------|
| CNPJ | `@br-validators/core/cnpj` | `br-validators cnpj …` | CNPJ | [RFB CNPJ FAQ](OFFICIAL-SOURCES.md) |
| CPF | `@br-validators/core/cpf` | `br-validators cpf …` | CPF | [RFB CPF](OFFICIAL-SOURCES.md) |
| CEP | `@br-validators/core/cep` | `br-validators cep …` | CEP | [Correios](OFFICIAL-SOURCES.md) |
| Telefone | `@br-validators/core/telefone` | `br-validators telefone …` | `/telefone` | [Anatel — Plano de Numeração](OFFICIAL-SOURCES.md) |
| CNH | `@br-validators/core/cnh` | `br-validators cnh …` | `/cnh` | [OFFICIAL-SOURCES § CNH](OFFICIAL-SOURCES.md#cnh--reference-index) |
| RENAVAM | `@br-validators/core/renavam` | `br-validators renavam …` | `/renavam` | [OFFICIAL-SOURCES § RENAVAM](OFFICIAL-SOURCES.md#renavam--reference-index) |
| Título de Eleitor | `@br-validators/core/titulo-eleitor` | `br-validators titulo-eleitor …` | `/titulo-eleitor` | [OFFICIAL-SOURCES § Título de Eleitor](OFFICIAL-SOURCES.md#título-de-eleitor--reference-index) |
| NF-e chave de acesso | `@br-validators/core/nfe-chave` | `br-validators nfe-chave …` | `/nfe-chave` | [OFFICIAL-SOURCES § NF-e chave](OFFICIAL-SOURCES.md#nf-e--nfc-e-chave-de-acesso--reference-index) |
| BR Code | `@br-validators/core/brcode` | `br-validators brcode …` | `/brcode` | [Bacen Manual BR Code](OFFICIAL-SOURCES.md) |
| Placa | `@br-validators/core/placa` | `br-validators placa …` | Placa | [CONTRAN 729/2018](OFFICIAL-SOURCES.md) |
| PIS/PASEP | `@br-validators/core/pis-pasep` | `br-validators pis-pasep …` | PIS/PASEP | [SIPREV RV_03](OFFICIAL-SOURCES.md) |
| PIX key | `@br-validators/core/pix` | `br-validators pix …` | PIX | [Bacen PIX / DICT](OFFICIAL-SOURCES.md) |
| Boleto cobrança | `@br-validators/core/boleto` | `br-validators boleto …` | Boleto | [FEBRABAN FB-0061/2021](OFFICIAL-SOURCES.md) |
| Boleto arrecadação | `@br-validators/core/boleto` | `br-validators boleto …` | Boleto | [FEBRABAN Layout v7](OFFICIAL-SOURCES.md) |
| Credit card | `@br-validators/core/cartao-credito` | `br-validators cartao …` / `cartao-credito …` | Credit Card | [ISO/IEC 7812-1](OFFICIAL-SOURCES.md) |
| EAN barcode | `@br-validators/core/ean` | `br-validators ean …` | EAN | [GS1 EAN/UPC](OFFICIAL-SOURCES.md) |
| IE (27 UFs) | `@br-validators/core/inscricao-estadual` | `br-validators ie … --uf <UF>` | `/ie` | [OFFICIAL-SOURCES § IE](OFFICIAL-SOURCES.md#inscrição-estadual-ie--all-27-ufs) |
| IE produtor rural (SP) | `@br-validators/core/inscricao-estadual-produtor-rural` | `br-validators ie … --uf SP` (auto `P` prefix) | `/ie` badge | [SINTEGRA cad_SP Bloco II](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) |
| **detect()** | `@br-validators/core/detect` | `br-validators detect …` | `/detect` | Composes per-type [OFFICIAL-SOURCES](OFFICIAL-SOURCES.md) |
| **sanitize()** | `@br-validators/core/sanitize` | `br-validators sanitize <type> …` | `/sanitize` | Same validators as per-type rows |
| **mask()** | `@br-validators/core/mask` | — | via per-type `format` | Per-type masks — [OFFICIAL-SOURCES](OFFICIAL-SOURCES.md) |
| **compare()** | `@br-validators/core/compare` | — | — | Normalized equality via per-type `validate*` |
| **batch()** | `@br-validators/core/batch` | — | — | Bulk validate + summary |
| **diff()** | `@br-validators/core/diff` | — | — | Field-level diff per official structures |
| **generate()** | `@br-validators/core/generate` | `br-validators generate <type> …` | `/generate` | DV sources per generatable type — [OFFICIAL-SOURCES](OFFICIAL-SOURCES.md) |
| **PIX static QR** | `buildStaticPixBrCode` (core) | — | `/pix` QR panel | [Bacen Manual BR Code](OFFICIAL-SOURCES.md) + [Manual de Padrões PIX](OFFICIAL-SOURCES.md) |

**Definition of done per module:** library tests green + CLI command + playground section + source link.

---

## CLI specification

### Global

```bash
br-validators --version
br-validators --help
br-validators list
```

### Per-type actions

Every type implements the same actions where applicable:

| Action | Description |
|--------|-------------|
| `validate` | Check format + check digits |
| `format` | Apply official mask (valid input only) |
| `strip` | Normalize input |

```bash
br-validators <type> validate <value>
br-validators <type> format <value>
br-validators <type> strip <value>
```

### Platform commands (Phases 17–19)

| Command | Description |
|---------|-------------|
| `detect [value]` | Classify raw input; `--uf` required for IE detection |
| `sanitize <type> [value]` | Apply ETL fixes then validate; `--uf` for `inscricao-estadual` |
| `generate <type>` | Synthetic valid document; `--seed`, `--masked`, `--format` |

```bash
br-validators detect '123.456.789-09' --json
br-validators sanitize cpf ' 123.456.789-09 ' --json
br-validators generate cpf --seed 42 --masked
```

### Flags (all types)

| Flag | Description |
|------|-------------|
| `--json` | JSON output (`ValidationResult`) |
| `--quiet` / `-q` | Exit code only |
| `--file` / `-f` | Read value from file (one line) |
| `--source` | Print official source URL for this type |

### JSON example

```bash
$ br-validators cnpj validate 12ABC34501DE35 --json
{
  "ok": true,
  "value": "12ABC34501DE35",
  "format": "alphanumeric",
  "formatted": "12.ABC.345/01DE-35",
  "source": "https://www.gov.br/receitafederal/.../cnpj-alfanumerico.pdf"
}
```

### CI usage

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
```

---

## Playground (Vercel) specification

### URL

Production: [doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app/)

### Pages

| Route | Content |
|-------|---------|
| `/` | Landing + type selector |
| `/detect` | Live type detection demo |
| `/sanitize` | Sanitize + fixes display |
| `/generate` | Synthetic document generator |
| `/cnpj` | CNPJ tester |
| `/cpf` | CPF tester |
| `/[type]` | Generic layout for each doc type |

### Component layout (clean UI)

```
┌──────────────────────────────────────────────────────┐
│  BR Validators Playground          [Type: CNPJ ▼]    │
├──────────────────────────────────────────────────────┤
│  Input                                               │
│  ┌────────────────────────────────────────────────┐  │
│  │ 12.ABC.345/01DE-35                             │  │
│  └────────────────────────────────────────────────┘  │
│  [ Validate ]  [ Format ]  [ Strip ]                 │
├──────────────────────────────────────────────────────┤
│  Strip     12ABC34501DE35                            │
│  Valid     ✓ yes — alphanumeric                      │
│  Format    12.ABC.345/01DE-35                        │
├──────────────────────────────────────────────────────┤
│  Official source ↗ RFB CNPJ alfanumérico (Q14)       │
│  npm: br-validators  ·  CLI: br-validators cnpj …    │
└──────────────────────────────────────────────────────┘
```

### Principles

- **Client-side only** — no API route sends PII to server
- **Minimal design** — fast load, accessible, mobile-friendly
- **Official source link** on every page
- **Copy buttons** for CLI command equivalent
- Open source — playground code in `apps/playground/`

### Deploy

```bash
cd apps/playground
vercel deploy --prod
```

Monorepo: Vercel root directory = `apps/playground`, build depends on `packages/br-validators`.

---

## Implementation order

| Step | Deliverable |
|------|-------------|
| 1 | `packages/br-validators` — CNPJ core |
| 2 | `apps/cli` — `cnpj validate|format|strip` |
| 3 | `apps/playground` — CNPJ tab on Vercel |
| 4 | Add CPF to all three surfaces |
| 5 | Repeat for CEP, placa, PIX, … |

See [TECH-STACK.md](TECH-STACK.md) and [ROADMAP.md](ROADMAP.md).

---

## Related

| Doc | Purpose |
|-----|---------|
| [TECH-STACK.md](TECH-STACK.md) | TypeScript-first rationale |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Monorepo structure |
| [LIBRARY-API.md](LIBRARY-API.md) | Function contracts |
