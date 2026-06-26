import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const indexPath = join(packageRoot, 'api-reference', 'index.md');

const banner = `::: info Auto-generated API reference
TypeDoc output from \`@br-validators/core\` sources. Regenerate with \`pnpm docs:api\`.

For narrative docs, examples, and business rules see [Library API](/api/library-api) (synced from \`docs/LIBRARY-API.md\`).
:::

`;

const raw = readFileSync(indexPath, 'utf8');
const body = raw.replace(/^---[\s\S]*?---\n+/u, '').trimStart();

const prepared = `---
title: API Reference (TypeDoc)
description: Auto-generated TypeScript signatures for @br-validators/core subpath exports.
editLink: false
lastUpdated: false
---

${banner}${body}
`;

writeFileSync(indexPath, prepared, 'utf8');
console.log(`Prepared VitePress frontmatter → ${indexPath}`);
