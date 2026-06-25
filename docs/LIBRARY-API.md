# Library public API contract

> Version all public exports from day one. Breaking changes require major version bump.
> Package: **`@br-validators/core`** on npm — see [README](../README.md#install).
> **Also exposed via:** CLI (`br-validators <type> …`) and Vercel playground — see [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md).

---

## Language

**TypeScript only** for v1. Implementation language and rationale: [TECH-STACK.md](TECH-STACK.md).

## Package entry points

| Import path | Exports |
|-------------|---------|
| `@br-validators/core` | Full barrel (tree-shakeable) |
| `@br-validators/core/cpf` | CPF only |
| `@br-validators/core/cnpj` | CNPJ numeric + alphanumeric |
| `@br-validators/core/cep` | CEP |
| `@br-validators/core/telefone` | Brazilian telephone (fixo + celular) |
| `@br-validators/core/cnh` | CNH — Registro Nacional |
| `@br-validators/core/renavam` | RENAVAM — vehicle registry code |
| `@br-validators/core/titulo-eleitor` | Título de Eleitor — voter registration |
| `@br-validators/core/nfe-chave` | NF-e / NFC-e chave de acesso — 44-digit access key |
| `@br-validators/core/brcode` | BR Code PIX QR payload (EMV TLV + CRC16) |
| `@br-validators/core/placa` | License plates |
| `@br-validators/core/pis-pasep` | PIS / PASEP / NIS / NIT |
| `@br-validators/core/pix` | PIX keys |
| `@br-validators/core/boleto` | Boleto (linha digitável + código de barras) |
| `@br-validators/core/cartao-credito` | Credit card PAN (Luhn / ISO 7812) |
| `@br-validators/core/ean` | GS1 EAN-8 / EAN-13 product barcodes |
| `@br-validators/core/inscricao-estadual` | Inscrição Estadual — all 27 UFs |
| `@br-validators/core/inscricao-estadual-produtor-rural` | SP produtor rural IE (Regra II) |
| `@br-validators/core/detect` | Unified type detection router |
| `@br-validators/core/sanitize` | ETL fixes + validate pipeline |
| `@br-validators/core/mask` | Unified display mask (delegates to `format*`) |
| `@br-validators/core/compare` | Normalized equality check |
| `@br-validators/core/batch` | Batch validation with summary |
| `@br-validators/core/diff` | Field-level structural diff |
| `@br-validators/core/generate` | Synthetic test document generation |
| `@br-validators/core/ibge` | IBGE states + municipalities (offline reference data) |
| `@br-validators/core/bancos` | Bacen STR participants with COMPE / ISPB lookup |
| `@br-validators/core/feriados` | Brazilian national federal holidays (fixed dates) + optional facultative days |
| `@br-validators/core/cnaes` | IBGE CNAE 2.3 economic activity subclass lookup |
| `@br-validators/core/cfop` | CONFAZ CFOP fiscal operation code lookup |
| `@br-validators/core/cst` | RFB SPED CST lookup (ICMS, IPI, PIS, COFINS) |
| `@br-validators/core/lc116` | LC 116/2003 ISS national service list lookup |
| `@br-validators/core/esocial` | eSocial Tabela 01 worker category lookup |
| `@br-validators/core/ptax` | Bacen PTAX Fechamento exchange rates (pairs with `moedas`) |
| `@br-validators/core/ncm` | Siscomex NCM Mercosur nomenclature lookup |
| `@br-validators/core/cbo` | MTE CBO 2002 occupation lookup |
| `@br-validators/core/data-catalog` | Aggregated dataset transparency metadata |

---

## Shared types

```typescript
/** Stripped/canonical value when validation succeeds */
type CanonicalValue = string;

type DocumentFormat = 'numeric' | 'alphanumeric' | 'legacy' | 'mercosul';

type ValidationErrorCode =
  | 'INVALID_LENGTH'
  | 'INVALID_CHARACTER'
  | 'INVALID_CHECK_DIGIT'
  | 'KNOWN_INVALID_PATTERN'
  | 'UNSUPPORTED_FORMAT'
  | 'EMPTY_INPUT';

type ValidationResult<T extends CanonicalValue = CanonicalValue> =
  | { ok: true; value: T; format?: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string };

type FormatResult =
  | { ok: true; formatted: string }
  | { ok: false; code: ValidationErrorCode; message: string };

/** Branded types — only produced by successful validate*() */
type Cpf = string & { readonly __brand: 'Cpf' };
type Cnpj = string & { readonly __brand: 'Cnpj' };
type Cep = string & { readonly __brand: 'Cep' };
type Placa = string & { readonly __brand: 'Placa' };
type PisPasep = string & { readonly __brand: 'PisPasep' };
type PixKey = string & { readonly __brand: 'PixKey' };
type PisPasep = string & { readonly __brand: 'PisPasep' };
```

All public validators return `ValidationResult<T>` with branded `T` where applicable — **never** throw for invalid input (unless documented `assert*` helpers).

### CLI mirror

Every `validate*` / `format*` / `strip*` function maps to:

```bash
br-validators <type> validate|format|strip <value> [--json]
```

See [DELIVERY-SURFACES.md](DELIVERY-SURFACES.md).

---

## Core API — CPF

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripCpf` | `(input: string) => string` | Remove non-digits |
| `isValidCpf` | `(input: string) => boolean` | Modulo 11, reject known invalid patterns |
| `validateCpf` | `(input: string) => ValidationResult` | Full result with canonical 11 digits |
| `formatCpf` | `(input: string) => FormatResult` | `XXX.XXX.XXX-DD` after validation |

**Invariants:** Output canonical form is exactly 11 digits. Alphanumeric CPF **not supported** until RFB publishes spec.

**Official source:** [RFB CPF portal](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) · `CPF_OFFICIAL_SOURCE_URL` · `tests/vectors/cpf.official.json` · Golden: `12345678909`, `11144477735`

---

## Core API — CNPJ

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripCnpj` | `(input: string) => string` | Remove punctuation; preserve A-Z0-9 |
| `detectCnpjFormat` | `(input: string) => DocumentFormat \| 'unknown'` | Detect numeric vs alphanumeric |
| `isValidCnpjNumeric` | `(input: string) => boolean` | 14-digit modulo 11 |
| `isValidCnpjAlphanumeric` | `(input: string) => boolean` | ASCII-48 + SERPRO weights |
| `isValidCnpj` | `(input: string) => boolean` | Either format |
| `validateCnpj` | `(input: string) => ValidationResult` | Includes `format` in success branch |
| `formatCnpjNumeric` | `(input: string) => FormatResult` | `XX.XXX.XXX/XXXX-DD` |
| `formatCnpjAlphanumeric` | `(input: string) => FormatResult` | Mask TBD per RFB display rules |

**Invariants:** Canonical value length always 14. **Never parse as integer.**

**Official source:** [RFB CNPJ alfanumérico FAQ (PDF)](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) · [SERPRO DV PDF](https://www.serpro.gov.br/menu/noticias/videos/calculodvcnpjalfanaumerico.pdf) · `CNPJ_OFFICIAL_SOURCE_URL` · `tests/vectors/cnpj.official.json` · Golden: `12ABC34501DE35`

---

## Core API — CEP

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripCep` | `(input: string) => string` | 8 digits only |
| `isValidCep` | `(input: string) => boolean` | Length + digits; no check digit |
| `validateCep` | `(input: string) => ValidationResult<Cep>` | Structural validation only |
| `formatCep` | `(input: string) => FormatResult` | `XXXXX-XXX` |
| `getCepFaixaInfo` | `(prefix: string) => CepFaixa \| undefined` | 5-digit prefix (or full CEP) → UF + IBGE municipality |
| `getCepFaixas` | `() => readonly CepFaixa[]` | All embedded prefix rows |
| `CEP_FAIXA_DATA_VERSION` | — | `DatasetMetadata` for IBGE CNEFE aggregation |

**Official source:** [Correios CEP API manual](https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep) · `CEP_OFFICIAL_SOURCE_URL` · `tests/vectors/cep.official.json` · Golden: `01310100`, `20040020`

**Prefix lookup source:** [IBGE CNEFE 2022](https://www.ibge.gov.br/estatisticas/sociais/populacao/38734-cadastro-nacional-de-enderecos-para-fins-estatisticos.html) · `tests/vectors/cep-faixa.official.json` · Golden prefixes: `01310` (São Paulo/SP), `20040` (Rio/RJ)

```typescript
import { validateCep, getCepFaixaInfo, CEP_FAIXA_DATA_VERSION } from '@br-validators/core/cep';

getCepFaixaInfo('01310');
// { prefixo: '01310', uf: 'SP', codigoIbge: 3550308, cidade: 'São Paulo' }
```

---

## Core API — Telefone

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateTelefone` | `(input: string) => TelefoneValidationResult` | Anatel DDD + fixo (8-digit) or celular (9-digit starting with 9) |
| `formatTelefone` | `(input: string) => FormatResult` | Mask `(DD) 9XXXX-XXXX` or `(DD) XXXX-XXXX` |
| `stripTelefone` | `(input: string) => string` | National canonical digits (strips `+55` / leading `0` when applicable) |
| `isValidTelefone` | `(input: string) => boolean` | Convenience wrapper |

**Success result:** `{ ok: true, value: Telefone, tipo: 'celular' | 'fixo', format: 'telefone' }`

**Official source:** [Anatel — Plano de Numeração Brasileiro](https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro) · `TELEFONE_OFFICIAL_SOURCE_URL` · `tests/vectors/telefone.official.json` · Golden celular: `11999999999`, fixo: `1133333333`

---

## Core API — CNH

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateCnh` | `(input: string) => ValidationResult<Cnh>` | Registro Nacional modulo 11 with inter-DV desconto |
| `formatCnh` | `(input: string) => FormatResult` | Official system format: 11 contiguous digits |
| `stripCnh` | `(input: string) => string` | Digits only |
| `isValidCnh` | `(input: string) => boolean` | Convenience wrapper |

**Success result:** `{ ok: true, value: Cnh, format: 'numeric' }`

**Official sources:** [OFFICIAL-SOURCES.md § CNH](OFFICIAL-SOURCES.md#cnh--reference-index) — [CONTRAN 511/2014](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf) · [Validar CNH — gov.br](https://www.gov.br/pt-br/servicos/validar-cnh) · [AdvPL CNH](https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-cnh/) · [GeraValida](https://www.geravalida.com.br/validador-cnh) · [GeradorBR](https://geradorbr.com/validador-de-cnh/) · `CNH_OFFICIAL_SOURCE_URL` · `tests/vectors/cnh.official.json` · Golden: `62472927637`

---

## Core API — RENAVAM

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateRenavam` | `(input: string) => ValidationResult<Renavam>` | Modulo 11, peso 9 (single check digit) |
| `formatRenavam` | `(input: string) => FormatResult` | Official system format: 11 contiguous digits |
| `stripRenavam` | `(input: string) => string` | Digits only |
| `isValidRenavam` | `(input: string) => boolean` | Convenience wrapper |

**Success result:** `{ ok: true, value: Renavam, format: 'numeric' }`

**Official sources:** [OFFICIAL-SOURCES.md § RENAVAM](OFFICIAL-SOURCES.md#renavam--reference-index) — [Portaria DENATRAN 27/2013](https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf) · [Consultar veículo RENAVAM — gov.br](https://www.gov.br/pt-br/servicos/consultar-dados-de-veiculo-na-base-renavam) · [AdvPL RENAVAM](https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-renavam/) · [GeraValida](https://www.geravalida.com.br/gerador-de-renavam) · [GeradorFácil](https://geradorfacil.com/geradores/renavam) · `RENAVAM_OFFICIAL_SOURCE_URL` · `tests/vectors/renavam.official.json` · Golden: `63977791104`

---

## Core API — Título de Eleitor

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateTituloEleitor` | `(input: string) => TituloEleitorValidationResult` | Modulo 11, TSE UF codes 01–28 |
| `formatTituloEleitor` | `(input: string) => FormatResult` | Display mask `XXXX XXXX XXXX` |
| `stripTituloEleitor` | `(input: string) => string` | Digits only |
| `isValidTituloEleitor` | `(input: string) => boolean` | Convenience wrapper |

**Success result:** `{ ok: true, value: TituloEleitor, format: 'numeric', ufCode: number, uf?: UfCode, exterior?: true }`

**Official sources:** [OFFICIAL-SOURCES.md § Título de Eleitor](OFFICIAL-SOURCES.md#título-de-eleitor--reference-index) — [Resolução TSE 20.132/1998](https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998) · [Res. 23.659/2021](https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-659-de-26-de-outubro-de-2021) · Weights: [Wikipedia PT](https://pt.wikipedia.org/wiki/T%C3%ADtulo_eleitoral#C%C3%A1lculo_do_d%C3%ADgito_verificador) · [Ghiorzi](http://ghiorzi.org/DVnew.htm#e) · `TITULO_ELEITOR_OFFICIAL_SOURCE_URL` · `TITULO_ELEITOR_ALGORITHM_WEIGHTS_REF_URL` · `tests/vectors/titulo-eleitor.official.json` · Golden: `004356870906`

---

## Core API — Processo judicial CNJ

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateProcessoJudicial` | `(input: string) => ProcessoJudicialValidationResult` | Modulo 97-10 + justice segment 1–9 |
| `parseProcessoJudicial` | `(input: string) => ProcessoJudicialSegments \| undefined` | Segment breakdown; `undefined` when invalid |
| `formatProcessoJudicial` | `(input: string) => FormatResult` | Official mask `NNNNNNN-DD.AAAA.J.TR.OOOO` |
| `stripProcessoJudicial` | `(input: string) => string` | Digits only (20) |
| `isValidProcessoJudicial` | `(input: string) => boolean` | Convenience wrapper |
| `parseProcessoJudicialParts` | `(stripped: string) => ProcessoJudicialSegments \| null` | Low-level field extraction |

**Success result:** `{ ok: true, value: ProcessoJudicial, format: 'numeric', segments: ProcessoJudicialSegments }`

**Official sources:** [OFFICIAL-SOURCES.md § Processo judicial](OFFICIAL-SOURCES.md#processo-judicial--reference-index) — [Resolução CNJ 65/2008](https://atos.cnj.jus.br/atos/detalhar/119) · [Anexo VIII PDF](https://www.cnj.jus.br/wp-content/uploads/2011/03/minuta_anexos_da_resoluo_numerao_nica_14_12_08.pdf) · `PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL` · `tests/vectors/processo-judicial.official.json` · Golden: `0000100-34.2008.9.21.0000`

---

## Core API — RG (Registro Geral)

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateRg` | `(input: string, options: { uf: RgUfCode }) => RgValidationResult` | Per-UF validation — **UF required** |
| `formatRg` | `(input: string, options: { uf: RgUfCode }) => FormatResult` | Display mask when UF supports it |
| `stripRg` | `(input: string, options: { uf: RgUfCode }) => string` | Canonical value per UF rules |
| `isValidRg` | `(input: string, options: { uf: RgUfCode }) => boolean` | Convenience wrapper |
| `getRgUfSupport` | `() => readonly RgUfCode[]` | Implemented states (phase 1: SP, RJ, MG, PR, RS, SC) |
| `getRgUfRules` | `(uf: RgUfCode) => RgUfRules` | Per-UF format metadata |
| `getRgOfficialSourceUrl` | `(uf: RgUfCode) => string` | Official or reference URL per UF |

**Success result:** `{ ok: true, value: Rg, uf: RgUfCode, format: 'rg', checkDigitValidated: boolean }`

**Unsupported UF:** `{ ok: false, code: 'UF_NOT_IMPLEMENTED', message: string }` — does not throw.

**Official sources:** [OFFICIAL-SOURCES.md § RG](OFFICIAL-SOURCES.md#rg--reference-index) — [Ghiorzi DV tables](http://ghiorzi.org/DVnew.htm) (SP/RJ/MG) · `RG_OFFICIAL_SOURCE_URLS` · `tests/vectors/rg.{sp,rj,mg,pr,rs,sc}.official.json` · Golden SP: `120300011`

**Not in `detect()`:** RG is too ambiguous without UF — callers must pass `{ uf }`.

---

## Core API — NF-e chave de acesso

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateNfeChave` | `(input: string) => NfeChaveValidationResult` | Full validation — length, cUF, mod, DV |
| `parseNfeChave` | `(input: string) => NfeChaveValidationResult` | Same as `validateNfeChave`; returns `parsed` fields on success |
| `isValidNfeChave` | `(input: string) => boolean` | Convenience wrapper |
| `formatNfeChave` | `(input: string) => FormatResult` | Grouped display — 11×4 digits |
| `stripNfeChave` | `(input: string) => string` | Digits only |
| `parseNfeChaveParts` | `(stripped: string) => NfeChaveParts \| null` | Low-level field extraction |
| `computeNfeChaveCheckDigit` | `(base43: string) => number` | DV from 43-digit base (MOC §2.2.6.2) |

**Success result:** `{ ok: true, value: NfeChave, format: 'numeric', parsed: NfeChaveParsed, uf?: UfCode }`

**Official sources:** [OFFICIAL-SOURCES.md § NF-e chave](OFFICIAL-SOURCES.md#nf-e--nfc-e-chave-de-acesso--reference-index) — [Portal NF-e MOC](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D) · [MOC online §2.2.6.2](http://moc.sped.fazenda.pr.gov.br/#2.2.6.2. Cálculo do Dígito Verificador da Chave de Acesso da NF-e) · [MOC 7.0 PDF](https://www.confaz.fazenda.gov.br/legislacao/arquivo-manuais/moc7-visao-geral.pdf) · `NFE_CHAVE_OFFICIAL_SOURCE_URL` · `tests/vectors/nfe-chave.official.json` · Golden: `52060433009911002506550120000007800267301615`

---

## Core API — BR Code

| Function | Signature | Description |
|----------|-----------|-------------|
| `parseBrCode` | `(input: string) => BrCodeValidationResult` | Parse EMV TLV payload; extract merchant, amount, txid, PIX key or initiation URL |
| `validateBrCode` | `(input: string) => BrCodeValidationResult` | Same as `parseBrCode` but requires static PIX key (subfield 01) |
| `buildStaticPixBrCode` | `(input: StaticPixBrCodeInput) => string` | Build static PIX QR EMV payload + CRC16; omit `amount` for permanent static QR |
| `isValidBrCode` | `(input: string) => boolean` | Convenience wrapper over `validateBrCode` |
| `verifyBrCodeCrc` | `(payload: string) => { ok: true } \| { ok: false; message: string }` | CRC16-CCITT check (tag 63) |
| `parseBrCodePayload` | `(input: string) => BrCodeParseResult` | Lower-level parse (no branded result wrapper) |

**Success result:** `{ ok: true, value: BrCodePayload, format: 'brcode', merchantName, merchantCity, pixKey?, pixKeyType?, amount?, txid?, pixInitiationUrl? }`

```typescript
type StaticPixBrCodeInput = {
  pixKey: string;
  merchantName: string;  // max 25 chars
  merchantCity: string;    // max 15 chars, uppercased
  amount?: string;         // omit → permanent static QR; else fixed value (tag 54)
  txid?: string;           // default '***'
};

import { buildStaticPixBrCode, validateBrCode } from '@br-validators/core/brcode';

const permanent = buildStaticPixBrCode({
  pixKey: 'pix@bcb.gov.br',
  merchantName: 'Fulano de Tal',
  merchantCity: 'BRASILIA',
});
validateBrCode(permanent).ok; // true — matches BRCODE_GOLDEN_STATIC_EMAIL when inputs match golden vector
```

**Official source:** [Bacen Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf) · [Manual de Padrões para Iniciação do Pix (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf) · `BRCODE_OFFICIAL_SOURCE_URL` · `tests/vectors/brcode.official.json` · Golden static payloads in `BRCODE_GOLDEN_STATIC_*`

---

## Core API — License plate (Placa)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `detectPlacaFormat` | `(input: string) => 'legacy' \| 'mercosul' \| 'unknown'` | |
| `isValidPlacaLegacy` | `(input: string) => boolean` | `LLLNNNN` |
| `isValidPlacaMercosul` | `(input: string) => boolean` | `LLLNLNN` |
| `isValidPlaca` | `(input: string) => boolean` | Either format |
| `validatePlaca` | `(input: string) => ValidationResult<Placa>` | `{ format: 'legacy' \| 'mercosul' }` on success |
| `convertPlacaToMercosul` | `(input: string) => FormatResult` | Legacy → Mercosul where mappable |
| `formatPlaca` | `(input: string) => FormatResult` | Uppercase, no hyphen |
| `stripPlaca` | `(input: string) => string` | Uppercase, remove hyphen/spaces |

**Official source:** [CONTRAN 729/2018](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf) · [Resolução 969/2022 Anexo I](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao9692022anexos.pdf) · `PLACA_OFFICIAL_SOURCE_URL` · `tests/vectors/placa.official.json` · Golden: `ABC1D23`, `ABC1234`

---

## Core API — PIS / PASEP

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripPisPasep` | `(input: string) => string` | Remove non-digits |
| `isValidPisPasep` | `(input: string) => boolean` | Modulo 11, reject known invalid patterns |
| `validatePisPasep` | `(input: string) => ValidationResult<PisPasep>` | Full result with canonical 11 digits |
| `formatPisPasep` | `(input: string) => FormatResult` | `XXX.XXXXX.XX-X` after validation |

**Invariants:** Output canonical form is exactly 11 digits. Covers PIS, PASEP, NIS, and NIT (same CNIS algorithm).

**Official source:** [SIPREV RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) · `PIS_PASEP_OFFICIAL_SOURCE_URL` · `tests/vectors/pis-pasep.official.json` · Golden: `10027230888`, `12056456402`

---

## Core API — PIX key

| Function | Signature | Behavior |
|----------|-----------|----------|
| `detectPixKeyType` | `(input: string) => PixKeyType \| 'unknown'` | Bacen precedence rules |
| `isValidPixKey` | `(input: string, options?) => boolean` | Delegates by detected or forced type |
| `validatePixKey` | `(input: string, options?) => PixValidationResult` | Success includes `keyType` + `format` |

```typescript
type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

type PixValidationResult =
  | { ok: true; value: PixKey; keyType: PixKeyType; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string; keyType?: PixKeyType };

type ValidatePixKeyOptions = { type?: PixKeyType };
```

Phone keys: E.164 with `+55` Brazilian mobile per DICT. EVP: lowercase UUID with hyphens. Email: DICT regex, max 77, lowercase.

**Official sources:** [Manual Iniciação PIX (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf) · [DICT API v2.9](https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html) · `PIX_OFFICIAL_SOURCE_URL` · `PIX_DICT_API_SOURCE_URL` · `tests/vectors/pix.official.json`

---

## Core API — Boleto

| Function | Signature | Behavior |
|----------|-----------|----------|
| `detectBoletoInputKind` | `(input: string) => DetectedBoletoInputKind` | `linha-digitavel` \| `codigo-barras` \| `arrecadacao` \| `unknown` |
| `detectBoletoSituacao` | `(stripped: string) => BoletoSituacaoKind` | `situacao-1` \| `situacao-2` \| `unknown` |
| `validateBoleto` | `(input: string, options?: ValidateBoletoOptions) => BoletoValidationResult` | Auto-detect cobrança or arrecadação + validate |
| `validateLinhaDigitavel` | `(input: string) => CobrancaBoletoValidationResult` | 47 digits, modulo 10 field DVs |
| `validateCodigoBarras` | `(input: string) => CobrancaBoletoValidationResult` | 44 digits, modulo 11 barcode DV |
| `validateArrecadacao` | `(input: string) => ArrecadacaoValidationResult` | 48-digit linha or 44-digit barcode (product `8`) |
| `validateArrecadacaoLinha` | `(input: string) => ArrecadacaoValidationResult` | 48 digits, modulo 10/11 field DVs + general DV |
| `validateArrecadacaoCodigoBarras` | `(input: string) => ArrecadacaoValidationResult` | 44 digits, general DV only |
| `linhaArrecadacaoToCodigoBarras` | `(linha48: string) => string` | Strip field DVs → 44-digit payload |
| `isValidArrecadacao` | `(input: string) => boolean` | Boolean wrapper |
| `validateFatorVencimento` | `(factor: string) => FatorVencimentoValidationResult` | Optional semantic (Situação 1) |
| `validateValorDocumento` | `(value: string) => ValorDocumentoValidationResult` | Optional semantic (Situação 1) |
| `convertLinhaToCodigoBarras` | `(input: string) => BoletoValidationResult` | Validate linha → return barcode |
| `convertCodigoBarrasToLinhaDigitavel` | `(input: string) => BoletoValidationResult` | Validate barcode → return linha |
| `stripLinhaDigitavel` | `(input: string) => string` | Remove non-digits |
| `formatLinhaDigitavel` | `(stripped47: string) => string` | Masked display format |
| `isValidBoleto` | `(input: string, options?) => boolean` | Boolean wrapper |

```typescript
type BoletoInputKind =
  | 'linha-digitavel'
  | 'codigo-barras'
  | 'arrecadacao-linha'
  | 'arrecadacao-codigo-barras';

type CobrancaBoletoValidationResult =
  | { ok: true; value: LinhaDigitavel | CodigoBarras; inputKind: 'linha-digitavel' | 'codigo-barras'; format: 'linha-digitavel' | 'codigo-barras'; situacao: '1' | '2' }
  | { ok: false; code: ValidationErrorCode; message: string; inputKind?: BoletoInputKind };

type BoletoValidationResult =
  | Extract<CobrancaBoletoValidationResult, { ok: true }>
  | { ok: true; value: string; inputKind: 'arrecadacao-linha' | 'arrecadacao-codigo-barras'; format: 'arrecadacao'; segment: string; valueType: '6' | '7' | '8' | '9' }
  | { ok: false; code: ValidationErrorCode; message: string; inputKind?: BoletoInputKind };

type ValidateBoletoOptions = {
  kind?: BoletoInputKind;
  validateDueFactor?: boolean;
  validateAmount?: boolean;
};
```

Golden vectors: Santander Situação 1 linha ↔ barcode; Situação 2 pair in `tests/vectors/boleto.situacao2.official.json`; arrecadação in `tests/vectors/boleto-arrecadacao.official.json`.

**Official sources:**

| Kind | Source |
|------|--------|
| Cobrança (47/44) | [FEBRABAN Convenção da Cobrança FB-0061/2021 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf) · `BOLETO_OFFICIAL_SOURCE_URL` |
| Arrecadação (48/44, product `8`) | [FEBRABAN Layout Padrão de Arrecadação v7 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20-%20C%C3%B3digo%20de%20Barras%20-%20Vers%C3%A3o%207%20-%2001_03_2023_mn.pdf) · `BOLETO_ARRECADACAO_OFFICIAL_SOURCE_URL` |

---

## Core API — Credit card (Luhn)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripCartaoCredito` | `(input: string) => string` | Remove non-digits |
| `passesLuhn` | `(pan: string) => boolean` | Raw Luhn on digit string |
| `computeLuhnSum` | `(pan: string) => number` | Annex B sum (internal/testing) |
| `isValidLuhn` | `(input: string) => boolean` | Strip → length → chars → Luhn |
| `isValidCartaoCredito` | `(input: string) => boolean` | Full validation boolean |
| `validateCartaoCredito` | `(input: string) => CartaoCreditoValidationResult` | Luhn + length + brand on success |
| `detectCardBrand` | `(strippedPan: string) => CardBrand` | Best-effort IIN heuristics |
| `formatCartaoCredito` | `(input: string) => FormatResult` | Grouped display after validation |

```typescript
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'unknown';

type CartaoCredito = string & { readonly __brand: 'CartaoCredito' };

type CartaoCreditoValidationResult =
  | { ok: true; value: CartaoCredito; format: 'cartao-credito'; brand: CardBrand }
  | { ok: false; code: ValidationErrorCode; message: string; brand?: CardBrand };
```

Golden vectors: Visa `4111111111111111`, Mastercard `5555555555554444`, Amex `378282246310005`, Luhn walkthrough `79927398713`.

**Official source:** [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) · `CARTAO_OFFICIAL_SOURCE_URL` · `tests/vectors/cartao-credito.official.json`

---

## Core API — Inscrição Estadual (IE)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripInscricaoEstadual` | `(input: string) => string` | Remove non-digits |
| `isValidInscricaoEstadual` | `(input, { uf }) => boolean` | Boolean wrapper |
| `validateInscricaoEstadual` | `(input, { uf }) => InscricaoEstadualValidationResult` | Per-UF check digits (27 UFs) |
| `validateIeSp` / `validateIeMt` / `validateIeDf` / … | `(input: string) => …` | Direct per-UF validators (`validateIeAc` … `validateIeTo`) |
| `formatInscricaoEstadual` | `(input, { uf }) => FormatResult` | SP/DF mask; other UFs return canonical digits |
| `getIeOfficialSourceUrl` | `(uf: UfCode) => string` | Primary SEFAZ URL per UF |

### IE produtor rural (SP only)

| Function | Signature | Behavior |
|----------|-----------|----------|
| `stripIeSpRural` | `(input: string) => string` | Preserve `P`, strip punctuation |
| `isValidIeProdutorRural` | `(uf, input) => boolean` | Boolean wrapper |
| `validateIeProdutorRural` | `(uf, input) => IeProdutorRuralValidationResult` | SP Regra II only; non-SP → `UNSUPPORTED_FORMAT` |
| `validateIeSpRural` | `(input: string) => IeProdutorRuralValidationResult` | Direct SP rural validator |
| `formatIeProdutorRural` | `(input: string) => FormatResult` | Mask `P-0MMMSSSS.D/000` |
| `getIeProdutorRuralOfficialSourceUrl` | `() => string` | [SINTEGRA cad_SP.html](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) |
| `isSpRuralIeInput` | `(input: string) => boolean` | Detect `P` prefix for CLI/playground routing |

```typescript
type InscricaoEstadualProdutorRural = string & { readonly __brand: 'InscricaoEstadualProdutorRural' };

type IeProdutorRuralValidationResult =
  | { ok: true; value: InscricaoEstadualProdutorRural; uf: 'SP'; format: 'inscricao-estadual-produtor-rural' }
  | { ok: false; code: ValidationErrorCode; message: string; uf?: UfCode };
```

**Golden:** `P011004243002` (masked `P-01100424.3/002`) — `tests/vectors/inscricao-estadual-produtor-rural.official.json`

**CLI:** `br-validators ie validate P-01100424.3/002 --uf SP` auto-routes to produtor rural when input starts with `P`.

```typescript
type UfCode =
  | 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MG' | 'MS' | 'MT'
  | 'PA' | 'PB' | 'PE' | 'PI' | 'PR' | 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO';

type InscricaoEstadual = string & { readonly __brand: 'InscricaoEstadual' };

type InscricaoEstadualValidationResult =
  | { ok: true; value: InscricaoEstadual; uf: UfCode; format: 'inscricao-estadual' }
  | { ok: false; code: ValidationErrorCode; message: string; uf?: UfCode };
```

**Official sources (per UF):** see [OFFICIAL-SOURCES.md § IE](OFFICIAL-SOURCES.md#inscrição-estadual-ie--all-27-ufs) and [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md).

| UF | Primary source | SINTEGRA mirror | Golden (stripped) | Test file |
|----|----------------|-----------------|-------------------|-----------|
| **AC** | [SEFAZ-AC](https://sefaz.ac.gov.br/) | [cad_AC](http://www.sintegra.gov.br/Cad_Estados/cad_AC.html) | `0113253877910` | `ie.ac.official.json` |
| **AL** | [SEFAZ-AL cálculo](https://www.sefaz.al.gov.br/calculo) | [cad_AL](http://www.sintegra.gov.br/Cad_Estados/cad_AL.html) | `248682954` | `ie.al.official.json` |
| **AM** | [SEFAZ-AM](https://www.sefaz.am.gov.br/) | [cad_AM](http://www.sintegra.gov.br/Cad_Estados/cad_AM.html) | `917050150` | `ie.am.official.json` |
| **AP** | [SEFAZ-AP](https://www.sefaz.ap.gov.br/) | [cad_AP](http://www.sintegra.gov.br/Cad_Estados/cad_AP.html) | `039045820` | `ie.ap.official.json` |
| **BA** | [SEFAZ-BA cálculo DV](https://www.sefaz.ba.gov.br/inspetoria-eletronica/icms/cadastro/calculo-dv/) | [cad_BA](http://www.sintegra.gov.br/Cad_Estados/cad_BA.html) | `63984300` | `ie.ba.official.json` |
| **CE** | [SEFAZ-CE](https://www.sefaz.ce.gov.br/) | [cad_CE](http://www.sintegra.gov.br/Cad_Estados/cad_CE.html) | `836182316` | `ie.ce.official.json` |
| **DF** | [Receita DF](https://www.receita.fazenda.df.gov.br/) | [cad_DF](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html) | `0730000100109` | `ie.df.official.json` |
| **ES** | [SEFAZ-ES](https://sitenet.es.gov.br/sefaz/) | [cad_ES](http://www.sintegra.gov.br/Cad_Estados/cad_ES.html) | `463921810` | `ie.es.official.json` |
| **GO** | [CCE-GO](http://www.sefaz.go.gov.br/ServicosAFA/ece.html) | [cad_GO](http://www.sintegra.gov.br/Cad_Estados/cad_GO.html) | `112237118` | `ie.go.official.json` |
| **MA** | [SEFAZ-MA](https://www.sefaz.ma.gov.br/) | [cad_MA](http://www.sintegra.gov.br/Cad_Estados/cad_MA.html) | `123517680` | `ie.ma.official.json` |
| **MG** | [SEF/MG cadastro](https://www.fazenda.mg.gov.br/empresas/Cadastro/cadastro/consultapublica.html) | [cad_MG](http://www.sintegra.gov.br/Cad_Estados/cad_MG.html) | `2490944173923` | `ie.mg.official.json` |
| **MS** | [SEFAZ-MS](https://www.sefaz.ms.gov.br/) | [cad_MS](http://www.sintegra.gov.br/Cad_Estados/cad_MS.html) | `282570926` | `ie.ms.official.json` |
| **MT** | [SEFAZ-MT Port. Art. 6º](https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=) | [cad_MT](http://www.sintegra.gov.br/Cad_Estados/cad_MT.html) | `130000019` / `00130000019` | `ie.mt.official.json` |
| **PA** | [SEFA-PA](https://www.sefa.pa.gov.br/) | [cad_PA](http://www.sintegra.gov.br/Cad_Estados/cad_PA.html) | `153662476` | `ie.pa.official.json` |
| **PB** | [Receita PB](https://www.receita.pb.gov.br/) | [cad_PB](http://www.sintegra.gov.br/Cad_Estados/cad_PB.html) | `312029063` | `ie.pb.official.json` |
| **PE** | [SEFAZ-PE](https://www.sefaz.pe.gov.br/) | [cad_PE](http://www.sintegra.gov.br/Cad_Estados/cad_PE.html) | `064970639` | `ie.pe.official.json` |
| **PI** | [SEFAZ-PI](https://www.sefaz.pi.gov.br/) | [cad_PI](http://www.sintegra.gov.br/Cad_Estados/cad_PI.html) | `465180426` | `ie.pi.official.json` |
| **PR** | [Fazenda PR cálculo DV](https://www.fazenda.pr.gov.br/Pagina/calculo-digito-verificador) | [cad_PR](http://www.sintegra.gov.br/Cad_Estados/cad_PR.html) | `0031595584` | `ie.pr.official.json` |
| **RJ** | [Portal Fazenda RJ](https://portal.fazenda.rj.gov.br/cadastro/) | [cad_RJ](http://www.sintegra.gov.br/Cad_Estados/cad_RJ.html) | `06540481` | `ie.rj.official.json` |
| **RN** | [SET-RN](https://www.set.rn.gov.br/) | [cad_RN](http://www.sintegra.gov.br/Cad_Estados/cad_RN.html) | `204502292` | `ie.rn.official.json` |
| **RO** | [SEFIN-RO](https://www.sefin.ro.gov.br/) | [cad_RO](http://www.sintegra.gov.br/Cad_Estados/cad_RO.html) | `39206839474860` | `ie.ro.official.json` |
| **RR** | [SEFAZ-RR](https://www.sefaz.rr.gov.br/) | [cad_RR](http://www.sintegra.gov.br/Cad_Estados/cad_RR.html) | `247681047` | `ie.rr.official.json` |
| **RS** | [SEFAZ-RS](https://www.sefaz.rs.gov.br/) | [cad_RS](http://www.sintegra.gov.br/Cad_Estados/cad_RS.html) | `3288345503` | `ie.rs.official.json` |
| **SC** | [SAT/SEF-SC](https://sat.sef.sc.gov.br/) | [cad_SC](http://www.sintegra.gov.br/Cad_Estados/cad_SC.html) | `632480718` | `ie.sc.official.json` |
| **SE** | [SEFAZ-SE](https://www.sefaz.se.gov.br/) | [cad_SE](http://www.sintegra.gov.br/Cad_Estados/cad_SE.html) | `826594042` | `ie.se.official.json` |
| **SP** | [SEFAZ-SP Sintegra rotina](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) | [cad_SP](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) | `110042490114` | `ie.sp.official.json` |
| **TO** | [SEFAZ-TO](https://www.sefaz.to.gov.br/) | [cad_TO](http://www.sintegra.gov.br/Cad_Estados/cad_TO.html) | `27035910938` | `ie.to.official.json` |

Constants: `IE_OFFICIAL_SOURCE_URLS` (all UFs), legacy `IE_SP_OFFICIAL_SOURCE_URL`, `IE_MT_OFFICIAL_SOURCE_URL`, `IE_DF_OFFICIAL_SOURCE_URL`. CLI `--source` and `getIeOfficialSourceUrl(uf)` return the primary URL per UF.

---

## Core API — IBGE localities (reference data)

> **Offline embedded data** from [IBGE Serviço de Dados](https://servicodados.ibge.gov.br/api/docs/localidades).  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md) · Weekly bot: `.github/workflows/data-refresh-bot.yml`

| Function | Returns |
|----------|---------|
| `getEstados()` | All 27 federative units with `codigo`, `sigla`, `nome`, `regiao` |
| `getMunicipios(options?)` | All municipalities, or filtered by `uf` (case-insensitive) |
| `getMunicipioPorCodigo(codigo)` | Single municipality or `undefined` |
| `IBGE_DATA_VERSION` | `DatasetMetadata` — capture date, official endpoints, row counts, weekly delta |

Golden vectors: `3550308` (São Paulo/SP), `5107925` (Sorriso/MT), `5300108` (Brasília/DF), `5101837` (Boa Esperança do Norte/MT).

```typescript
import {
  getEstados,
  getMunicipios,
  getMunicipioPorCodigo,
  IBGE_DATA_VERSION,
} from '@br-validators/core/ibge';
```

**No runtime fetch** — JSON embedded at build time from official IBGE API via `scripts/fetch-ibge.ts`.

---

## Core API — Bacen banks (reference data)

> **Offline embedded data** from [Bacen Participantes STR CSV](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv).  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Function | Returns |
|----------|---------|
| `getBancos()` | All institutions with valid 3-digit COMPE codes |
| `getBancoPorCodigo(codigo)` | Single bank or `undefined` (normalizes `1` → `001`) |
| `getBancoPorIspb(ispb)` | Single bank or `undefined` (8-digit ISPB) |
| `BANCOS_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: COMPE `001` (Banco do Brasil), `341` (Itaú), `260` (Nubank).

```typescript
import { getBancos, getBancoPorCodigo, BANCOS_DATA_VERSION } from '@br-validators/core/bancos';
```

---

## Core API — Telefone DDD lookup (reference data)

> Extends `@br-validators/core/telefone` — does **not** change `validateTelefone` / `ANATEL_DDDS`.

| Function | Returns |
|----------|---------|
| `getDddInfo(ddd)` | `{ ddd, uf, regiao, municipios }` or `undefined` |
| `TELEFONE_DDD_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: `11` → SP/Sudeste, `66` → MT/Centro-Oeste, `92` → AM/Norte.

```typescript
import { getDddInfo, validateTelefone, TELEFONE_DDD_DATA_VERSION } from '@br-validators/core/telefone';
```

---

## Core API — National holidays (feriados)

> **Federal calendar** per [Lei 662/1949](https://www.planalto.gov.br/ccivil_03/leis/l0662.htm) (fixed dates) and annual [Portaria MGI](https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026) (Paixão de Cristo).  
> **10 national holidays** in 2026: nine fixed + Good Friday. Pontos facultativos are separate.

| Function | Returns |
|----------|---------|
| `isFeriadoNacional(input)` | `true` for fixed Lei 662 holidays **or** Paixão de Cristo (Good Friday) |
| `getFeriadosNacionais(year)` | Sorted list — `tipo: 'fixo'` or `'movel'` (Paixão de Cristo only) |
| `getProximoDiaUtil(input)` | Next weekday that is not a national holiday (`YYYY-MM-DD`) |
| `getPontosFacultativosFederais(year)` | Portaria MGI facultative days — Carnaval, Cinzas, Corpus Christi, Servidor Público, vésperas, plus year-specific bridge days when published |
| `FERIADOS_DATA_VERSION` | Planalto + Gov.br source URLs |

2026 facultatives (Portaria MGI 11.460/2025): 16–18 Feb (Carnaval/Cinzas), 20 Apr, 4–5 Jun, 28 Oct, 24–31 Dec (partial hours on Cinzas and vésperas).  
Golden vectors: `2026-04-03` (Paixão de Cristo — national), `2026-02-17` (Carnaval — facultativo).

```typescript
import {
  isFeriadoNacional,
  getFeriadosNacionais,
  getProximoDiaUtil,
  getPontosFacultativosFederais,
  FERIADOS_DATA_VERSION,
} from '@br-validators/core/feriados';
```

---

## Core API — CNAE (reference data)

> **Offline embedded data** from [IBGE CNAE API v2](https://servicodados.ibge.gov.br/api/docs/cnae).  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Function | Returns |
|----------|---------|
| `getCnaes()` | All CNAE 2.3 subclasses |
| `getCnaePorCodigo(codigo)` | Single subclass or `undefined` (7-digit code) |
| `searchCnaes(query, { limit? })` | Description search (default limit 10) |
| `CNAES_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: `6201501` (custom software development), `6201502` (web design).

```typescript
import { getCnaePorCodigo, searchCnaes, CNAES_DATA_VERSION } from '@br-validators/core/cnaes';
```

---

## Core API — CFOP (reference data)

> **Offline embedded data** from [CONFAZ CFOP SINIEF](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente).  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Function | Returns |
|----------|---------|
| `getCfops()` | All CFOP codes |
| `getCfopPorCodigo(codigo)` | Single CFOP or `undefined` (4-digit code) |
| `searchCfop(query, { limit? })` | Description search (default limit 10) |
| `CFOP_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: `1102` (purchase for resale), `5102` (third-party sale).

```typescript
import { getCfopPorCodigo, searchCfop, CFOP_DATA_VERSION } from '@br-validators/core/cfop';
```

---

## Core API — CST (reference data)

> **Offline embedded data** from [RFB SPED Fiscal — Tabelas de Situação Tributária](http://www.sped.fazenda.gov.br/spedtabelas/AppConsulta/publico/aspx/ConsultaTabelasExternas.aspx?CodSistema=SpedFiscal).  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — manual maintainer refresh (`pnpm fetch:data:cst`)

| Function | Returns |
|----------|---------|
| `getCstIcms()` | All ICMS CST codes (2-digit NF-e format) |
| `getCstIpi()` | All IPI CST codes |
| `getCstPis()` | All PIS CST codes |
| `getCstCofins()` | All COFINS CST codes |
| `getCstIcmsPorCodigo(codigo)` | Single ICMS CST or `undefined` |
| `getCstIpiPorCodigo(codigo)` | Single IPI CST or `undefined` |
| `getCstPisPorCodigo(codigo)` | Single PIS CST or `undefined` |
| `getCstCofinsPorCodigo(codigo)` | Single COFINS CST or `undefined` |
| `searchCstIcms(query, { limit? })` | ICMS description search (default limit 10) |
| `searchCstIpi(query, { limit? })` | IPI description search |
| `searchCstPis(query, { limit? })` | PIS description search |
| `searchCstCofins(query, { limit? })` | COFINS description search |
| `CST_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: ICMS `00` / `10`; IPI `50` / `00`; PIS `01` / `07`; COFINS `01` / `07`.

```typescript
import {
  getCstIcmsPorCodigo,
  getCstIpiPorCodigo,
  searchCstIcms,
  CST_DATA_VERSION,
} from '@br-validators/core/cst';
```

---

## Core API — LC 116 (reference data)

> **Offline embedded data** from [LC 116/2003 — Planalto](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm) with [NFSe republication](https://www.gov.br/nfse/pt-br/mei-e-demais-empresas/codigos-de-tributacao-nacional-nbs) fetch fallback.  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — manual maintainer refresh (`pnpm fetch:data:lc116`)

| Function | Returns |
|----------|---------|
| `getLc116List()` | All LC 116 ISS service items |
| `getLc116PorCodigo(codigo)` | Single item or `undefined` (accepts `1.01` or NFSe `010101`) |
| `searchLc116(query, { limit? })` | Description search (default limit 10) |
| `LC116_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: `1.01` (análise e desenvolvimento de sistemas), `7.02` (obras de construção civil).

```typescript
import { getLc116PorCodigo, searchLc116, LC116_DATA_VERSION } from '@br-validators/core/lc116';
```

---

## Core API — eSocial (reference data)

> **Offline embedded data** from [eSocial S-1.3 Tabela 01](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html).  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — manual maintainer refresh (`pnpm fetch:data:esocial`)

| Function | Returns |
|----------|---------|
| `getEsocialCategorias()` | All Tabela 01 worker categories |
| `getEsocialCategoriaPorCodigo(codigo)` | Single category or `undefined` (3-digit code) |
| `searchEsocialCategorias(query, { limit? })` | Search by code, grupo, or description (default limit 10) |
| `ESOCIAL_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: `101` (empregado geral), `103` (aprendiz), `901` (estagiário).

```typescript
import {
  getEsocialCategoriaPorCodigo,
  searchEsocialCategorias,
  ESOCIAL_DATA_VERSION,
} from '@br-validators/core/esocial';
```

---

## Core API — PTAX (reference data)

> **Offline embedded data** from [Bacen Olinda PTAX API](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3) — Fechamento closing rates for Bacen tipo A/B currencies in `@br-validators/core/moedas`.  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md) — daily refresh (`pnpm fetch:data:ptax`)

| Function | Returns |
|----------|---------|
| `getPtaxList()` | All embedded Fechamento PTAX rows |
| `getPtaxCotacao(moeda, data?)` | Single closing rate or `undefined` (ISO or Bacen date; omit `data` for latest) |
| `getPtaxUltimoDiaUtil(moeda)` | Latest embedded Fechamento for currency |
| `getPtaxCotacoesPorMoeda(moeda)` | All embedded days for currency, newest first |
| `PTAX_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: USD `2026-06-24` (compra `5.2092`, venda `5.2098`); USD `2026-06-23` historical; EUR último dia útil `2026-06-24`.

```typescript
import { getPtaxCotacao, getPtaxUltimoDiaUtil, PTAX_DATA_VERSION } from '@br-validators/core/ptax';

getPtaxCotacao('USD', '2026-06-24');
getPtaxUltimoDiaUtil('EUR');
```

---

## Core API — NCM (reference data)

> **Offline embedded data** from [Siscomex NCM JSON](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json).  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Function | Returns |
|----------|---------|
| `getNcms()` | All 8-digit leaf NCM codes |
| `getNcmPorCodigo(codigo)` | Single NCM or `undefined` (accepts dotted input) |
| `searchNcm(query, { limit? })` | Description search (default limit 10) |
| `NCM_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: `01012100` (purebred horses), `12011000` (soybean seeds).

```typescript
import { getNcmPorCodigo, searchNcm, NCM_DATA_VERSION } from '@br-validators/core/ncm';
```

---

## Core API — CBO (reference data)

> **Offline embedded data** from [MTE CBO 2002 CSV](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv).  
> Freshness: [DATA-FRESHNESS.md](DATA-FRESHNESS.md)

| Function | Returns |
|----------|---------|
| `getCbos()` | All CBO 2002 occupations |
| `getCboPorCodigo(codigo)` | Single occupation or `undefined` (6-digit code) |
| `searchCbo(query, { limit? })` | Description search (default limit 10) |
| `CBO_DATA_VERSION` | `DatasetMetadata` |

Golden vectors: `212405` (systems analyst), `010105` (air force general).

```typescript
import { getCboPorCodigo, searchCbo, CBO_DATA_VERSION } from '@br-validators/core/cbo';
```

---

## Core API — Data catalog (transparency)

Aggregates `DatasetMetadata` for all registered reference datasets.

| Function | Returns |
|----------|---------|
| `getDataCatalog()` | All dataset metadata entries |
| `getDatasetMetadata(id)` | Single entry or `undefined` |
| `DATA_CATALOG_VERSION` | `{ totalDatasets }` |

```typescript
import { getDataCatalog, getDatasetMetadata } from '@br-validators/core/data-catalog';
```

---

## Format pipeline (convenience)

High-level helper used by UI formatters:

```typescript
type FormattableDocumentType =
  | 'cpf' | 'cnpj' | 'cep' | 'placa' | 'pis-pasep' | 'pix' | 'boleto' | 'cartao-credito';

function formatDocument(type: FormattableDocumentType, input: string): FormatResult;
function formatDocumentRuntime(type: string, input: string): FormatResult;
function isFormattableDocumentType(type: string): type is FormattableDocumentType;
```

Per-type formatters: `formatCpf`, `formatCnpj`, `formatCep`, `formatPlaca`, `formatPisPasep`, `formatPixKey`, `formatBoleto`, `formatCartaoCredito`.

Implementation: `strip → validate → apply mask`. See [use-cases/UC-003-format-document.md](use-cases/UC-003-format-document.md).

### Consumer warning — display formatting vs backend normalization

> **Implementation guideline for app/backend integrators — not a library defect.**

`format*`, `mask()`, and `strip*` in `@br-validators/core` follow **validate-then-format** (BR-GLOBAL-002). They **do not** left-pad partial input to full document length. Incomplete CPF input (e.g. `"0"` or `"4673024133"`) returns `{ ok: false, … }` from `formatCpf` / `mask(…, 'cpf')` — never `000.000.000-00`.

A common **consumer-side** bug is mixing display formatting with backend serialization in the same helper, then calling it from `onChange`:

```typescript
// ❌ Anti-pattern — do NOT use in live input handlers
function normalizeCpf(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  return digits.length < 11 ? digits.padStart(11, '0') : digits.slice(0, 11);
}

function formatCpf(value: string): string {
  return maskDigitsOnly(normalizeCpf(value)); // padStart makes "0" → "00000000000" → "000.000.000-00"
}
```

`padStart(11, '0')` is appropriate **at submit/API boundaries** when the user already entered 9–10 digits without leading zeros (e.g. `4673024133` → `04673024133`). It is **not** appropriate while the user is still typing.

| Concern | When | Use |
|---------|------|-----|
| Live masked input | `onChange` / controlled field | Progressive UI mask (digits + punctuation only) **or** debounced `mask()` on sufficiently complete input — **no padding** |
| Canonical value for API/DB | `onSubmit` / server handler | `stripCpf(input)` or `sanitize(input, 'cpf')` after the field is complete; add explicit `padStart` only if **your** backend contract requires fixed width **and** you know the digit count is final |
| Validation feedback | blur / submit | `validateCpf(stripCpf(input))` |

**Rule:** mask/format functions must not pad partial input. Padding belongs in a separate `normalize()` / `serialize()` step at the backend boundary, not in display formatters wired to `onChange`.

The library’s `mask()` path strips non-digits and applies official punctuation only after validation succeeds — it never substitutes missing digits with zeros during typing.

---

## Platform APIs (Phases 17–19)

Cross-cutting helpers that compose existing per-type validators — **never duplicate check-digit logic**.

### `detect(raw, options?)`

Import: `@br-validators/core/detect` or barrel.

```typescript
type DetectableDocumentType =
  | 'cpf' | 'cnpj' | 'cep' | 'placa' | 'pis-pasep' | 'pix'
  | 'telefone' | 'boleto' | 'cartao-credito' | 'cnh' | 'renavam'
  | 'nfe-chave' | 'titulo-eleitor' | 'inscricao-estadual'
  | 'inscricao-estadual-produtor-rural' | 'brcode' | 'unknown';

type DetectOptions = { uf?: UfCode };

type DetectResult =
  | { type: DetectableDocumentType; ok: true; value: string; format?: DocumentFormat; meta?: Record<string, unknown> }
  | { type: DetectableDocumentType; ok: false; code: ValidationErrorCode; message: string };

function detect(raw: string, options?: DetectOptions): DetectResult;
```

**Priority router (first structural match + `validate*` success wins):** boleto arrecadação (48-digit `8…`) → boleto cobrança → NF-e chave → BR Code → CNPJ alphanumeric → CNPJ numeric → 11-digit bucket (CPF → CNH → PIS) → título eleitor (12 digits) → CEP → placa → PIX → telefone → cartão → IE (only when `options.uf` set).

**11-digit note:** PIS and RENAVAM share equivalent modulo-11 math; valid RENAVAM values that also pass PIS validation are classified as `pis-pasep`.

```typescript
import { detect } from '@br-validators/core/detect';

detect('123.456.789-09');
// → { type: 'cpf', ok: true, value: '12345678909', format: 'numeric' }

detect('P123456789012', { uf: 'SP' });
// → { type: 'inscricao-estadual-produtor-rural', ok: true, ... }
```

### `sanitize(raw, type, options?)`

Import: `@br-validators/core/sanitize` or barrel.

```typescript
type SanitizableDocumentType =
  | 'cpf' | 'cnpj' | 'cep' | 'placa' | 'pis-pasep' | 'telefone'
  | 'cnh' | 'renavam' | 'titulo-eleitor' | 'nfe-chave' | 'boleto'
  | 'cartao-credito' | 'inscricao-estadual' | 'inscricao-estadual-produtor-rural';

type SanitizeOptions = { uf?: UfCode };

type SanitizeResult =
  | { ok: true; value: string; fixes: string[] }
  | { ok: false; code: ValidationErrorCode; message: string };

function sanitize(raw: string, type: SanitizableDocumentType, options?: SanitizeOptions): SanitizeResult;
```

Applies ETL fixes (`trimmed`, `removed_non_digits`, `uppercased`, telefone national normalization, etc.) then runs the matching `validate*`. **Unlike `strip*`**, always validates — never bypasses check digits. `inscricao-estadual` requires `options.uf`.

```typescript
import { sanitize } from '@br-validators/core/sanitize';

sanitize(' 123.456.789-09 ', 'cpf');
// → { ok: true, value: '12345678909', fixes: ['trimmed', 'removed_non_digits'] }
```

### `mask(raw, type, options?)`

Import: `@br-validators/core/mask` or barrel.

Unified display mask — delegates to per-type `format*` functions. **Never throws** — same `FormatResult` as `formatCpf`, `formatTelefone`, etc. Official mask rules per type: [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).

```typescript
type MaskableDocumentType =
  | 'cpf' | 'cnpj' | 'cep' | 'placa' | 'pis-pasep' | 'telefone'
  | 'cnh' | 'renavam' | 'titulo-eleitor' | 'nfe-chave' | 'boleto'
  | 'cartao-credito' | 'inscricao-estadual' | 'inscricao-estadual-produtor-rural'
  | 'pix';

type MaskOptions = { uf?: UfCode };

function mask(raw: string, type: MaskableDocumentType, options?: MaskOptions): FormatResult;
function maskRuntime(type: string, raw: string, options?: MaskOptions): FormatResult;
function isMaskableDocumentType(type: string): type is MaskableDocumentType;
```

Invalid input returns `{ ok: false, code, message }` — **no partial mask** (BR-GLOBAL-002). See [Consumer warning — display formatting vs backend normalization](#consumer-warning--display-formatting-vs-backend-normalization) — do not pad partial input in app-level `onChange` helpers.

| Type | Official source | Mask example |
|------|-----------------|--------------|
| `cpf` | [RFB CPF](https://www.gov.br/receitafederal/pt-br/assuntos/cpf) | `123.456.789-09` |
| `cnpj` | [RFB CNPJ alfanumérico FAQ](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf) | `12.ABC.345/01DE-35` |
| `cep` | [Correios API Busca CEP](https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep) | `01310-100` |
| `telefone` | [Anatel Plano de Numeração](https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro) | `(11) 99999-9999` |
| `cnh` | [CONTRAN 511/2014](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf) | 11 contiguous digits |
| `renavam` | [Portaria DENATRAN 27/2013](https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf) | 11 contiguous digits |
| `titulo-eleitor` | [TSE Res. 20.132/1998](https://www.tse.jus.br/legislacao/compilada/res/1998/resolucao-no-20-132-de-19-de-marco-de-1998) | `0043 5687 0906` |
| `nfe-chave` | [Portal NF-e MOC](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D) | 11 groups of 4 digits |
| `boleto` | [FEBRABAN FB-0061/2021](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf) | FEBRABAN linha digitável |
| `cartao-credito` | [ISO/IEC 7812-1:2017](https://www.iso.org/standard/70484.html) | Grouped PAN |
| `pis-pasep` | [SIPREV RV_03](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) | `100.27230.88-8` |
| `pix` | [Bacen DICT API v2.9](https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html) | Per key type (CPF/CNPJ mask, `+55…` phone) |
| `inscricao-estadual` | Per-UF SEFAZ — `getIeOfficialSourceUrl(uf)` | SP/DF display masks |
| `inscricao-estadual-produtor-rural` | [SEFAZ-SP cad_SP](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html) | `P-01100424.3/002` |
| `placa` | [CONTRAN 729/2018](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf) | Canonical uppercase (no decorative mask) |

```typescript
import { mask } from '@br-validators/core/mask';

mask('12345678909', 'cpf');
// → { ok: true, formatted: '123.456.789-09' }

mask('11999999999', 'telefone');
// → { ok: true, formatted: '(11) 99999-9999' }
```

Implementation: `strip → validate → apply mask` via existing `format*`. See [use-cases/UC-003-format-document.md](use-cases/UC-003-format-document.md).

### `compare(a, b, type, options?)`

Import: `@br-validators/core/compare` or barrel.

Normalized equality — strips and, when possible, canonicalizes via the matching `validate*` before comparing. **Never throws.**

```typescript
type PlatformDocumentType = SanitizableDocumentType | 'pix' | 'brcode';

type CompareResult = { equal: boolean };

function compare(a: string, b: string, type: PlatformDocumentType, options?: PlatformOptions): CompareResult;
function compareRuntime(a: string, b: string, type: string, options?: PlatformOptions): CompareResult | { equal: false; code: 'UNSUPPORTED_FORMAT'; message: string };
```

`inscricao-estadual` requires `options.uf`. Official normalization rules per type: [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).

```typescript
import { compare } from '@br-validators/core/compare';

compare('123.456.789-09', '12345678909', 'cpf');
// → { equal: true }
```

### `batch(inputs, type, options?)`

Import: `@br-validators/core/batch` or barrel.

Maps each row through `validateForPlatform` — **never throws** on invalid rows.

```typescript
type BatchResult = {
  valid: Array<{ index: number; input: string; value: string }>;
  invalid: Array<{ index: number; input: string; code: ValidationErrorCode; message: string }>;
  summary: { total: number; valid: number; invalid: number };
};

function batch(inputs: readonly string[], type: PlatformDocumentType, options?: PlatformOptions): BatchResult;
```

Per-type validation delegates to official `validate*` helpers — [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).

```typescript
import { batch } from '@br-validators/core/batch';

batch(['12345678909', 'bad'], 'cpf');
// → { valid: [{ index: 0, input: '...', value: '12345678909' }], invalid: [...], summary: { total: 2, valid: 1, invalid: 1 } }
```

### `diff(a, b, type, options?)`

Import: `@br-validators/core/diff` or barrel.

Field-level structural diff after normalization. Returns `{ changed, fields: [{ field, a, b }] }`.

| Type | Fields compared |
|------|-----------------|
| `cpf` | `base` (9), `dv` (2) |
| `cnpj` | `base` (12), `dv` (2) |
| `cep` | `prefix` (5), `suffix` (3) |
| `telefone` | `ddd`, `subscriber` |
| `pis-pasep` | `base`, `dv` |
| `cnh` | `base`, `dv1`, `dv2` |
| `renavam` | `base`, `dv` |
| `titulo-eleitor` | `sequential`, `uf`, `dv` |
| `nfe-chave` | `cUF`, `aamm`, `cnpj`, `mod`, `serie`, `nNF`, `tpEmis`, `cNF`, `cDV` |
| opaque types | single `value` (`boleto`, `pix`, `brcode`, `placa`, `cartao-credito`, IE variants) |

```typescript
import { diff } from '@br-validators/core/diff';

diff('12345678909', '12345678901', 'cpf');
// → { changed: true, fields: [{ field: 'dv', a: '09', b: '01' }] }
```

Field splits follow the same official document structures cited in [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).

### `generate(type, options?)`

Import: `@br-validators/core/generate` or barrel.

**Synthetic test fixtures only** — not for production IDs or impersonation.

```typescript
type GeneratableDocumentType =
  | 'cpf' | 'cnpj' | 'cep' | 'placa' | 'pis-pasep'
  | 'renavam' | 'cnh' | 'telefone' | 'cartao-credito'
  | 'inscricao-estadual' | 'titulo-eleitor'
  | 'pix' | 'nfe-chave' | 'brcode' | 'boleto'
  | 'boleto-arrecadacao' | 'inscricao-estadual-produtor-rural';

type GenerateOptions = {
  format?: 'numeric' | 'alphanumeric' | 'legacy' | 'mercosul' | 'celular' | 'fixo';
  masked?: boolean;
  seed?: number;
  uf?: UfCode;
  brand?: 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard';
  pixKey?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: string;
  txid?: string;
};

function generate(type: GeneratableDocumentType, options?: GenerateOptions): string;
```

Uses Mulberry32 when `seed` is set; reuses official DV helpers per type. See [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md) for normative references. Alphanumeric CPF generation returns `CPF_ALPHA_SPEC_PENDING` until RFB publishes spec.

```typescript
import { generate } from '@br-validators/core/generate';
import { validateCpf } from '@br-validators/core/cpf';
import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';

const cpf = generate('cpf', { seed: 42 });
validateCpf(cpf).ok; // true

const ie = generate('inscricao-estadual', { uf: 'SP', seed: 42, masked: true });
validateInscricaoEstadual(ie, { uf: 'SP' }).ok; // true

const titulo = generate('titulo-eleitor', { uf: 'SC', seed: 42 });
validateTituloEleitor(titulo).ok; // true

const card = generate('cartao-credito', { brand: 'mastercard', seed: 42 });
validateCartaoCredito(card).ok; // true
```

### CLI mirror (platform)

```bash
br-validators detect [value] [--uf SP] [--json] [--quiet] [--file]
br-validators sanitize <type> [value] [--uf SP] [--json] [--quiet] [--file]
br-validators generate <type> [--masked] [--format mercosul] [--seed 42] [--uf SP] [--brand visa] [--json] [--quiet]
```

---

## Error messages

- Human-readable `message` is for UI display (English in library; i18n layer is consumer responsibility).
- Programmatic handling MUST use `code`, not string matching on `message`.

---

## Versioning

Follows [Semantic Versioning 2.0.0](https://semver.org/). Full policy: **[VERSIONING.md](VERSIONING.md)**.

Summary:

| Bump | When |
|------|------|
| **MAJOR** | Breaking public API or behavior change on previously valid input |
| **MINOR** | New validator module or backward-compatible export |
| **PATCH** | Bug fix; official spec alignment without API break |

Pre-1.0 releases use `0.x.y` (alpha from `0.1.0-alpha`). Changelog: [CHANGELOG.md](../CHANGELOG.md).

Security-related validation fixes are **patch** releases — see [SECURITY.md](../SECURITY.md).

---

## Out of scope for public API

- HTTP clients (Correios, RFB) — separate `@br-validators/adapters` package
- Database migrations or ORM types
- React/Vue input components — separate optional UI package
