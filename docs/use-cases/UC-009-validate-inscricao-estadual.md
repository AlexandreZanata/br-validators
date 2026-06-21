# Use Case: UC-009 — Validate and format Inscrição Estadual (27 UFs)

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-009 |
| Actor | Application developer / fiscal onboarding form |
| Status | Approved |

## Preconditions

- **UF is required** — one of 27 codes (`AC` … `TO`)
- Input may contain mask punctuation (dots, hyphens, slashes)
- Validation is **check digits only** — no SEFAZ/SINTEGRA registration lookup

## Main flow (happy path)

1. Consumer calls `stripInscricaoEstadual(input)` → digits only
2. Consumer calls `validateInscricaoEstadual(stripped, { uf })` → `{ ok: true, value, uf, format: 'inscricao-estadual' }`
3. Consumer calls `formatInscricaoEstadual(stripped, { uf })` → per-UF display mask (SP/DF) or canonical digits

## Alternate flows

### AF-1: Invalid check digit

- **When:** Check digits do not match SEFAZ/SINTEGRA roteiro for the UF
- **Then:** `{ ok: false, code: 'INVALID_CHECK_DIGIT', uf? }`

### AF-2: Wrong length after strip

- **When:** Length ≠ UF rule (e.g. SP 12, RJ 8, RO 14)
- **Then:** `{ ok: false, code: 'INVALID_LENGTH' }`

### AF-3: Unsupported UF or format

- **When:** Unknown `uf`, SP rural `P…`, invalid prefix, DF legacy 12-digit
- **Then:** `{ ok: false, code: 'UNSUPPORTED_FORMAT' }`

### AF-4: Empty input

- **When:** Blank or whitespace-only
- **Then:** `{ ok: false, code: 'EMPTY_INPUT' }`

### AF-5: UF mismatch

- **When:** Valid SP number validated with `{ uf: 'MT' }`
- **Then:** `{ ok: false, code: 'INVALID_CHECK_DIGIT' | 'UNSUPPORTED_FORMAT' }` per UF rules

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-IE-001 | UF required |
| BR-IE-SP-001 … BR-IE-TO-001 | Per-UF check-digit rules — see [VALIDATION-RULES.md](../VALIDATION-RULES.md) |
| BR-GLOBAL-001 | Strip first |
| BR-GLOBAL-002 | Validate before format |

## Domain events raised

None — pure library, no events.

## Authorization

N/A — client-side/server-side library call.

## Out of scope

- SP rural `P…` format (Regra II)
- SEFAZ HTTP registration lookup
- Auto-detect UF from length/prefix

## Official sources

Full per-UF table (primary SEFAZ URL, SINTEGRA mirror, golden vector, test file):

- [OFFICIAL-SOURCES.md § IE](../OFFICIAL-SOURCES.md#inscrição-estadual-ie--all-27-ufs)
- [LIBRARY-API.md § IE](../LIBRARY-API.md#core-api--inscrição-estadual-ie)
- [IE-STATE-ALGORITHMS.md](../IE-STATE-ALGORITHMS.md)

**API:** `getIeOfficialSourceUrl(uf)` · `IE_OFFICIAL_SOURCE_URLS`

**CLI:** `br-validators ie validate <value> --uf <UF> --source`
