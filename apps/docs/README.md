# @br-validators/docs

VitePress documentation site for BR Validators.

## Why VitePress

Matches the monorepo TypeScript toolchain (Vite + Vue 3) without adding Astro/Starlight.

| Source | Output | Purpose |
|--------|--------|---------|
| `docs/LIBRARY-API.md` | `api/library-api.md` | Narrative API contract (sync on build) |
| `packages/br-validators/src/**` | `api-reference/` | TypeDoc signatures (`pnpm docs:api`) |

## Local dev

```bash
pnpm docs:dev
# or
pnpm docs:api && pnpm --filter @br-validators/docs dev
```

## Build

```bash
pnpm docs:build
```

Output: `apps/docs/.vitepress/dist`

## Deploy

Target: Vercel subdomain [docs.br-validators.dev](https://docs.br-validators.dev/) (project root: `apps/docs`).

CI runs `pnpm docs:build` on every push (see `.github/workflows/ci.yml`).
