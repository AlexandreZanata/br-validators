# Domain glossary — BR Validators

> Ubiquitous language for this project. Code, APIs, docs, and agents MUST use these terms exactly.

---

## BR Validators

**Definition:** The open-source library that formats and validates Brazilian document identifiers.
**Not the same as:** A web API, SaaS verification service, or government integration.
**Code name:** `br-validators` (package name TBD)

---

## Validator

**Definition:** A pure function that checks whether input conforms to official structure and check-digit rules.
**Not the same as:** Formatter (mask only) or online lookup (external API).
**Code name:** `isValid*`, `validate*`

---

## Formatter

**Definition:** A function that applies the official display mask to a **already valid** canonical value.
**Not the same as:** Validator — formatting never runs on unvalidated input in the public pipeline.
**Code name:** `format*`

---

## Strip / Normalize

**Definition:** Remove punctuation, whitespace, and apply case rules before validation.
**CPF/CNPJ numeric:** digits only. **CNPJ alphanumeric / placa:** preserve `A-Z0-9`, uppercase.
**Code name:** `strip*`

---

## Check digit (Dígito verificador)

**Definition:** Trailing digit(s) computed from preceding characters via official algorithm (usually modulo 10 or 11).
**Not the same as:** Random suffix or serial number without algorithm.
**Code name:** `checkDigit`, `dv`

---

## Modulo 11

**Definition:** Weighted sum algorithm used by CPF, CNPJ (numeric), PIS, and others. Remainder maps to check digit; `10`/`11` often map to `0` or rejection.
**Code name:** Referenced in algorithm modules, not user-facing API.

---

## Canonical value

**Definition:** Normalized internal representation after strip — e.g. CPF as 11 digits, CNPJ as 14 characters without mask.
**Invariant:** Fixed length per type. CNPJ always length 14.
**Code name:** `value` in `ValidationResult`

---

## CNPJ numeric

**Definition:** Legacy 14-digit CNPJ validated with traditional modulo 11 on digits only.
**Format mask:** `XX.XXX.XXX/XXXX-DD`
**Code name:** `CnpjNumeric`, format `'numeric'`

---

## CNPJ alphanumeric

**Definition:** New CNPJ format per **IN RFB 2.229/2024**. Positions 1–12: `A-Z` or `0-9`; positions 13–14: check digits (numeric). Character value = ASCII code minus 48.
**Legal reference:** [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md)
**Storage rule:** Always `VARCHAR(14)` — **never integer types**.
**Code name:** `CnpjAlphanumeric`, format `'alphanumeric'`

---

## CPF

**Definition:** Cadastro de Pessoas Físicas — 11-digit taxpayer ID for individuals.
**Format mask:** `XXX.XXX.XXX-DD`
**Scope v1:** Numeric only. Alphanumeric CPF deferred until RFB publishes spec.
**Code name:** `Cpf`

---

## CEP

**Definition:** Código de Endereçamento Postal — 8-digit postal code (Correios).
**Format mask:** `XXXXX-XXX`
**Note:** No check digit — validation is structural only.
**Code name:** `Cep`

---

## Placa (license plate)

**Definition:** Vehicle registration plate identifier.

| Variant | Pattern | Example |
|---------|---------|---------|
| Legacy | `LLLNNNN` | `ABC1234` |
| Mercosul | `LLLNLNN` | `ABC1D23` |

**Not the same as:** RENAVAM (11 digits) or chassis (VIN).
**Code name:** `Placa`, formats `'legacy'` | `'mercosul'`

---

## Chave PIX (PIX key)

**Definition:** End-user identifier for PIX payments. Five types per Bacen: CPF, CNPJ, email, phone (+55), EVP (random UUID).
**Code name:** `PixKey`, type `PixKeyType`

---

## BR Code

**Definition:** EMV-QRCPS payload standard for PIX QR codes (Bacen Manual BR Code).
**Not the same as:** Raw PIX key string.
**Code name:** `BrCode`

---

## Linha digitável

**Definition:** Typable line on Brazilian bank slips (boleto), 47 characters with modulo-10 check fields.
**Code name:** `LinhaDigitavel`

---

## Código de barras (boleto)

**Definition:** 44-digit barcode on boleto; related to linha digitável by defined transformation.
**Code name:** `CodigoBarras`

---

## Inscrição Estadual (IE)

**Definition:** State tax registration number — **27 different validation algorithms** (one per state + DF).  
**Not the same as:** CNPJ (federal) or IM (municipal).  
**Code name:** `InscricaoEstadual`, `IE`  
**Algorithm index:** [IE-STATE-ALGORITHMS.md](IE-STATE-ALGORITHMS.md) — **all 27 UFs shipped** (`0.10.0-alpha.0`).  
**Official sources:** [OFFICIAL-SOURCES.md § IE](OFFICIAL-SOURCES.md#inscrição-estadual-ie--all-27-ufs) · per-UF URLs via `getIeOfficialSourceUrl(uf)`.

---

## PIS / PASEP / NIS

**Definition:** Social contribution / employment identifiers; modulo-11 family with specific weights.  
**Status:** **Shipped** — SIPREV RV_03 / CNIS NIT algorithm.  
**Code name:** `PisPasep`  
**Official source:** [SIPREV RV_03 (PDF)](https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf) — see [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).

---

## ValidationResult

**Definition:** Discriminated union `{ ok: true, value } | { ok: false, code, message }` — standard return type for all validators.
**Not the same as:** Throwing exceptions on invalid user input.
**Code name:** `ValidationResult`

---

## Known invalid pattern

**Definition:** Structurally calculable but conventionally rejected values (e.g. CPF/CNPJ with all identical digits).
**Code name:** `KNOWN_INVALID_PATTERN`

---

## CartaoCredito (Credit card PAN)

**Definition:** Primary Account Number validated by Luhn checksum per ISO/IEC 7812-1 Annex B.
**Not the same as:** Payment authorization, CVV check, or BIN registry lookup.
**Code name:** `CartaoCredito`, `validateCartaoCredito`

---

## PAN (Primary Account Number)

**Definition:** The digit sequence embossed or encoded on a payment card; 8–19 digits per ISO 7812.
**Code name:** stripped value from `stripCartaoCredito`

---

## Luhn algorithm

**Definition:** Modulus-10 “double-add-double” checksum applied from the rightmost digit (ISO 7812-1 Annex B).
**Code name:** `passesLuhn`, `isValidLuhn`

---

## Golden test vector

**Definition:** Input/output pair taken from an official document or worked example used as a non-negotiable unit test.
**Example:** CNPJ alphanumeric `12ABC34501DE` per SERPRO PDF.
**Code name:** Files under `tests/vectors/`

---

## Official source

**Definition:** Primary document from issuing agency (RFB, Bacen, CONTRAN, Correios) — required before shipping a validator.
**Index:** [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md)
