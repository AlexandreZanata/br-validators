# Use Case: UC-007 — Validate boleto (linha digitável + código de barras)

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-007 |
| Actor | Payment app / billing form |
| Status | Approved |

## Preconditions

- FEBRABAN Convenção da Cobrança defines bank boleto layout (47-digit linha + 44-digit barcode)
- Modulo 10 for field DVs; modulo 11 for barcode general DV

## Main flow (happy path)

1. Consumer receives linha digitável or código de barras string
2. `detectBoletoInputKind(input)` → `'linha-digitavel'` or `'codigo-barras'`
3. `validateBoleto(input)` delegates to per-kind validator
4. Return `{ ok: true, value, inputKind, format, situacao: '1' | '2' }`

## Alternate flows

### AF-1: Masked linha digitável

- **When:** Input contains dots/spaces per FEBRABAN display format
- **Then:** Strip non-digits, validate 47-digit structure and check digits

### AF-2: Strict kind mismatch

- **When:** Consumer forces `kind: 'linha-digitavel'` but input is 44-digit barcode
- **Then:** Fail with `UNSUPPORTED_FORMAT`

### AF-3: Conversion

- **When:** Valid linha or barcode needs counterpart format
- **Then:** `convertLinhaToCodigoBarras` / `convertCodigoBarrasToLinhaDigitavel` per Anexo V §2.3.4

### AF-4: Situação 2 (ISPB holder, code 988)

- **When:** Linha field 1 starts with `988` and currency indicator `0`
- **Then:** Validate as Situação 2; campo 5 = ISPB (14 digits); return `situacao: '2'`

### AF-5: Optional semantic flags

- **When:** `validateDueFactor` or `validateAmount` enabled on Situação 1 input
- **Then:** Apply BR-BOLETO-012 / BR-BOLETO-013 after structural validation

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-BOLETO-001 | Input kind detection |
| BR-BOLETO-002 | Linha field DVs (modulo 10) |
| BR-BOLETO-003 | Barcode DV (modulo 11) |
| BR-BOLETO-006 | Linha ↔ barcode conversion |
| BR-BOLETO-011 | Situação 1 / Situação 2 detection |
| BR-BOLETO-012 | Optional fator vencimento |
| BR-BOLETO-013 | Optional document amount |

## Domain events raised

None.

## Authorization

N/A.

## In scope (arrecadação)

- 48-digit arrecadação/concessionária slips (`validateArrecadacao`, `format: 'arrecadacao'`)
- 44-digit arrecadação código de barras
- Routed by `validateBoleto` and `detect()` when structural checks pass

## Out of scope
- Bank slip registration / DDA lookup
- Structured field parse (banco, valor, vencimento)

## References

- [OFFICIAL-SOURCES.md](../OFFICIAL-SOURCES.md) — FEBRABAN cobrança + arrecadação Layout v7
- [LIBRARY-API.md](../LIBRARY-API.md#core-api--boleto)
