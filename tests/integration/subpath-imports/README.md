# E2E subpath import tests (phase 33s)

Isolated mini-consumer project that resolves `@br-validators/core` through the published **`package.json#exports`** map (workspace `dist/` after `pnpm --filter @br-validators/core build`).

## Run

```bash
pnpm --filter @br-validators/core build
pnpm test:integration
```

## What it checks

| Check | Detail |
|-------|--------|
| **Native import** | `import('@br-validators/core/…')` via Node — no Vitest path aliases |
| **Export map coverage** | Every key in `export-manifest.json` (synced from core `package.json`) |
| **Dedicated smokes** | `cnpj`, `ncm`, `cst`, `compare`, `cpf`, `ptax`, `batch`, root barrel |
| **Tree-shaking** | esbuild bundle of `entry-cnpj-only.mts` must not pull `boleto`, `pix`, `cpf`, or full `index` |

## Exceptions

Document any skipped export keys in `export-manifest.json` → `exceptions` (currently none).
