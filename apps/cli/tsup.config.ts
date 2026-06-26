import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    clean: true,
    platform: 'node',
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    entry: ['src/run-captured.ts'],
    format: ['esm'],
    clean: false,
    platform: 'node',
    dts: true,
  },
]);
