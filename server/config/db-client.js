import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema.js";
import './dotenv.config.js';

// Create PostgreSQL pool with proper SSL configuration for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase and most cloud databases
  },
  // Connection pool settings for better reliability with Supabase
  max: 10, // Maximum number of connections (Supabase pooler limit)
  min: 2, // Keep at least 2 connections alive
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 30000, // Wait 30 seconds before timing out (increased for Supabase)
  query_timeout: 30000, // Query timeout 30 seconds
  statement_timeout: 30000, // Statement timeout 30 seconds
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const db = drizzle(pool, { schema });

// Test connection on startup (non-blocking)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[DB] Connection failed:', err.message);
    console.error('[DB] Check your DATABASE_URL in .env file');
    console.error('[DB] Ensure PostgreSQL/Supabase is accessible');
  } else {
    console.log('[DB] Database connected successfully at:', res.rows[0].now);
  }
});
