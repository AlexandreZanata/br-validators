# @br-validators/core

100% open-source Brazilian document validators (MIT). Pure TypeScript — no HTTP lookups, no frameworks.

**npm:** [`@br-validators/core`](https://www.npmjs.com/package/@br-validators/core)  
**Repo:** [github.com/AlexandreZanata/br-validators](https://github.com/AlexandreZanata/br-validators)  
**Playground:** [doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app/)

> The unscoped name `br-validators` on npm is a **different package**. Use **`@br-validators/core`**.

---

## Install

```bash
npm install @br-validators/core
```

Requires Node ≥ 18. ESM only (`"type": "module"`).

---

## Platform APIs

Cross-cutting helpers that **compose existing validators** — never duplicate check-digit logic.

| API | Import | Purpose |
|-----|--------|---------|
| **`detect()`** | `@br-validators/core/detect` | Classify raw input (priority router over all shipped types) |
| **`sanitize()`** | `@br-validators/core/sanitize` | ETL fixes → validate (returns `fixes[]`) |
| **`generate()`** | `@br-validators/core/generate` | Synthetic **test fixtures** only (`seed` for reproducibility) |

```typescript
import { detect, sanitize, generate } from '@br-validators/core';
import { validateCpf } from '@br-validators/core/cpf';

// Auto-detect document type
detect('123.456.789-09');
// → { type: 'cpf', ok: true, value: '12345678909', format: 'numeric' }

detect('110042490114', { uf: 'SP' });
// → { type: 'inscricao-estadual', ok: true, ... }

// Messy ETL input → canonical + fix audit trail
sanitize(' 123.456.789-09 ', 'cpf');
// → { ok: true, value: '12345678909', fixes: ['trimmed', 'removed_non_digits'] }

sanitize('110.042.490.114', 'inscricao-estadual', { uf: 'SP' });
// → { ok: true, value: '110042490114', fixes: [...] }

// Synthetic valid documents for tests (never production IDs)
const cpf = generate('cpf', { seed: 42 });
validateCpf(cpf).ok; // true

generate('cnpj', { format: 'alphanumeric', masked: true, seed: 7 });
generate('placa', { format: 'mercosul', seed: 3 });
```

**Detect notes:** 11-digit bucket tries CPF → CNH → PIS (RENAVAM equivalent DV may classify as `pis-pasep`). IE detection requires `{ uf }`. 48-digit boleto arrecadação is skipped.

**Generate policy:** 9 types — CPF, CNPJ, CEP, placa, PIS, RENAVAM, CNH, telefone, cartão. Excludes boleto, NF-e chave, IE, BR Code, PIX.

---

## Per-type validators

Every module exposes `validate*`, `format*`, `strip*` (where applicable). All return `ValidationResult` — **never throw** on invalid input.

| Subpath | Key functions | Golden vector |
|---------|---------------|---------------|
| `./cnpj` | `validateCnpj`, `formatCnpj`, `stripCnpj` | `12ABC34501DE35` (alphanumeric) |
| `./cpf` | `validateCpf`, `formatCpf`, `stripCpf` | `12345678909` |
| `./cep` | `validateCep`, `formatCep`, `stripCep` | `01310100` |
| `./telefone` | `validateTelefone`, `formatTelefone`, `stripTelefone` | `11999999999` (celular) |
| `./cnh` | `validateCnh`, `formatCnh`, `stripCnh` | `62472927637` (11 digits, no CPF mask) |
| `./renavam` | `validateRenavam`, `formatRenavam`, `stripRenavam` | `63977791104` |
| `./titulo-eleitor` | `validateTituloEleitor`, `formatTituloEleitor`, `stripTituloEleitor` | `004356870906` |
| `./nfe-chave` | `validateNfeChave`, `parseNfeChave`, `formatNfeChave` | `52060433009911002506550120000007800267301615` |
| `./brcode` | `validateBrCode`, `parseBrCode` | EMV PIX payload (CRC16) |
| `./placa` | `validatePlaca`, `formatPlaca`, `convertPlacaToMercosul` | `ABC1D23` (Mercosul), `ABC1234` (legacy) |
| `./pis-pasep` | `validatePisPasep`, `formatPisPasep`, `stripPisPasep` | `10027230888` |
| `./pix` | `validatePixKey`, `formatPixKey`, `detectPixKeyType` | `pix@bcb.gov.br` |
| `./boleto` | `validateBoleto`, `formatBoleto`, `convertLinhaToCodigoBarras` | Situação 1 + 2 (FEBRABAN) |
| `./cartao-credito` | `validateCartaoCredito`, `passesLuhn`, `detectCardBrand` | `4111111111111111` |
| `./inscricao-estadual` | `validateInscricaoEstadual`, `formatInscricaoEstadual` | `110042490114` (SP) — **27 UFs**, `{ uf }` required |
| `./inscricao-estadual-produtor-rural` | `validateIeProdutorRural`, `validateIeSpRural` | `P011004243002` (SP Regra II) |

Tree-shaking via subpaths:

```typescript
import { validateCnpj } from '@br-validators/core/cnpj';
import { validateNfeChave } from '@br-validators/core/nfe-chave';
import { validateTituloEleitor } from '@br-validators/core/titulo-eleitor';
import { validateBrCode } from '@br-validators/core/brcode';
import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';
import { validateIeProdutorRural } from '@br-validators/core/inscricao-estadual-produtor-rural';
```

---

## Examples

### CNPJ (numeric + alphanumeric)

```typescript
import { validateCnpj, formatCnpj } from '@br-validators/core';

validateCnpj('12ABC34501DE35');
// { ok: true, value: '12ABC34501DE35', format: 'alphanumeric' }

formatCnpj('12ABC34501DE35');
// { ok: true, formatted: '12.ABC.345/01DE-35' }
```

### Inscrição Estadual (all 27 UFs)

```typescript
import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';

validateInscricaoEstadual('110042490114', { uf: 'SP' });
validateInscricaoEstadual('0730000100109', { uf: 'DF' });
// getIeOfficialSourceUrl('SP') → SEFAZ primary URL
```

### SP produtor rural (`P` prefix)

```typescript
import { validateIeProdutorRural } from '@br-validators/core/inscricao-estadual-produtor-rural';

validateIeProdutorRural('SP', 'P-01100424.3/002');
// { ok: true, value: 'P011004243002', ... }
```

### NF-e / NFC-e chave de acesso (44 digits)

```typescript
import { validateNfeChave, parseNfeChave } from '@br-validators/core/nfe-chave';

const result = validateNfeChave('52060433009911002506550120000007800267301615');
// { ok: true, parsed: { cUF, cnpj, mod, serie, nNF, ... }, uf: 'GO' }
```

### BR Code (PIX QR payload)

```typescript
import { validateBrCode } from '@br-validators/core/brcode';

validateBrCode('00020126580014br.gov.bcb.pix0136...63041D3D');
// { ok: true, pixKey, merchantName, merchantCity, ... }
```

### Boleto (linha digitável ↔ código de barras)

```typescript
import { validateBoleto, convertLinhaToCodigoBarras } from '@br-validators/core/boleto';

validateBoleto('03399.02579 08991.834006 71742.301014 6 14500000099668');
```

---

## Official sources

Every algorithm cites a primary government or standards body source (RFB, Bacen, CONTRAN, TSE, SEFAZ, FEBRABAN, ISO, Correios, Anatel, SIPREV).

Full index: [docs/OFFICIAL-SOURCES.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/OFFICIAL-SOURCES.md)

Per-type constants: `CNPJ_OFFICIAL_SOURCE_URL`, `NFE_CHAVE_OFFICIAL_SOURCE_URL`, `IE_OFFICIAL_SOURCE_URLS`, `BRCODE_OFFICIAL_SOURCE_URL`, etc.

Golden test vectors: `tests/vectors/*.official.json` in the repo.

---

## API reference

| Doc | Content |
|-----|---------|
| [LIBRARY-API.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/LIBRARY-API.md) | Full signatures + platform APIs |
| [VALIDATION-RULES.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/VALIDATION-RULES.md) | Business rules (BR-* IDs) |
| [DELIVERY-SURFACES.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/DELIVERY-SURFACES.md) | Library + CLI + playground matrix |

---

## CLI companion

```bash
npm install -g @br-validators/cli

br-validators list
br-validators cnpj validate 12ABC34501DE35 --json
br-validators nfe-chave validate 52060433009911002506550120000007800267301615 --json
br-validators titulo-eleitor validate 004356870906
br-validators brcode validate '<emv-payload>'
br-validators ie validate 110042490114 --uf SP

# Platform APIs
br-validators detect '123.456.789-09' --json
br-validators sanitize cpf ' 123.456.789-09 ' --json
br-validators generate cpf --seed 42 --masked --json
```

---

## Related packages (monorepo)

| Package | Status |
|---------|--------|
| `@br-validators/cli` | Published — terminal CLI |
| `@br-validators/zod` | Workspace — Zod schemas (not on npm yet) |
| `@br-validators/react-hook-form` | Workspace — RHF resolvers (not on npm yet) |

---

## License

MIT
