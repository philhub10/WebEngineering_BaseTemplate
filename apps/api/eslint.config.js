import { defineConfig } from 'eslint/config';
import love from 'eslint-config-love';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  { ignores: ['dist/**'] },
  {
    files: ['**/*.ts'],
    extends: [love],
    languageOptions: {
      parserOptions: {
        // Config files outside src/ (not part of tsconfig.json).
        projectService: { allowDefaultProject: ['drizzle.config.ts'] },
      },
    },
  },
  {
    // CLI scripts, not the server: console output is their interface.
    files: ['src/db/migrate.ts', 'src/db/seed.ts'],
    rules: { 'no-console': 'off' },
  },
  prettierRecommended,
]);
