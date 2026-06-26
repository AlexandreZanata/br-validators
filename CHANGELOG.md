# Changelog

All notable changes to **BR Validators** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**License:** MIT — 100% open source. See [LICENSE](LICENSE) and [docs/OPEN-SOURCE.md](docs/OPEN-SOURCE.md).

---

## [Unreleased]

---

## [1.9.0] - 2026-06-26

### Changed

- **generate() output options (33e)** — `GenerateOptions.stripped` explicit flag; `stripped: true` wins over `masked: true`; CLI `--stripped`; default behavior unchanged (stripped when unmasked)
- **Branded types audit (33d)** — `validateCpf`, `validateCnpj`, `validateCep`, and `validatePisPasep` now return `ValidationResult<BrandedT>`; new `Arrecadacao` brand for boleto arrecadação success paths; compile-time + runtime branded return tests; `docs/LIBRARY-API.md` branded type inventory table
- **Data refresh bot versioning** — daily drift publishes `MAJOR.MINOR.PATCH-data.N` (e.g. `1.8.3-data.1`) instead of incrementing human PATCH (`1.8.4`); npm canonical form (no zero-padding on counter)

### Fixed

- **Data refresh bot version format** — bot tags and `package.json` use npm-canonical `1.8.3-data.1` (not zero-padded `1.8.3-data.0001`) so Release CI registry checks match the published version

### Added

- **E2E subpath import tests (33s)** — `tests/integration/subpath-imports/` mini-consumer resolves all 61 `@br-validators/core` export map entries via native Node `import`; dedicated smokes for `cnpj`, `ncm`, `cst`, `compare`; esbuild tree-shake regression; wired into `pnpm test:integration` and CI
- **TypeDoc + VitePress API reference (33r)** — `typedoc.json` + `typedoc-plugin-markdown`; `pnpm docs:api` generates `apps/docs/api-reference/` from `@br-validators/core` subpath barrels; VitePress sidebar **API Reference**; CI `docs` job runs `docs:build`; narrative `LIBRARY-API.md` unchanged
- **Security CVE + audit CI (33q)** — `SECURITY.md` CVE request SLA table, `pnpm audit` CI gate (`--prod` fails on high/critical; devDeps warn-only), npm publish integrity notes, false-positive override process
- **Migration guide (33p)** — root [MIGRATION.md](MIGRATION.md): v1.x → v2.0 lookup + deprecated `getAll*` inventory with before/after examples; v0.x → v1.0 changelog index; maintainer update policy; linked from README and `docs/README.md`
- **ISS municipal partial embed (33o)** — `@br-validators/core/iss-municipal` with `getIssMunicipalPorIbge`, `getIssMunicipalPorUfMunicipio`, `searchIssMunicipal`, `getAllIssMunicipal`; 100 cities (27 capitals + top PIB); estimation-only `warning` on every result; CLI `iss-municipal lookup|resolve|search`; playground `/data/fiscal` module; `pnpm fetch:data:iss-municipal` (manual — not daily bot)
- **SELIC meta SGS 432 (33n)** — `@br-validators/core/selic` with `getSelicMeta`, `getSelicMetaPorData`, `getSelicHistorico`; 90-day rolling embed; staleness API; CLI `selic [--date]`; playground `/data/finance`; `pnpm fetch:data:selic`; daily refresh bot
- **INSS contribution table (33m)** — `@br-validators/core/inss` with `getInssTabelaContribuicao`, `calcularInssMensal`, `getInssFaixaPorSalario`; 2025 employee brackets (teto R$ 8.157,41); CLI `inss tabela` and `inss calc`; playground `/data/payroll`; `pnpm fetch:data:inss`
- **IRPF progressive table (33l)** — `@br-validators/core/irpf` with `getIrpfTabelaProgressiva`, `calcularIrpfMensal`, `getIrpfFaixaPorValor`; 2025 monthly brackets; CLI `irpf tabela` and `irpf calc`; playground `/data/payroll`; `pnpm fetch:data:irpf`
- **NF-e cUF lookup (33k)** — `@br-validators/core/nfe-cuf` with `getCufPorCodigo`, `getCufPorUf`, `getAllCuf`; static 27-row SEFAZ table + IBGE cross-ref; CLI `nfe-cuf lookup`; playground `/data/fiscal` module; `pnpm fetch:data:nfe-cuf`
- **Fiscal code validators (33j)** — `validateNcm`, `validateCfop`, `validateCst({ tax })` combine format rules with embedded lookup; `FiscalCodeValidationResult`; CLI `ncm|cfop validate` and `cst lookup|search|validate --tax`; playground `/data/fiscal` validate tab + CST module
- **Lookup result standardization (33i)** — `LookupResult<T>` with `NOT_FOUND` / `INVALID_FORMAT` / `INVALID_INPUT`; `lookup*PorCodigo` on all offline lookup modules; legacy `get*` delegates via `unwrapLookupValue`; new `@br-validators/core/lookup` subpath; CLI reference/bancos/ibge lookup JSON failure shape `{ ok: false, code, message }`; [MIGRATION.md](MIGRATION.md) v2.0 lookup section
- **Lookup `getAll*` naming (33h)** — canonical `getAll{Entity}()` list getters on every lookup module; legacy plural names deprecated until v2.0; `tests/lookup/getall-aliases.test.ts`
- **PTAX staleness API (33g)** — `getPtaxCotacao` / `getPtaxUltimoDiaUtil` return `dataReferencia`, `isStale`, and `warning` when embed is more than 1 business day old; CLI `ptax lookup` with `--verbose` staleness output; `PtaxCotacaoResult` type
- **Platform CLI + playground** — `compare`, `batch`, and `diff` commands and routes (`/compare`, `/batch`, `/diff`) — closes DELIVERY-SURFACES parity gap for Layer 3 APIs
- **Platform CLI `mask`** — `br-validators mask <type> <value>` delegates to `@br-validators/core/mask` (validate-then-format; `--uf` for IE / RG)
- **RG contributor infrastructure (33c)** — `getRgPendingUfs()`, `getRgResearchUrl(uf)`, `RG_RESEARCH_URLS`, `CONTRIBUTING-UF.md`; OFFICIAL-SOURCES § RG expanded for 21 pending UFs (6/27 shipped)
- **RG UF BA** — format-only legacy IIPM validator (10 digits); `rg.ba.official.json`; 7/27 UFs shipped
- **RG UF AC** — format-only legacy SSP-AC validator (6 digits); `rg.ac.official.json`; 8/27 UFs shipped
- **RG UF AL** — format-only legacy POLCAL/IIEAL validator (7 digits); `rg.al.official.json`; 9/27 UFs shipped
- **RG UF AM** — format-only legacy IIACM/SSP-AM validator (9 digits); `rg.am.official.json`; 10/27 UFs shipped
- **RG UF AP** — format-only legacy PCA/SSP-AP validator (9 digits); `rg.ap.official.json`; 11/27 UFs shipped
- **RG UF DF** — format-only legacy PCDF validator (7 digits); `rg.df.official.json`; 12/27 UFs shipped
- **RG UF ES** — format-only legacy PCIES validator (9 digits); `rg.es.official.json`; 13/27 UFs shipped
- **RG UF GO** — format-only legacy PCGO validator (9 digits); `rg.go.official.json`; 14/27 UFs shipped
- **RG UFs MA, MS, MT, PA, PB** — format-only legacy validators (9 digits each); `rg.{ma,ms,mt,pa,pb}.official.json`; 19/27 UFs shipped
- **RG UFs CE, PE, PI, RN, RO, RR, SE, TO** — format-only legacy validators (9 digits each); `rg.{ce,pe,pi,rn,ro,rr,se,to}.official.json`; **27/27 UFs shipped** (phase 33c complete)
- **RG contributor guide** — [docs/community/RG-CONTRIBUTOR-GUIDE.md](docs/community/RG-CONTRIBUTOR-GUIDE.md): how to open issues, cite official SSP/PCivil sources, report algorithms; documents that most UFs lack consistent official legacy RG/DV data

---

## [1.8.3-data.0001] - 2026-06-26

### Changed

- Reference data refresh (daily bot) — **1.8.3 data #0001**: 0 dataset(s) changed (+0 −0 ~0).

---

## [1.8.3] - 2026-06-26

### Fixed

- **paises-bacen fetch** — legacy NF-e URL redirected to HTML; fetch now discovers **Documentos → Diversos** ODS (NT 2018.003 v1.01), parses zip data descriptors, and falls back to Bacen FTP
- **Data refresh bot PATCH gate** — npm publish skipped when drift was `~alterados` only (required `totalAdicionados > 0`); now publishes on any real row/field drift
- **CONFAZ fetch** — 60s HTML timeout for CFOP and CEST (fewer transient CI failures)

### Changed

- **Embedded reference data** — paises-bacen refreshed to **253** countries (NF-e ODS); PTAX rolling window updated
- **GitHub issue templates** — bug, data-source, and feature request forms + labels
- **docs** — PTAX OData bare URL documented (HTTP 500 without query parameters)

---

## [1.8.2] - 2026-06-25

### Fixed

- **IBPT fetch** — `resolveLatestIbptTabela` picks `Math.max(anos)` (was resolving 2017 → 404 on valraw)
- **Data refresh bot** — `anp-combustiveis` re-added to daily fetch; registry centralized in `data-refresh-registry.ts`

### Changed

- **Embedded reference data** — Bacen STR +1 institution; PTAX rolling window through 2026-06-25; IBPT tabela 26.1.K (12 golden cargas)

---

## [1.8.0] - 2026-06-25

### Added

- **`@br-validators/core/cst`** — offline CST lookup for ICMS, IPI, PIS, and COFINS (`getCstIcmsPorCodigo`, `getCstIpiPorCodigo`, `getCstPisPorCodigo`, `getCstCofinsPorCodigo`, `searchCstIcms`); embedded from RFB SPED Fiscal tables; `pnpm fetch:data:cst` (manual refresh)
- **`@br-validators/core/lc116`** — LC 116/2003 ISS national service list (`getLc116PorCodigo`, `searchLc116`); embedded from Planalto / NFSe republication; `pnpm fetch:data:lc116` (manual refresh)
- **`@br-validators/core/ptax`** — Bacen PTAX Fechamento exchange rates (`getPtaxCotacao`, `getPtaxUltimoDiaUtil`); 5-business-day rolling embed; pairs with `moedas`; `pnpm fetch:data:ptax` (daily bot)
- **`@br-validators/core/esocial`** — eSocial Tabela 01 worker categories (`getEsocialCategoriaPorCodigo`, `searchEsocialCategorias`); embedded from official layout tables; `pnpm fetch:data:esocial` (manual refresh)
- **`@br-validators/core/ean`** — GS1 EAN-8 / EAN-13 product barcodes (`validateEan`, `formatEan`, `stripEan`, `detectEanFormat`); modulo-10 weights 1/3; CLI + playground
- **`@br-validators/core/simples-nacional`** — LC 123/2006 Simples Nacional annex tables (`getSimplesAnexo`, `getSimplesFaixa`, `computeSimplesAliquotaEfetiva`); Anexos I–V embedded; `pnpm fetch:data:simples-nacional` (manual refresh)
- **`@br-validators/core/ibge`** — NF-e `cMunFG` helpers (`toCmunFg`, `parseCmunFg`, `computeCmunFgCheckDigit`); IBGE modulo-10 DV + nine official exceptions; golden vector `ibge.cmunfg.official.json`
- **`@br-validators/core/cnpj-motivos`** — RFB CNPJ motivos de situação cadastral (`getMotivosSituacaoCadastral`, `getMotivoSituacaoCadastralPorCodigo`); embedded from `Motivos.zip`; `pnpm fetch:data:cnpj-motivos` (monthly refresh)
- **`@br-validators/core/ibpt`** — IBPT approximate NCM tax burden Lei 12.741/2012 (`getIbptCargaPorNcmUf`, `computeIbptCargaTotal`); golden NCM×UF subset; `pnpm fetch:data:ibpt` (semestral refresh)
- **`@br-validators/core/cnis`** — CNIS / NIT worker ID (`validateNit`, `inferNitIssuer`); RV_03 modulo 11 + `issuer`/`tipo` metadata; library + CLI + playground; golden `cnis.official.json`

---

## [1.7.0] - 2026-06-24

### Added

- **Daily data refresh bot (Phase 30)** — cron 00:00 America/Sao_Paulo; 5 fetch retries × 2 min; field-level drift logs; source health escalation (warning → critical); `CRITICAL-ALERTS.md`; full-auto PATCH publish on drift
- **`@br-validators/core/anp-combustiveis`** — ANP weekly LPC municipal fuel averages (`getAnpPrecosMedios`, `getAnpPrecosMediosPorIbge`, `getAnpSemanaAtual`); `pnpm fetch:data:anp-combustiveis`; product normalization ported from [TABELA-ANP-COMBUSTIVEIS](https://github.com/AlexandreZanata/TABELA-ANP-COMBUSTIVEIS)

### Fixed

- **Data refresh report** — seal stale first-embed metadata (`comparadoCom: null`) so reports no longer show false `+42321` drift or trigger accidental auto-PATCH; `field-changes/` always written with `no_drift` when unchanged

---

## [1.6.1] - 2026-06-24

### Changed

- **npm publish is CI-only** — `scripts/assert-ci-publish.mjs` blocks local `pnpm publish`; releases via tag push or Release workflow `workflow_dispatch`
- **Release workflow** — idempotent publish (`scripts/publish-npm-if-missing.sh`), post-publish registry verification for all six packages, `npm-dist-tag` covers express and vue
- **Docs** — `docs/BRANCHING.md`, `docs/VERSIONING.md`, release agent rules updated for six-package CI flow

---

## [1.6.0] - 2026-06-24

### Added

- **`@br-validators/express`** — `brValidate()` Express middleware and `brValidateFastify()` preHandler; 18 document type ids; structured HTTP 400 `{ ok: false, field, code, message }`; body/query/params locations; optional `uf` for IE/RG
- **`@br-validators/vue`** — Vue 3 composables `useBrValidator()` plus `useCpf()`, `useCnpj()`, `useCep()`, `useTelefone()`, `usePix()`, `useInscricaoEstadual()`; reactive `error`, `formatted`, `isValid`; delegates to core `validate*` / `format*`
- **Phase 29 — community & distribution**
  - VitePress docs site (`apps/docs/`) — auto-sync `docs/LIBRARY-API.md`; deploy target `docs.br-validators.dev`
  - Dev.to article outline — `docs/marketing/devto-brazilian-data-toolkit.md`
  - RG good-first-issues index — `docs/community/RG-GOOD-FIRST-ISSUES.md` + issue template config
  - `.github/FUNDING.yml` — GitHub Sponsors
  - Playwright E2E smoke for playground — `.github/workflows/e2e.yml`
  - README: npm downloads badge + OpenSSF best-practices self-certify link
- **`@br-validators/core/rg`** — `validateRg(raw, { uf })`, `formatRg`, `stripRg`, `getRgUfSupport()` — per-UF identity card (phase 1: SP, RJ, MG, PR, RS, SC; UF required; no `detect()` auto-classify)
- CLI: `br-validators rg validate|format|strip … --uf SP`
- Playground: `/rg` with UF selector (6 implemented states)
- Community: `.github/ISSUE_TEMPLATE/rg-uf-contribution.md` for remaining 21 UFs
- **`@br-validators/core/processo-judicial`** — `validateProcessoJudicial`, `formatProcessoJudicial`, `stripProcessoJudicial`, `parseProcessoJudicial` (CNJ Resolução 65/2008, modulo 97-10)
- CLI: `br-validators processo-judicial validate|parse|format|strip`
- Playground: `/processo-judicial` with segment breakdown UI
- `detect()` classifier for 20-digit / masked CNJ numbers
- **Phase 27d — reference data surface parity**
  - CLI: `ibge lookup|list`, `feriados list --year`, `tse-municipios lookup`, `ddd lookup`, `cep faixa`, `cnae|cfop|ncm|cbo lookup|search`
  - Playground: `/data/fiscal` tabs for CNAE, CFOP, NCM, CBO; `/data/calendar` national holidays; TSE ↔ IBGE cross-ref on `/data/ibge`
  - Docs: README reference data tables updated for CLI + Playground columns
- **Docs:** consumer guideline — display `format*` / `mask()` vs backend `strip*` / padding at submit ([LIBRARY-API.md](docs/LIBRARY-API.md#consumer-warning--display-formatting-vs-backend-normalization))

---

## [1.5.0] - 2026-06-23

### Added

- **`@br-validators/core/natureza-juridica`** — `getNaturezaJuridicaPorCodigo()`; RFB CNPJ legal nature codes
- **`@br-validators/core/nbs`** — `getNbsPorCodigo()`, `searchNbs()`; NFSe Nacional Anexo B leaf codes
- **`@br-validators/core/cest`** — `getCestPorCodigo()`, `getCestPorNcm()`, `searchCest()`; CONFAZ ICMS 142/2018 ST codes
- **`@br-validators/core/moedas`** — `getMoedaPorCodigo()`, `searchMoedas()`; ISO 4217 + Bacen PTAX enrichment
- **`@br-validators/core/paises-bacen`** — `getPaisPorCodigoBacen()`; NF-e Bacen country table
- **`@br-validators/core/incoterms`** — `getIncotermPorCodigo()`; ICC Incoterms 2020 static list
- **`@br-validators/core/portos`** — `getPortoPorCodigo()`, `getPortosPorMunicipio()`, `searchPortos()`; ANTAQ port installations
- **`@br-validators/core/pncp-reference`** — PNCP domain tables (modalidades, amparos legais, etc.)
- **`@br-validators/core/transparencia-snapshots`** — Portal da Transparência endpoint registry (query-adapter classification)
- **Fetch scripts** — `pnpm fetch:data:{natureza-juridica,nbs,cest,portos,pncp-reference,transparencia}`; registered in weekly `data-refresh-bot`
- **Adapter RFCs** — [docs/ADAPTERS-PNCP-RFC.md](docs/ADAPTERS-PNCP-RFC.md), [docs/ADAPTERS-TRANSPARENCIA-RFC.md](docs/ADAPTERS-TRANSPARENCIA-RFC.md)
- **`@br-validators/cli`** — `reference-lookup` commands for natureza-juridica, nbs, cest, moedas, paises-bacen, incoterms, portos, aeroportos (`lookup <codigo>`, `--json`, `--verbose`)
- **Playground** — `/data/fiscal`, `/data/trade`, `/data/logistics` reference explorers (client-side embedded core datasets)

---

## [1.4.0] - 2026-06-23

### Added

- **`@br-validators/core/aeroportos`** — `getAeroportos()`, `getAeroportoPorIata()`, `getAeroportoPorIcao()`, `getAeroportosPorMunicipio()`; ANAC public aerodromos embedded offline; `AEROPORTOS_DATA_VERSION`
- **`@br-validators/core/tse-municipios`** — `getMapeamentoTseIbge()`, `getMunicipioIbgePorCodigoTse()`, `getCodigosTsePorMunicipio()`; TSE ↔ IBGE municipality cross-walk; `TSE_MUNICIPIOS_DATA_VERSION` (lookup-only — `titulo-eleitor` validation unchanged)
- **Fetch scripts** — `pnpm fetch:data:aeroportos`, `pnpm fetch:data:tse-municipios`; registered in weekly `data-refresh-bot`

---

## [1.3.1] - 2026-06-23

### Added

- **`@br-validators/cli`** — `bancos lookup <COMPE|ISPB>` and `bancos list [--limit n]` for offline Bacen STR participant lookup (`--json`, `--verbose`)
- **Playground** — `/data/ibge`, `/data/bancos`, `/data/catalog` reference data routes (client-side only, embedded core datasets)

---

## [1.3.0] - 2026-06-23

### Added

- **`@br-validators/core/feriados`** — `isFeriadoNacional()`, `getFeriadosNacionais(year)`, `getProximoDiaUtil()`, `getPontosFacultativosFederais(year)`; ten federal national holidays (nine Lei 662 fixed + Paixão de Cristo); nine facultative days per Portaria MGI 11.460/2025 (2026); `FERIADOS_DATA_VERSION`
- **`@br-validators/core/cnaes`** — `getCnaePorCodigo()`, `searchCnaes()`, `CNAES_DATA_VERSION`; IBGE CNAE 2.3 subclasses
- **`@br-validators/core/cfop`** — `getCfopPorCodigo()`, `searchCfop()`, `CFOP_DATA_VERSION`; CONFAZ CFOP table
- **`@br-validators/core/ncm`** — `getNcmPorCodigo()`, `searchNcm()`, `NCM_DATA_VERSION`; Siscomex NCM leaf codes
- **`@br-validators/core/cbo`** — `getCboPorCodigo()`, `searchCbo()`, `CBO_DATA_VERSION`; MTE CBO 2002 occupations
- **`@br-validators/core/cep`** — `getCepFaixaInfo(prefix)` offline UF/municipality lookup from IBGE CNEFE 2022; `CEP_FAIXA_DATA_VERSION`
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
| [1.5.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v1.5.0) | 2026-06-23 | Federal open-data embeds + CLI/playground reference surfaces |
| [1.3.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v1.3.0) | 2026-06-23 | Feriados, fiscal reference (NCM/CFOP/CNAE/CBO), CEP prefix lookup |
| [1.1.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v1.1.0) | 2026-06-23 | Offline reference data: IBGE, Bacen banks, DDD lookup, data catalog |
| [1.0.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v1.0.0) | 2026-06-23 | First stable release — API freeze |
| [0.1.0-beta.1](https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-beta.1) | 2026-06-21 | CEP library + CLI + playground |
| [0.1.0-beta.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-beta.0) | 2026-06-21 | CPF library + CLI + playground |
| [0.1.0-alpha.1](https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-alpha.1) | 2026-06-21 | CNPJ library + CLI + playground |
| [0.1.0-alpha.0](https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-alpha.0) | 2026-06-21 | Docs + harness bootstrap |

See [docs/VERSIONING.md](docs/VERSIONING.md) for versioning rules.

[Unreleased]: https://github.com/AlexandreZanata/br-validators/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/AlexandreZanata/br-validators/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/AlexandreZanata/br-validators/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/AlexandreZanata/br-validators/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v1.3.0
[1.1.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v1.1.0
[1.0.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v1.0.0
[0.1.0-beta.1]: https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-beta.1
[0.1.0-beta.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-beta.0
[0.1.0-alpha.1]: https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-alpha.1
[0.1.0-alpha.0]: https://github.com/AlexandreZanata/br-validators/releases/tag/v0.1.0-alpha.0
