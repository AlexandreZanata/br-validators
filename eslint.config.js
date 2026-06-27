import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      'apps/docs/api/**',
      'apps/docs/api-reference/**',
      'tests/integration/subpath-imports/.tmp/**',
      'data/bundle-sizes/.tmp/**',
      'apps/playground/playwright-report/**',
      'apps/playground/test-results/**',
      'agent-harness/**',
      'agent-rules/**',
      'apps/playground/next-env.d.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ['**/*.{ts,tsx,mjs,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.js',
            'apps/playground/next.config.mjs',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['eslint.config.js', '**/*.config.mjs', 'scripts/**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './scripts/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        projectService: false,
      },
    },
  },
  {
    files: ['tests/integration/subpath-imports/**/*.{ts,mts}'],
    languageOptions: {
      parserOptions: {
        project: './tests/integration/subpath-imports/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        projectService: false,
      },
    },
  },
  {
    files: ['apps/playground/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
  {
    files: ['apps/playground/e2e/**/*.ts', 'apps/playground/playwright.config.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: [
      'packages/br-validators/src/**/index.ts',
      'packages/br-validators/src/*.ts',
    ],
    rules: {
      // Public barrels intentionally re-export deprecated v1 aliases until v2.0.
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
);
