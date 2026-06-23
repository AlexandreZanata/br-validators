# Changelog

All notable changes to **BR Validators** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**License:** MIT — 100% open source. See [LICENSE](LICENSE) and [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md).

---

## [Unreleased]

### Added

- **`@br-validators/core/feriados`** — `isFeriadoNacional()`, `getFeriadosNacionais(year)`, `getProximoDiaUtil()`, `getPontosFacultativosFederais(year)`; ten federal national holidays (nine Lei 662 fixed + Paixão de Cristo); nine facultative days per Portaria MGI 11.460/2025 (2026); `FERIADOS_DATA_VERSION`
- **Data refresh bot** — source health policy: 3 HTTP retries (2 s apart), retain embedded JSON on failure, `sourceAlerts` in weekly reports, [docs/DATA-SOURCE-MAINTENANCE.md](docs/DATA-SOURCE-MAINTENANCE.md)

---

## [1.1.0] - 2026-06-23

### Added

- **`@br-validators/core/ibge`** — offline IBGE states + municipalities lookup (`getEstados`, `getMunicipios`, `getMunicipioPorCodigo`); `IBGE_DATA_VERSION` transparency metadata
- **`@br-validators/core/bancos`** — offline Bacen STR participants (`getBancos`, `getBancoPorCodigo`, `getBancoPorIspb`); `BANCOS_DATA_VERSION` metadata
- **`@br-validators/core/telefone`** — `getDddInfo(ddd)` geographic lookup (Anatel DDD + IBGE municipalities); `TELEFONE_DDD_DATA_VERSION`
- **`@br-validators/core/data-catalog`** — `getDataCatalog()`, `getDatasetMetadata(id)` aggregating embedded dataset metadata
- **Data refresh bot** — `scripts/data-refresh-bot.ts`, `pnpm fetch:data`, weekly `.github/workflows/data-refresh-bot.yml`, auto-generated [docs/DATA-FRESHNESS.md](docs/DATA-FRESHNESS.md)

---

## [1.0.0] - 2026-06-23

First stable release. Public API frozen per [docs/VERSIONING.md](docs/VERSIONING.md#api-freeze-100) until v2.0.0.

### Added

- **18 document validators** — CPF, CNPJ (numeric + alphanumeric), CEP, telefone, CNH, RENAVAM, título de eleitor, NF-e chave (44-digit), placa, PIS/PASEP, PIX key, BR Code, boleto cobrança + arrecadação, cartão (Luhn), IE (27 UFs), IE SP produtor rural
- **Platform APIs:** `detect()`, `sanitize()`, `mask()`, `compare()`, `batch()`, `diff()`, `generate()`
- **`generate()` — 17 types** (BR-GENERATE-001): `cpf`, `cnpj`, `cep`, `placa`, `pis-pasep`, `renavam`, `cnh`, `telefone`, `cartao-credito`, `inscricao-estadual`, `titulo-eleitor`, `pix` (EVP), `nfe-chave`, `brcode`, `boleto`, `boleto-arrecadacao`, `inscricao-estadual-produtor-rural`
- **`CPF_ALPHA_GENERATE_STUB`** — `generate('cpf', { format: 'alphanumeric' })` throws `CPF_ALPHA_SPEC_PENDING` until RFB publishes spec
- **`buildStaticPixBrCode()`** — static PIX BR Code builder (`@br-validators/core/brcode`)
- **Boleto arrecadação** — `validateArrecadacao` (FEBRABAN Layout v7); wired in `validateBoleto` + `detect()`
- **F-03 BR Code:** `parseBrCode`, `validateBrCode` — Bacen EMV TLV + CRC16-CCITT
- **F-04 `@br-validators/zod`:** Zod schemas delegating to core `validate*`
- **F-05 `@br-validators/react-hook-form`:** `*Rule()` and `*Resolver()` for React Hook Form
- **Telefone (F-01):** 67 Anatel DDDs, celular/fixo, `+55` support
- **CNH, RENAVAM, Título de Eleitor, NF-e chave, IE produtor rural** — full library + CLI + playground surfaces
- CLI: `detect`, `sanitize`, `generate`, `brcode`, `telefone`, `cnh`, `renavam`, `titulo-eleitor`, `nfe-chave`
- Playground: `/detect`, `/sanitize`, `/generate`, static PIX QR on `/pix`
- Business rules: BR-DETECT-001, BR-SANITIZE-001, BR-GENERATE-001, BR-MASK-001, BR-COMPARE-001, BR-BATCH-001, BR-DIFF-001
- Official source index for all validators + `generate()` in [docs/OFFICIAL-SOURCES.md](docs/OFFICIAL-SOURCES.md)

### Changed

- GitHub repo: [AlexandreZanata/br-validators](https://github.com/AlexandreZanata/br-validators)
- npm scope: `@br-validators/core`, `@br-validators/cli`, `@br-validators/zod`, `@br-validators/react-hook-form`
- Root `pnpm build` — sequential build after core to avoid playground `dist/` race (tsup clean vs Next.js typecheck)

### Security

- Pre-release audit: [`.local/security-audit.md`](.local/security-audit.md) — OWASP Top 10:2025, ReDoS review, `pnpm audit` (no high/critical in runtime)

---

## [1.2.0] - 2026-06-22

### Added

- **`detect()`** — priority router delegating to existing validators; 11-digit disambiguation; IE requires `uf`
- **`sanitize()`** — ETL fixes pipeline + mandatory validation (15 types; PIX excluded until `stripPixKey`)
- **`generate()`** — synthetic test documents with optional `seed` and `masked`; 9 generatable types
- CLI commands: `detect`, `sanitize`, `generate`
- Playground pages: `/detect`, `/sanitize`, `/generate`
- Business rules: BR-DETECT-001, BR-SANITIZE-001, BR-GENERATE-001

---

## [0.10.0-alpha.1] - 2026-06-21

### Fixed

- **`@br-validators/cli`:** duplicate `#!/usr/bin/env node` in bundled `dist/index.js` broke global install on Node 22 ESM (`SyntaxError` at line 2)

---

## [0.10.0-alpha.0] - 2026-06-21

Inscrição Estadual — remaining 24 UFs (Phase 8b). Full Brazil coverage: 27 states.

### Added

- Per-UF validators: AC, AL, AM, AP, BA, CE, ES, GO, MA, MG, MS, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, TO
- Golden vectors: `tests/vectors/ie.{uf}.official.json` for each new UF
- `IE_OFFICIAL_SOURCE_URLS` — primary SEFAZ URL per UF
- CLI `--uf` accepts all 27 UFs (case-insensitive)
- Playground `/ie` — selector for all 27 states with per-UF samples

### Notes

- Check digits only — no SEFAZ registration lookup
- SP rural `P…` format still out of scope

---

## [0.9.0-alpha.0] - 2026-06-21

Inscrição Estadual validator — SP, MT, DF (Phase 8 v1).

### Added

- `validateInscricaoEstadual`, `formatInscricaoEstadual`, `stripInscricaoEstadual` — UF required (`SP` | `MT` | `DF`)
- Per-UF modules: `validateIeSp`, `validateIeMt`, `validateIeDf` with SEFAZ/SINTEGRA mod11 algorithms
- Golden vectors: `ie.sp.official.json`, `ie.mt.official.json`, `ie.df.official.json`, `ie.negative.official.json`
- Subpath export `br-validators/inscricao-estadual`
- `apps/cli` — `br-validators ie validate|format|strip --uf SP|MT|DF`
- `apps/playground` — `/ie` route with UF selector
- UC-009, BR-IE-001…BR-IE-DF-002

### Notes

- Check digits only — no SEFAZ registration lookup
- SP rural `P…` format and remaining 24 UFs deferred to Phase 8b

---

## [0.8.0-alpha.0] - 2026-06-21

Boleto Phase 5b — full cobrança: Situação 2, modulo edge vectors, optional semantics.

### Added

- `detectBoletoSituacao` — Situação 1 (`currency 9`) vs Situação 2 (`code 988`, `currency 0`)
- Success results include `situacao: '1' | '2'`
- Golden vectors: `boleto.situacao2.official.json`, `boleto.modulo-edge.json`, `boleto.semantic.official.json`
- Optional flags: `validateDueFactor`, `validateAmount` on `validateBoleto`
- `validateFatorVencimento`, `validateValorDocumento`, `validateSemanticFields`
- `detectBoletoInputKind` returns `arrecadacao` for 48-digit `8…` inputs *(validation added in 0.12.0-alpha.3 — see [Unreleased])*
- CLI / playground: `situacao` on successful boleto validation
- BR-BOLETO-011…013, UC-007 AF-4/AF-5

### Fixed

- Docs cite Anexo V §2.3.4 (not Anexo VI) for linha ↔ barcode conversion

---

## [0.7.0-alpha.0] - 2026-06-21

Unified format layer across all shipped document types (UC-003).

### Added

- `formatDocument` union entrypoint + `formatPixKey`, `formatBoleto`
- `core/pix/mask.ts` and `core/boleto/mask.ts` — single `apply*Mask` sources
- Golden `*_MASKED` constants for CPF, CNPJ, CEP, PIS/PASEP
- `tests/vectors/format.official.json` + `tests/format/format.test.ts`
- CLI `pix format`, `cartao-credito` command alias, library-backed `boleto format`
- Playground format output on PIX, boleto, and all routes; `/cartao-credito`

---

Credit card PAN validator across library, CLI, and playground.

### Added

- `packages/br-validators` — credit card PAN validation: Luhn / ISO/IEC 7812-1 Annex B
- `validateCartaoCredito`, `isValidLuhn`, `detectCardBrand`, strip/format
- PAN length 8–19; best-effort brand (Visa, Mastercard, Amex, Elo, Hipercard)
- Subpath export `br-validators/cartao-credito`
- `apps/cli` — `br-validators cartao validate|detect|format|strip`
- `apps/playground` — `/cartao` route with validate + brand row
- UC-008, BR-LUHN-001…008, golden vectors (Visa/MC/Amex + Luhn walkthrough)

---

Boleto validator across library, CLI, and playground.

### Added

- `packages/br-validators` — boleto validation: linha digitável (47) + código de barras (44)
- `detectBoletoInputKind`, `validateBoleto`, conversion linha ↔ barcode
- Modulo 10 field DVs + modulo 11 barcode DV per FEBRABAN Anexos IX/X
- Subpath export `br-validators/boleto`
- `apps/cli` — `br-validators boleto validate|detect|convert|format|strip`
- `apps/playground` — `/boleto` route with detect, validate, converted counterpart
- UC-007, BR-BOLETO-001…010, golden vectors (Santander + BB)

---

## [0.2.0-rc.0] - 2026-06-21

PIX key validator across library, CLI, and playground.

### Added

- `packages/br-validators` — PIX key validation for 5 Bacen types (CPF, CNPJ, email, phone, EVP)
- `detectPixKeyType` + `validatePixKey` with optional strict `--type`
- CPF/CNPJ keys delegate to existing validators
- Subpath export `br-validators/pix`
- `apps/cli` — `br-validators pix validate|detect` with `--json`, `--quiet`, `--source`, `--type`
- `apps/playground` — client-side tester at `/pix`

### Security

- Core validates format only — no DICT lookup in core

---

## [0.2.0-beta.0] - 2026-06-21

PIS/PASEP validator across library, CLI, and playground.

### Added

- `packages/br-validators` — PIS/PASEP modulo 11 validation (golden `10027230888`)
- Subpath export `br-validators/pis-pasep`
- `apps/cli` — `br-validators pis-pasep validate|format|strip` with `--json`, `--quiet`, `--source`
- `apps/playground` — client-side tester at `/pis`

### Security

- Core validates check digit only — no CNIS lookup in core

---

## [0.2.0-alpha.0] - 2026-06-21

Placa validator across library, CLI, and playground.

### Added

- `packages/br-validators` — license plate validation (legacy `LLLNNNN` + Mercosul `LLLNLNN`)
- `convertPlacaToMercosul` — CONTRAN legacy→Mercosul mapping (golden `ABC1234` → `ABC1C34`)
- Subpath export `br-validators/placa`
- `apps/cli` — `br-validators placa validate|format|strip|convert` with `--json`, `--quiet`, `--source`
- `apps/playground` — client-side tester at `/placa`

### Security

- Core validates format only — no Detran lookup in core

---

## [0.1.0-beta.1] - 2026-06-21

CEP validator across library, CLI, and playground.

### Added

- `packages/br-validators` — CEP structural validation (golden vectors `01310100`, `20040020`)
- Subpath export `br-validators/cep`
- `apps/cli` — `br-validators cep validate|format|strip` with `--json`, `--quiet`, `--source`
- `apps/playground` — client-side tester at `/cep`

### Security

- Core validates format only — no Correios HTTP lookup in core (see adapters roadmap)

---

CPF validator across library, CLI, and playground.

### Added

- `packages/br-validators` — CPF numeric modulo 11 (golden vectors `12345678909`, `11144477735`)
- Subpath export `br-validators/cpf`
- `apps/cli` — `br-validators cpf validate|format|strip` with `--json`, `--quiet`, `--source`
- `apps/playground` — client-side tester at `/cpf`
- CI: Node 24, pnpm version from `packageManager` field only

### Security

- Validation aligned to [RFB CPF portal](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) and UC-001 golden vector

---

## [0.1.0-alpha.1] - 2026-06-21

First implementation release — CNPJ validator across library, CLI, and playground.

### Added

- `packages/br-validators` — CNPJ numeric + alphanumeric (RFB Q14 golden vector `12ABC34501DE35`)
- `apps/cli` — `br-validators cnpj validate|format|strip` with `--json`, `--quiet`, `--source`
- `apps/playground` — Next.js client-side tester at `/cnpj`
- Monorepo (pnpm workspaces) + GitHub Actions CI
- 100% test coverage on library and CLI core

### Security

- Validation algorithms aligned to [RFB CNPJ alfanumérico PDF](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf)

---

## [0.1.0-alpha.0] - 2026-06-21

Documentation, governance, and agent harness bootstrap (no npm code yet).

### Added

- Project documentation (`docs/`) — vision, glossary, architecture, official sources
- [docs/TECH-STACK.md](docs/TECH-STACK.md) — TypeScript first, branded types, port strategy
- [docs/DELIVERY-SURFACES.md](docs/DELIVERY-SURFACES.md) — library + CLI + Vercel playground per doc type
- [docs/CNPJ-ALPHANUMERIC.md](docs/CNPJ-ALPHANUMERIC.md) — RFB Q14 golden vector `12ABC34501DE35`
- MIT [LICENSE](LICENSE)
- [SECURITY.md](SECURITY.md) — vulnerability reporting policy
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution and security contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md) — permanent open source commitment
- [docs/VERSIONING.md](docs/VERSIONING.md) — SemVer and release policy
- [docs/SECURITY-PRACTICES.md](docs/SECURITY-PRACTICES.md) — integrator security guidance
- [docs/GOVERNANCE.md](docs/GOVERNANCE.md) — document map and decision log
- Agent harness (`agent-rules/`, `agent-harness/`, `.cursor/rules/`)
- Root [VERSION](VERSION) file

---

## Version history

| Version | Date | Notes |
|---------|------|-------|
| [1.1.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v1.1.0) | 2026-06-23 | Offline reference data: IBGE, Bacen banks, DDD lookup, data catalog |
| [1.0.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v1.0.0) | 2026-06-23 | First stable release — API freeze |
| [0.1.0-beta.1](https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-beta.1) | 2026-06-21 | CEP library + CLI + playground |
| [0.1.0-beta.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-beta.0) | 2026-06-21 | CPF library + CLI + playground |
| [0.1.0-alpha.1](https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-alpha.1) | 2026-06-21 | CNPJ library + CLI + playground |
| [0.1.0-alpha.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-alpha.0) | 2026-06-21 | Docs + harness bootstrap |

See [docs/VERSIONING.md](docs/VERSIONING.md) for versioning rules.

[Unreleased]: https://github.com/AlexandreZanata/br-validators/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v1.1.0
[1.0.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v1.0.0
[0.1.0-beta.1]: https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-beta.1
[0.1.0-beta.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-beta.0
[0.1.0-alpha.1]: https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-alpha.1
[0.1.0-alpha.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-alpha.0
