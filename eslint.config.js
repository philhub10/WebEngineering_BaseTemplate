import love from 'eslint-config-love';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  { ignores: ['dist/**'] },
  {
    ...love,
    files: ['src/**/*.ts'],
  },
  prettierRecommended,
];
