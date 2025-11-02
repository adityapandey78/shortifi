import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
  schema: './drizzle/schema.js',
  out: './drizzle/migration',
  dialect: 'postgresql',
  dbCredentials: {
    // Use pooler URL for migrations (it works!)
    url: process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL,
  },
});
