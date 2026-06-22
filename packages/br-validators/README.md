# @br-validators/core

> **The** Brazilian document validation library for TypeScript.  
> Validate, format, and generate CPF, CNPJ (including the new alphanumeric format), NF-e, BR Code PIX, boleto, IE (all 27 states), and 15+ more — zero dependencies, fully typed, never throws.

[![npm](https://img.shields.io/npm/v/@br-validators/core)](https://www.npmjs.com/package/@br-validators/core)
[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/AlexandreZanata/br-validators/blob/main/LICENSE)
[![Node ≥ 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)]()

```bash
npm install @br-validators/core
```

**Try it now → [doc-raiz-playground.vercel.app](https://doc-raiz-playground.vercel.app)**  
**CLI → `npm install -g @br-validators/cli`**

> ⚠️ The unscoped `br-validators` on npm is a different package. Use **`@br-validators/core`**.

---

## Why this library

Every Brazilian SaaS eventually reinvents CPF validation — usually wrong.  
`@br-validators/core` implements each algorithm from its **official primary source**
(Receita Federal, Bacen, CONTRAN, TSE, SEFAZ, FEBRABAN, Anatel) so you don't have to.

- ✅ **CNPJ alfanumérico** — new RFB format (effective July 2026), ready now
- ✅ **18 document types** — CPF, CNPJ, CEP, NF-e chave, BR Code PIX, boleto, CNH, RENAVAM, placa, PIS/PASEP, PIX key, cartão de crédito, IE (27 UFs), IE produtor rural, título de eleitor, telefone, + platform APIs
- ✅ **Zero runtime dependencies** — pure TypeScript logic, no HTTP calls
- ✅ **Never throws** — every function returns `{ ok: true, value } | { ok: false, message, code }`
- ✅ **Tree-shakeable** — subpath imports per document type
- ✅ **ESM only**, Node ≥ 18, works in browser, Bun, Deno

---

## Quick start

```typescript
import { validateCpf, formatCpf } from '@br-validators/core';

validateCpf('123.456.789-09');
// { ok: true, value: '12345678909' }

formatCpf('12345678909');
// { ok: true, formatted: '123.456.789-09' }

validateCpf('111.111.111-11');
// { ok: false, message: 'CPF with all identical digits is invalid', code: 'KNOWN_INVALID_PATTERN' }
```

### CNPJ — numeric and alphanumeric (new RFB format)

```typescript
import { validateCnpj, formatCnpj } from '@br-validators/core/cnpj';

// Numeric (current format)
validateCnpj('11.222.333/0001-81');
// { ok: true, value: '11222333000181', format: 'numeric' }

// Alphanumeric (new format — effective July 2026)
validateCnpj('12ABC34501DE35');
// { ok: true, value: '12ABC34501DE35', format: 'alphanumeric' }

formatCnpj('12ABC34501DE35');
// { ok: true, formatted: '12.ABC.345/01DE-35' }
```

### Auto-detect document type

```typescript
import { detect } from '@br-validators/core';

detect('123.456.789-09');
// { type: 'cpf', ok: true, value: '12345678909' }

detect('ABC1D23');
// { type: 'placa', ok: true, format: 'mercosul' }

detect('110042490114', { uf: 'SP' });
// { type: 'inscricao-estadual', ok: true }
```

### Generate valid documents for tests

```typescript
import { generate } from '@br-validators/core';

generate('cpf', { seed: 42 });           // reproducible, always valid
generate('cnpj', { format: 'alphanumeric', masked: true });
generate('placa', { format: 'mercosul' });
generate('renavam');
generate('cnh');
generate('inscricao-estadual', { uf: 'SP', seed: 42 });
generate('titulo-eleitor', { uf: 'SC', seed: 42 });
generate('cartao-credito', { brand: 'visa', seed: 42 });
```

> `generate()` is for test fixtures and seed data only — never use in production.

### ETL / data cleanup

```typescript
import { sanitize } from '@br-validators/core';

sanitize(' 123.456.789-09 ', 'cpf');
// { ok: true, value: '12345678909', fixes: ['trimmed', 'removed_non_digits'] }

sanitize('110.042.490.114', 'inscricao-estadual', { uf: 'SP' });
// { ok: true, value: '110042490114', fixes: [...] }
```

### NF-e chave de acesso (44 digits)

```typescript
import { validateNfeChave, parseNfeChave } from '@br-validators/core/nfe-chave';

const result = validateNfeChave('52060433009911002506550120000007800267301615');
// { ok: true, parsed: { cUF: '52', cnpj: '33009911002506', mod: '55', ... }, uf: 'GO' }
```

### BR Code (PIX QR payload)

```typescript
import { validateBrCode, parseBrCode } from '@br-validators/core/brcode';

parseBrCode('00020126580014br.gov.bcb.pix0136...');
// { ok: true, pixKey, pixKeyType, merchantName, merchantCity, amount, txid }
```

### Form handler (React / Next.js)

```typescript
'use client';
import { validateCnpj, formatCnpj } from '@br-validators/core/cnpj';
import { useState } from 'react';

export function CnpjField() {
  const [input, setInput] = useState('');
  const result = input ? validateCnpj(input) : null;
  const formatted = result?.ok ? formatCnpj(result.value) : null;

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      {formatted?.ok && <p>✅ {formatted.formatted}</p>}
      {result && !result.ok && <p>❌ {result.message}</p>}
    </div>
  );
}
```

### Shell / CI

```bash
br-validators cnpj validate "$CNPJ" --quiet || exit 1
br-validators ie validate "$IE" --uf SP --json
br-validators detect '123.456.789-09' --json
br-validators generate cpf --seed 42 --masked
br-validators generate inscricao-estadual --uf SP --seed 42
br-validators generate cartao-credito --brand visa --seed 42
```

---

## All supported types

| Document | Subpath import | CLI | Playground |
|---|---|---|---|
| CPF | `@br-validators/core/cpf` | `br-validators cpf …` | `/cpf` |
| CNPJ (numeric + alphanumeric) | `@br-validators/core/cnpj` | `br-validators cnpj …` | `/cnpj` |
| CEP | `@br-validators/core/cep` | `br-validators cep …` | `/cep` |
| Telefone | `@br-validators/core/telefone` | `br-validators telefone …` | `/telefone` |
| CNH | `@br-validators/core/cnh` | `br-validators cnh …` | `/cnh` |
| RENAVAM | `@br-validators/core/renavam` | `br-validators renavam …` | `/renavam` |
| Título de Eleitor | `@br-validators/core/titulo-eleitor` | `br-validators titulo-eleitor …` | `/titulo-eleitor` |
| Placa (Mercosul + legada) | `@br-validators/core/placa` | `br-validators placa …` | `/placa` |
| PIS / PASEP / NIS | `@br-validators/core/pis-pasep` | `br-validators pis-pasep …` | `/pis` |
| PIX key | `@br-validators/core/pix` | `br-validators pix …` | `/pix` |
| BR Code (PIX QR payload) | `@br-validators/core/brcode` | `br-validators brcode …` | `/brcode` |
| Boleto (Situação 1 + 2) | `@br-validators/core/boleto` | `br-validators boleto …` | `/boleto` |
| NF-e / NFC-e chave (44 digits) | `@br-validators/core/nfe-chave` | `br-validators nfe-chave …` | `/nfe-chave` |
| Cartão de crédito (Luhn) | `@br-validators/core/cartao-credito` | `br-validators cartao …` | `/cartao-credito` |
| Inscrição Estadual (27 UFs) | `@br-validators/core/inscricao-estadual` | `br-validators ie … --uf SP` | `/ie` |
| IE Produtor Rural | `@br-validators/core/inscricao-estadual-produtor-rural` | `br-validators ie …` (auto-detect `P` prefix) | `/ie` |
| **detect()** | `@br-validators/core/detect` | `br-validators detect …` | `/detect` |
| **sanitize()** | `@br-validators/core/sanitize` | `br-validators sanitize …` | `/sanitize` |
| **generate()** | `@br-validators/core/generate` | `br-validators generate …` | `/generate` |

Full official sources per type: [docs/OFFICIAL-SOURCES.md](https://github.com/AlexandreZanata/br-validators/blob/main/docs/OFFICIAL-SOURCES.md)

---

## Tree-shaking

```typescript
// Only ships the CPF module — nothing else
import { validateCpf } from '@br-validators/core/cpf';

// Only ships NF-e module
import { parseNfeChave } from '@br-validators/core/nfe-chave';
```

---

## Related packages

| Package | Status |
|---|---|
| [`@br-validators/cli`](https://www.npmjs.com/package/@br-validators/cli) | Published |
| `@br-validators/zod` | Coming soon — Zod schemas |
| `@br-validators/react-hook-form` | Coming soon — RHF resolvers |

---

## Contributing

Issues, corrections, and new document types are welcome.  
See [CONTRIBUTING.md](https://github.com/AlexandreZanata/br-validators/blob/main/CONTRIBUTING.md) and open `good first issue` items.

---

## License

[MIT](https://github.com/AlexandreZanata/br-validators/blob/main/LICENSE) — permanently free and open source.
