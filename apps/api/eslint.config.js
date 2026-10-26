import { defineConfig } from 'eslint/config';
import love from 'eslint-config-love';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  { ignores: ['dist/**'] },
  {
    files: ['**/*.ts'],
    extends: [love],
  },
  prettierRecommended,
]);
