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
| `@br-validators/core/brcode` | BR Code PIX QR payload (EMV TLV + CRC16) |
| `@br-validators/core/placa` | License plates |
| `@br-validators/core/pis-pasep` | PIS / PASEP / NIS / NIT |
| `@br-validators/core/pix` | PIX keys |
| `@br-validators/core/boleto` | Boleto (linha digitável + código de barras) |
| `@br-validators/core/cartao-credito` | Credit card PAN (Luhn / ISO 7812) |
| `@br-validators/core/inscricao-estadual` | Inscrição Estadual — all 27 UFs |

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

**Official source:** [Correios CEP API manual](https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep) · `CEP_OFFICIAL_SOURCE_URL` · `tests/vectors/cep.official.json` · Golden: `01310100`, `20040020`

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

## Core API — BR Code

| Function | Signature | Description |
|----------|-----------|-------------|
| `parseBrCode` | `(input: string) => BrCodeValidationResult` | Parse EMV TLV payload; extract merchant, amount, txid, PIX key or initiation URL |
| `validateBrCode` | `(input: string) => BrCodeValidationResult` | Same as `parseBrCode` but requires static PIX key (subfield 01) |
| `isValidBrCode` | `(input: string) => boolean` | Convenience wrapper over `validateBrCode` |
| `verifyBrCodeCrc` | `(payload: string) => { ok: true } \| { ok: false; message: string }` | CRC16-CCITT check (tag 63) |
| `parseBrCodePayload` | `(input: string) => BrCodeParseResult` | Lower-level parse (no branded result wrapper) |

**Success result:** `{ ok: true, value: BrCodePayload, format: 'brcode', merchantName, merchantCity, pixKey?, pixKeyType?, amount?, txid?, pixInitiationUrl? }`

**Official source:** [Bacen Manual BR Code (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf) · [Manual de Padrões para Iniciação do Pix (PDF)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf) · `BRCODE_OFFICIAL_SOURCE_URL` · `tests/vectors/brcode.official.json` · Golden static EVP payload in `BRCODE_GOLDEN_STATIC_EVP`

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
| `validateBoleto` | `(input: string, options?: ValidateBoletoOptions) => BoletoValidationResult` | Auto-detect + validate |
| `validateLinhaDigitavel` | `(input: string) => BoletoValidationResult` | 47 digits, modulo 10 field DVs |
| `validateCodigoBarras` | `(input: string) => BoletoValidationResult` | 44 digits, modulo 11 barcode DV |
| `validateFatorVencimento` | `(factor: string) => FatorVencimentoValidationResult` | Optional semantic (Situação 1) |
| `validateValorDocumento` | `(value: string) => ValorDocumentoValidationResult` | Optional semantic (Situação 1) |
| `convertLinhaToCodigoBarras` | `(input: string) => BoletoValidationResult` | Validate linha → return barcode |
| `convertCodigoBarrasToLinhaDigitavel` | `(input: string) => BoletoValidationResult` | Validate barcode → return linha |
| `stripLinhaDigitavel` | `(input: string) => string` | Remove non-digits |
| `formatLinhaDigitavel` | `(stripped47: string) => string` | Masked display format |
| `isValidBoleto` | `(input: string, options?) => boolean` | Boolean wrapper |

```typescript
type BoletoInputKind = 'linha-digitavel' | 'codigo-barras';

type BoletoValidationResult =
  | { ok: true; value: LinhaDigitavel | CodigoBarras; inputKind: BoletoInputKind; format: DocumentFormat; situacao: '1' | '2' }
  | { ok: false; code: ValidationErrorCode; message: string; inputKind?: BoletoInputKind };

type ValidateBoletoOptions = {
  kind?: BoletoInputKind;
  validateDueFactor?: boolean;
  validateAmount?: boolean;
};
```

Golden vectors: Santander Situação 1 linha ↔ barcode; Situação 2 pair in `tests/vectors/boleto.situacao2.official.json`.

**Official source:** [FEBRABAN Convenção da Cobrança FB-0061/2021 (PDF)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Conven%C3%A7%C3%A3o%20da%20Cobran%C3%A7a%20-%2005_02_2021_f.pdf) · `BOLETO_OFFICIAL_SOURCE_URL` · `tests/vectors/boleto.official.json`

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
