# Validation business rules

> Format: GIVEN / WHEN / THEN. Referenced by use cases and unit tests.
> Rule IDs are stable — cite in commits and test descriptions.

---

## CPF

### BR-CPF-001 — Length

- **GIVEN** stripped input
- **WHEN** length ≠ 11
- **THEN** reject with `INVALID_LENGTH`

### BR-CPF-002 — Numeric only

- **GIVEN** stripped input
- **WHEN** contains non-digit characters
- **THEN** reject with `INVALID_CHARACTER`

### BR-CPF-003 — Known invalid sequence

- **GIVEN** all 11 digits are identical (e.g. `11111111111`)
- **WHEN** validating
- **THEN** reject with `KNOWN_INVALID_PATTERN`

### BR-CPF-004 — Check digits

- **GIVEN** first 9 digits
- **WHEN** modulo-11 check digits do not match positions 10 and 11
- **THEN** reject with `INVALID_CHECK_DIGIT`

### BR-CPF-005 — Format mask

- **GIVEN** valid canonical 11-digit CPF
- **WHEN** formatting
- **THEN** output `XXX.XXX.XXX-DD`

---

## CNPJ numeric

### BR-CNPJ-N-001 — Length

- **GIVEN** stripped input
- **WHEN** length ≠ 14 or contains non-digits
- **THEN** reject appropriately

### BR-CNPJ-N-002 — Known invalid sequence

- **GIVEN** all 14 digits identical
- **WHEN** validating
- **THEN** reject with `KNOWN_INVALID_PATTERN`

### BR-CNPJ-N-003 — Check digits

- **GIVEN** first 12 digits
- **WHEN** modulo-11 DV1/DV2 fail
- **THEN** reject with `INVALID_CHECK_DIGIT`

---

## CNPJ alphanumeric

### BR-CNPJ-A-001 — Structure

- **GIVEN** stripped uppercase input
- **WHEN** does not match `^[A-Z0-9]{12}[0-9]{2}$`
- **THEN** reject with `INVALID_LENGTH` or `INVALID_CHARACTER`

### BR-CNPJ-A-002 — Character value

- **GIVEN** each base character
- **WHEN** computing check digit
- **THEN** use `charCodeAt(0) - 48` (not digit-only parsing)

### BR-CNPJ-A-003 — Weights

- **GIVEN** DV1 calculation
- **WHEN** applying weights
- **THEN** use `[5,4,3,2,9,8,7,6,5,4,3,2]` on 12 base chars

- **GIVEN** DV2 calculation
- **WHEN** applying weights
- **THEN** use `[6,5,4,3,2,9,8,7,6,5,4,3,2]` on 13 chars (base + DV1)

### BR-CNPJ-A-004 — Remainder mapping

- **GIVEN** `sum % 11`
- **WHEN** remainder < 2
- **THEN** check digit = 0; else check digit = 11 - remainder

### BR-CNPJ-A-005 — Union validator

- **GIVEN** arbitrary CNPJ input
- **WHEN** calling `isValidCnpj`
- **THEN** succeed if **either** numeric **or** alphanumeric path validates

### BR-CNPJ-A-006 — Storage type advisory

- **GIVEN** consumer persists CNPJ
- **WHEN** choosing column type
- **THEN** documentation requires string type (14 chars) — never integer

---

## CEP

### BR-CEP-001 — Length and digits

- **GIVEN** stripped input
- **WHEN** length ≠ 8 or non-digits present
- **THEN** reject

### BR-CEP-002 — No check digit

- **GIVEN** valid 8-digit CEP
- **WHEN** validating
- **THEN** structural validation only — no DV algorithm

---

## Placa

### BR-PLACA-001 — Legacy format

- **GIVEN** uppercase stripped input
- **WHEN** matches `^[A-Z]{3}[0-9]{4}$`
- **THEN** accept as legacy

### BR-PLACA-002 — Mercosul format

- **GIVEN** uppercase stripped input
- **WHEN** matches `^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$`
- **THEN** accept as Mercosul

### BR-PLACA-003 — Union

- **GIVEN** input
- **WHEN** either legacy or Mercosul valid
- **THEN** `isValidPlaca` returns true

---

## PIS / PASEP

### BR-PIS-001 — Length

- **GIVEN** stripped input
- **WHEN** length ≠ 11
- **THEN** reject with `INVALID_LENGTH`

### BR-PIS-002 — Numeric only

- **GIVEN** stripped input
- **WHEN** contains non-digit characters
- **THEN** reject with `INVALID_CHARACTER`

### BR-PIS-003 — Known invalid sequence

- **GIVEN** all 11 digits are identical (e.g. `11111111111`)
- **WHEN** validating
- **THEN** reject with `KNOWN_INVALID_PATTERN`

### BR-PIS-004 — Check digit

- **GIVEN** first 10 digits
- **WHEN** modulo-11 check digit does not match position 11
- **THEN** reject with `INVALID_CHECK_DIGIT`

### BR-PIS-005 — Weights

- **GIVEN** DV calculation on base digits
- **WHEN** applying weights
- **THEN** use `[3,2,9,8,7,6,5,4,3,2]` on first 10 digits

### BR-PIS-006 — Format mask

- **GIVEN** valid canonical 11-digit PIS/PASEP
- **WHEN** formatting
- **THEN** output `XXX.XXXXX.XX-X`

---

## PIX key

### BR-PIX-001 — Type detection

- **GIVEN** input string
- **WHEN** detecting type
- **THEN** classify as cpf | cnpj | email | phone | evp | unknown

### BR-PIX-002 — Delegate validation

- **GIVEN** detected type cpf or cnpj
- **WHEN** validating
- **THEN** delegate to respective validator (CNPJ dual-format)

### BR-PIX-003 — Phone format

- **GIVEN** phone key
- **WHEN** validating
- **THEN** require E.164 with country code +55 per Bacen

### BR-PIX-004 — EVP format

- **GIVEN** random key (EVP)
- **WHEN** validating
- **THEN** require UUID format per Bacen

### BR-PIX-005 — Email format

- **GIVEN** email PIX key
- **WHEN** validating
- **THEN** require DICT regex, max 77 chars, lowercase only

### BR-PIX-006 — Detection precedence

- **GIVEN** arbitrary input
- **WHEN** detecting type
- **THEN** apply order: `@` → email; `+` → phone; UUID → evp; 11 digits → cpf; CNPJ pattern → cnpj

### BR-PIX-007 — Strict type option

- **GIVEN** forced `type` option
- **WHEN** detected type differs from forced type
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-PIX-008 — CNPJ alphanumeric keys

- **GIVEN** CNPJ-shaped PIX key with letters
- **WHEN** validating
- **THEN** delegate to alphanumeric CNPJ validator (RFB Q14)

---

## Boleto (cobrança bancária)

### BR-BOLETO-001 — Input kind detection

- **GIVEN** trimmed input
- **WHEN** detecting kind
- **THEN** classify as `linha-digitavel` (47 digits), `codigo-barras` (44 digits), or `unknown`

### BR-BOLETO-002 — Linha field DVs

- **GIVEN** 47-digit linha digitável
- **WHEN** validating fields 1–3
- **THEN** each field DV must match modulo 10 (Anexo IX)

### BR-BOLETO-003 — Barcode general DV

- **GIVEN** 44-digit código de barras
- **WHEN** validating position 5
- **THEN** DV must match modulo 11 (Anexo X); never `0`

### BR-BOLETO-004 — Currency code

- **GIVEN** bank boleto input (Situação 1)
- **WHEN** position 4 (currency) ≠ `9`
- **THEN** reject with `UNSUPPORTED_FORMAT`
- **GIVEN** ISPB holder input (Situação 2, code `988`)
- **WHEN** position 4 ≠ `0`
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-BOLETO-005 — Field 4 consistency

- **GIVEN** valid linha digitável
- **WHEN** field 4 DV checked
- **THEN** must match modulo 11 of converted barcode

### BR-BOLETO-006 — Conversion

- **GIVEN** valid linha or barcode
- **WHEN** converting counterpart
- **THEN** apply Anexo V §2.3.4 mapping losslessly (Situação 1 and 2 share field permutation)

### BR-BOLETO-007 — Strict kind option

- **GIVEN** forced `kind` option
- **WHEN** detected kind differs
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-BOLETO-008 — Masked linha

- **GIVEN** linha with dots/spaces
- **WHEN** validating
- **THEN** strip non-digits before structural checks

### BR-BOLETO-009 — Arrecadação out of scope

- **GIVEN** 48-digit input starting with `8`
- **WHEN** validating in v1
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-BOLETO-010 — Barcode DV edge cases

- **GIVEN** modulo 11 result 0, 10, or 11
- **WHEN** computing barcode DV
- **THEN** use DV `1`

### BR-BOLETO-011 — Situação 1 scope (v1) / Situação 2 (5b)

- **GIVEN** código `988` with currency indicator `0`
- **WHEN** validating linha or barcode
- **THEN** classify as Situação 2; campo 5 linha = ISPB (14 digits)
- **GIVEN** standard bank code with currency `9`
- **WHEN** validating
- **THEN** classify as Situação 1; campo 5 = fator + valor

### BR-BOLETO-012 — Optional fator vencimento

- **GIVEN** `validateDueFactor: true` on Situação 1 input
- **WHEN** factor is `0000`
- **THEN** accept (no due date)
- **WHEN** factor is `0001`–`9997`
- **THEN** accept
- **WHEN** factor is outside range
- **THEN** reject with `UNSUPPORTED_FORMAT`

### BR-BOLETO-013 — Optional document amount

- **GIVEN** `validateAmount: true` on Situação 1 input
- **WHEN** amount field is 10-digit centavos
- **THEN** accept (including `0000000000`)

---

## Inscrição Estadual (IE)

> **All 27 UFs shipped** (`0.10.0-alpha.0`). Full index: [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md).  
> **Official sources:** [OFFICIAL-SOURCES.md § IE](OFFICIAL-SOURCES.md#inscrição-estadual-ie--all-27-ufs).  
> **UF required** in API (`validateInscricaoEstadual(input, { uf })`).

### BR-IE-001 — UF required

- **GIVEN** IE validation without `uf` option
- **WHEN** calling `validateInscricaoEstadual`
- **THEN** reject with `UNSUPPORTED_FORMAT` (UF is mandatory per LIBRARY-API)

### BR-IE-SP-001 — São Paulo (12 digits)

- **GIVEN** stripped IE for UF `SP`
- **WHEN** length ≠ 12 or DVs fail SEFAZ modulo-11 weights
- **THEN** reject with `INVALID_LENGTH` or `INVALID_CHECK_DIGIT`
- **Source:** [SEFAZ-SP Sintegra rotina](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) (2012-01-05); mirror [SINTEGRA cad_SP](http://www.sintegra.gov.br/Cad_Estados/cad_SP.html)
- **Golden:** `110042490114` — `tests/vectors/ie.sp.official.json`

### BR-IE-MT-001 — Mato Grosso (9 or 11 digits)

- **GIVEN** IE for UF `MT`
- **WHEN** validating canonical 9-digit `13XXXXXXD` or legacy 11-digit zero-padded SINTEGRA form
- **THEN** apply weights `3,2,9,8,7,6,5,4,3,2` on first 10 active digits; modulo-11 DV per SINTEGRA cad_MT
- **Source:** [SEFAZ-MT Portaria Art. 6º](https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=); mirror [SINTEGRA cad_MT](http://www.sintegra.gov.br/Cad_Estados/cad_MT.html)
- **Golden:** `130000019` (canonical), `00130000019` (legacy) — `tests/vectors/ie.mt.official.json`

### BR-IE-DF-001 — Distrito Federal (13 digits)

- **GIVEN** IE for UF `DF` starting with `07`
- **WHEN** length ≠ 13 or dual DVs fail
- **THEN** reject; apply weights per SINTEGRA cad_DF
- **Source:** [Receita Fazenda DF](https://www.receita.fazenda.df.gov.br/) + CF/DF Decreto 18.955/1997; mirror [SINTEGRA cad_DF](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html)
- **Golden:** `0730000100109` — `tests/vectors/ie.df.official.json`

### BR-IE-DF-002 — Legacy 12-digit rejection

- **GIVEN** 12-digit DF input from legacy SINTEGRA validators
- **WHEN** validating against CF/DF 13-digit rules
- **THEN** reject with `INVALID_LENGTH` (13-digit CF/DF rule only; no legacy 12-digit mode)
- **Source:** [SINTEGRA cad_DF](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html) (legacy 12-digit note vs current 13-digit CF/DF)

### Per-UF rules (AC–TO)

Each row maps to `validateIe{Uf}` and `BR-IE-{UF}-001`. Algorithm detail: [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md).

| UF | Rule | Golden | Primary source | Mirror |
|----|------|--------|----------------|--------|
| AC | BR-IE-AC-001 | `0113253877910` | [SEFAZ-AC](https://sefaz.ac.gov.br/) | [cad_AC](http://www.sintegra.gov.br/Cad_Estados/cad_AC.html) |
| AL | BR-IE-AL-001 | `248682954` | [SEFAZ-AL cálculo](https://www.sefaz.al.gov.br/calculo) | [cad_AL](http://www.sintegra.gov.br/Cad_Estados/cad_AL.html) |
| AM | BR-IE-AM-001 | `917050150` | [SEFAZ-AM](https://www.sefaz.am.gov.br/) | [cad_AM](http://www.sintegra.gov.br/Cad_Estados/cad_AM.html) |
| AP | BR-IE-AP-001 | `039045820` | [SEFAZ-AP](https://www.sefaz.ap.gov.br/) | [cad_AP](http://www.sintegra.gov.br/Cad_Estados/cad_AP.html) |
| BA | BR-IE-BA-001 | `63984300` | [SEFAZ-BA cálculo DV](https://www.sefaz.ba.gov.br/inspetoria-eletronica/icms/cadastro/calculo-dv/) | [cad_BA](http://www.sintegra.gov.br/Cad_Estados/cad_BA.html) |
| CE | BR-IE-CE-001 | `836182316` | [SEFAZ-CE](https://www.sefaz.ce.gov.br/) | [cad_CE](http://www.sintegra.gov.br/Cad_Estados/cad_CE.html) |
| ES | BR-IE-ES-001 | `463921810` | [SEFAZ-ES](https://sitenet.es.gov.br/sefaz/) | [cad_ES](http://www.sintegra.gov.br/Cad_Estados/cad_ES.html) |
| GO | BR-IE-GO-001 | `112237118` | [CCE-GO](http://www.sefaz.go.gov.br/ServicosAFA/ece.html) | [cad_GO](http://www.sintegra.gov.br/Cad_Estados/cad_GO.html) |
| MA | BR-IE-MA-001 | `123517680` | [SEFAZ-MA](https://www.sefaz.ma.gov.br/) | [cad_MA](http://www.sintegra.gov.br/Cad_Estados/cad_MA.html) |
| MG | BR-IE-MG-001 | `2490944173923` | [SEF/MG cadastro](https://www.fazenda.mg.gov.br/empresas/Cadastro/cadastro/consultapublica.html) | [cad_MG](http://www.sintegra.gov.br/Cad_Estados/cad_MG.html) |
| MS | BR-IE-MS-001 | `282570926` | [SEFAZ-MS](https://www.sefaz.ms.gov.br/) | [cad_MS](http://www.sintegra.gov.br/Cad_Estados/cad_MS.html) |
| PA | BR-IE-PA-001 | `153662476` | [SEFA-PA](https://www.sefa.pa.gov.br/) | [cad_PA](http://www.sintegra.gov.br/Cad_Estados/cad_PA.html) |
| PB | BR-IE-PB-001 | `312029063` | [Receita PB](https://www.receita.pb.gov.br/) | [cad_PB](http://www.sintegra.gov.br/Cad_Estados/cad_PB.html) |
| PE | BR-IE-PE-001 | `064970639` | [SEFAZ-PE](https://www.sefaz.pe.gov.br/) | [cad_PE](http://www.sintegra.gov.br/Cad_Estados/cad_PE.html) |
| PI | BR-IE-PI-001 | `465180426` | [SEFAZ-PI](https://www.sefaz.pi.gov.br/) | [cad_PI](http://www.sintegra.gov.br/Cad_Estados/cad_PI.html) |
| PR | BR-IE-PR-001 | `0031595584` | [Fazenda PR cálculo DV](https://www.fazenda.pr.gov.br/Pagina/calculo-digito-verificador) | [cad_PR](http://www.sintegra.gov.br/Cad_Estados/cad_PR.html) |
| RJ | BR-IE-RJ-001 | `06540481` | [Portal Fazenda RJ](https://portal.fazenda.rj.gov.br/cadastro/) | [cad_RJ](http://www.sintegra.gov.br/Cad_Estados/cad_RJ.html) |
| RN | BR-IE-RN-001 | `204502292` | [SET-RN](https://www.set.rn.gov.br/) | [cad_RN](http://www.sintegra.gov.br/Cad_Estados/cad_RN.html) |
| RO | BR-IE-RO-001 | `39206839474860` | [SEFIN-RO](https://www.sefin.ro.gov.br/) | [cad_RO](http://www.sintegra.gov.br/Cad_Estados/cad_RO.html) |
| RR | BR-IE-RR-001 | `247681047` | [SEFAZ-RR](https://www.sefaz.rr.gov.br/) | [cad_RR](http://www.sintegra.gov.br/Cad_Estados/cad_RR.html) |
| RS | BR-IE-RS-001 | `3288345503` | [SEFAZ-RS](https://www.sefaz.rs.gov.br/) | [cad_RS](http://www.sintegra.gov.br/Cad_Estados/cad_RS.html) |
| SC | BR-IE-SC-001 | `632480718` | [SAT/SEF-SC](https://sat.sef.sc.gov.br/) | [cad_SC](http://www.sintegra.gov.br/Cad_Estados/cad_SC.html) |
| SE | BR-IE-SE-001 | `826594042` | [SEFAZ-SE](https://www.sefaz.se.gov.br/) | [cad_SE](http://www.sintegra.gov.br/Cad_Estados/cad_SE.html) |
| TO | BR-IE-TO-001 | `27035910938` | [SEFAZ-TO](https://www.sefaz.to.gov.br/) | [cad_TO](http://www.sintegra.gov.br/Cad_Estados/cad_TO.html) |

**GIVEN** stripped IE for the UF above  
**WHEN** length, prefix, or check digits fail the cited SEFAZ/SINTEGRA roteiro  
**THEN** reject with `INVALID_LENGTH`, `INVALID_CHECK_DIGIT`, or `UNSUPPORTED_FORMAT`  
**Vector:** `tests/vectors/ie.{uf}.official.json`

---

## Credit card (Luhn / ISO/IEC 7812-1)

### BR-LUHN-001 — Strip to digits

- **GIVEN** masked PAN with spaces or hyphens
- **WHEN** stripping
- **THEN** remove all non-digit characters

### BR-LUHN-002 — PAN length

- **GIVEN** stripped PAN
- **WHEN** validating
- **THEN** accept length 8–19 inclusive; reject otherwise with `INVALID_LENGTH`

### BR-LUHN-003 — Luhn checksum

- **GIVEN** stripped PAN within length bounds
- **WHEN** validating
- **THEN** apply ISO/IEC 7812-1 Annex B modulus-10 from rightmost digit; valid iff sum mod 10 = 0
- **Golden:** `79927398713` pass; `79927398710` fail

### BR-LUHN-004 — Reject all-same-digit

- **GIVEN** PAN where every digit is identical
- **WHEN** validating
- **THEN** reject with `KNOWN_INVALID_PATTERN` even if Luhn passes

### BR-LUHN-005 — Brand detection (best-effort)

- **GIVEN** stripped PAN
- **WHEN** detecting brand
- **THEN** return `visa` | `mastercard` | `amex` | `elo` | `hipercard` | `unknown` from IIN prefix heuristics (non-authoritative)

### BR-LUHN-006 — Invalid characters

- **GIVEN** input with letters after removing spaces/hyphens
- **WHEN** validating
- **THEN** reject with `INVALID_CHARACTER`

### BR-LUHN-007 — Display mask

- **GIVEN** valid 16-digit PAN
- **WHEN** formatting
- **THEN** group as `XXXX XXXX XXXX XXXX`
- **GIVEN** valid 15-digit Amex PAN
- **WHEN** formatting
- **THEN** group as `XXXX XXXXXX XXXXX`

### BR-LUHN-008 — Boolean Luhn wrapper

- **GIVEN** any input
- **WHEN** calling `isValidLuhn`
- **THEN** strip → length check → character check → Luhn; return boolean without branded type

---

## Global pipeline rules

### BR-GLOBAL-001 — Strip before validate

- **GIVEN** any masked input
- **WHEN** validating or formatting
- **THEN** strip/normalize first

### BR-GLOBAL-002 — Validate before format

- **GIVEN** format request
- **WHEN** validation fails
- **THEN** return error — do not partial-mask invalid input

### BR-GLOBAL-003 — No silent correction

- **GIVEN** invalid check digit
- **WHEN** any operation
- **THEN** never auto-correct or suggest “fixed” digit in core library

### BR-GLOBAL-004 — Official source required

- **GIVEN** new validator module
- **WHEN** opening PR
- **THEN** must cite entry in OFFICIAL-SOURCES.md and include golden vector
