# Install

```bash
pnpm add @br-validators/core
# or
npm install @br-validators/core
```

## Subpath imports (tree-shaking)

```typescript
import { validateCpf, formatCpf } from '@br-validators/core/cpf';
import { validateCnpj } from '@br-validators/core/cnpj';
import { getNcmPorCodigo } from '@br-validators/core/ncm';
```

## Bundle size (gzipped)

Measured `@br-validators/core@1.9.0` with `pnpm measure:bundle-sizes` (esbuild ESM bundle per subpath). **Reference-data subpaths include embedded JSON**; some validators (e.g. `cep`, `sanitize`) also bundle shared core dependencies when imported alone.

| Subpath | Raw (esbuild) | Gzip | Notes |
|---------|---------------|------|-------|
| `@br-validators/core/cpf` | 4.0 KB | 1.5 KB | validator only |
| `@br-validators/core/cnpj` | 6.8 KB | 2.0 KB | validator only |
| `@br-validators/core/cep` | 2340.8 KB | 161.8 KB | validator only |
| `@br-validators/core/ncm` | 914.6 KB | 142.2 KB | includes embed |
| `@br-validators/core/cfop` | 100.3 KB | 9.4 KB | includes embed |
| `@br-validators/core/cst` | 19.1 KB | 3.4 KB | includes embed |
| `@br-validators/core/pix` | 17.6 KB | 3.9 KB | validator only |
| `@br-validators/core/ptax` | 214.2 KB | 22.4 KB | includes embed |
| `@br-validators/core/ibge` | 392.6 KB | 60.5 KB | includes embed |
| `@br-validators/core/sanitize` | 2995.5 KB | 219.4 KB | platform utilities |

Full table: [data/bundle-sizes/subpath-sizes.md](https://github.com/open-data-brazil/br-validators/blob/main/data/bundle-sizes/subpath-sizes.md).

## CLI

```bash
npm install -g @br-validators/cli
br-validators cpf validate 12345678909
```

## Adapters

| Adapter | Install |
|---------|---------|
| Zod | `pnpm add @br-validators/zod` |
| React Hook Form | `pnpm add @br-validators/react-hook-form` |
| Express | `pnpm add @br-validators/express` |
| Vue 3 | `pnpm add @br-validators/vue` |

See [Framework adapters](/guide/adapters).
