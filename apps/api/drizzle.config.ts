import { defineConfig } from 'drizzle-kit';

// drizzle-kit only needs the schema and the output folder to generate SQL;
// the migrations themselves are applied by `npm run db:migrate`.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
});
