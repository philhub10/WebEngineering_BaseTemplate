import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Required by the env schema; the pool connects lazily, so the tests
    // never open a connection.
    env: { DATABASE_URL: 'postgres://test:test@localhost:5432/test' },
  },
});
