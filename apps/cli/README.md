# @br-validators/cli

[![npm](https://img.shields.io/npm/v/@br-validators/cli)](https://www.npmjs.com/package/@br-validators/cli)
[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/AlexandreZanata/br-validators/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/AlexandreZanata/br-validators)](https://github.com/AlexandreZanata/br-validators/releases)

Terminal CLI for all Brazilian document validators in [@br-validators/core](https://www.npmjs.com/package/@br-validators/core) **v1.7.0**.

**Repo:** [github.com/AlexandreZanata/br-validators](https://github.com/AlexandreZanata/br-validators)

---

## Install

```bash
npm install -g @br-validators/cli
```

Or run without install:

```bash
npx @br-validators/cli --help
```

---

## Global commands

```bash
br-validators list
br-validators --version
br-validators --help
```

---

## Per-type commands

```bash
br-validators cnpj validate 12ABC34501DE35 --json --source
br-validators cpf validate 12345678909
br-validators cep format 01310100
br-validators telefone validate 11999999999
br-validators cnh validate 62472927637
br-validators renavam validate 63977791104
br-validators titulo-eleitor validate 004356870906
br-validators nfe-chave validate 52060433009911002506550120000007800267301615 --json
br-validators nfe-chave parse 52060433009911002506550120000007800267301615 --json
br-validators brcode validate '<emv-payload>' --json
br-validators placa validate ABC1D23
br-validators pis-pasep validate 10027230888
br-validators pix validate pix@bcb.gov.br
br-validators boleto validate '03399.02579 08991.834006 71742.301014 6 14500000099668'
br-validators cartao validate 4111111111111111
br-validators cartao-credito validate 4111111111111111
br-validators ie validate 110042490114 --uf SP --json
br-validators ie validate P-01100424.3/002 --uf SP   # SP produtor rural (auto-detect)
```

### Actions (per-type)

| Action | Description |
|--------|-------------|
| `validate` | Check format + check digits |
| `format` | Apply official mask |
| `strip` | Normalize to canonical digits/chars |
| `parse` | NF-e chave, BR Code |
| `convert` | Boleto linha ↔ barcode; placa legacy → Mercosul |
| `detect` | PIX key type; boleto input kind; cartão brand |

---

## Platform commands

| Command | Description |
|---------|-------------|
| `detect [value]` | Classify raw input; `--uf` for IE |
| `sanitize <type> [value]` | ETL fixes + validate; `--uf` for `inscricao-estadual` |
| `generate <type>` | Synthetic test document; `--seed`, `--masked`, `--format` |

> **Library-only platform APIs:** `mask`, `compare`, `batch`, and `diff` are available via `@br-validators/core` subpaths — no dedicated CLI commands yet.

```bash
br-validators detect '123.456.789-09' --json
br-validators detect '110042490114' --uf SP --json
br-validators sanitize cpf ' 123.456.789-09 ' --json
br-validators sanitize inscricao-estadual '110.042.490.114' --uf SP --json
br-validators generate cpf --seed 42 --masked --json
br-validators generate cnpj --format alphanumeric --seed 7 --json
br-validators generate placa --format mercosul --seed 3
```

---

## Reference data lookup

Offline embedded datasets — delegates to `@br-validators/core/*`.

### Bacen banks

```bash
br-validators bancos lookup 001 --json
br-validators bancos lookup 18236120 --verbose
br-validators bancos list --limit 20 --json
```

### Fiscal (26c)

```bash
br-validators natureza-juridica lookup 2062 --json
br-validators nbs lookup 1.1502.50.00 --verbose
br-validators cest lookup 0302100 --json
br-validators cnae lookup 6201501 --json
br-validators cnae search "web design" --limit 5
br-validators cfop lookup 1102 --json
br-validators cfop search compra --limit 5
br-validators ncm lookup 12011000 --json
br-validators ncm search soja --limit 5
br-validators cbo lookup 212405 --json
br-validators cbo search analista --limit 5
```

### Geography & calendar (27d)

```bash
br-validators ibge lookup 3550308 --json
br-validators ibge list estados --limit 5
br-validators ibge list municipios --uf SP --limit 10 --json
br-validators tse-municipios lookup 71072 --verbose
br-validators feriados list --year 2026 --json
br-validators cep faixa 01310 --json
br-validators ddd lookup 11 --verbose
```

### Trade (26d)

```bash
br-validators moedas lookup BRL --json
br-validators paises-bacen lookup 1058 --verbose
br-validators incoterms lookup FOB --json
```

### Logistics (26e)

```bash
br-validators portos lookup BRSSZ --json
br-validators aeroportos lookup GRU --verbose
br-validators aeroportos lookup SBGR --json
```

| Exit code | Meaning |
|-----------|---------|
| `0` | Record found |
| `1` | Not found |
| `2` | Usage error |

---

## Flags

| Flag | Description |
|------|-------------|
| `--json` | JSON output |
| `--quiet` / `-q` | Exit code only (CI) |
| `--file` / `-f` | Read value from file |
| `--source` | Print official source URL (per-type) |
| `--uf` | Required for IE / detect / sanitize IE; optional filter for `ibge list municipios` |

### CI

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
br-validators detect "$RAW_INPUT" --json --quiet || exit 1
```

---

## License

MIT
