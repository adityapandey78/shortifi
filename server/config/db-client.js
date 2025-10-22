import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema.js";
import './dotenv.config.js';

// Create PostgreSQL pool with proper SSL configuration for Supabase
// Vercel serverless functions need optimized connection settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Required for Supabase and most cloud databases
    : false, // Local development without SSL
  // Optimized connection pool settings for Vercel serverless
  max: 1, // Vercel serverless: Use 1 connection per function instance
  min: 0, // Don't keep idle connections
  idleTimeoutMillis: 10000, // Close idle connections after 10 seconds (serverless optimization)
  connectionTimeoutMillis: 10000, // Faster timeout for serverless (10s)
  query_timeout: 15000, // Query timeout 15 seconds
  statement_timeout: 15000, // Statement timeout 15 seconds
  // Allow graceful exits
  allowExitOnIdle: true, // Let the pool close when idle (good for serverless)
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
