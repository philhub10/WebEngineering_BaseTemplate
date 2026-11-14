import { defineConfig } from 'eslint/config';
import love from 'eslint-config-love';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  { ignores: ['dist/**'] },
  {
    files: ['**/*.ts'],
    extends: [love],
  },
  {
    // CLI scripts, not the server: console output is their interface.
    files: ['src/db/migrate.ts', 'src/db/seed.ts', 'src/db/seed-comments.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    // Expected status codes and counts are the point of a test.
    files: ['test/**/*.ts'],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
  prettierRecommended,
]);
