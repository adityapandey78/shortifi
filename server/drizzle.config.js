import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
  schema: './drizzle/schema.js',
  out: './drizzle/migration',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
