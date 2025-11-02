import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema.js";
import './dotenv.config.js';

// Determine if we're in a serverless environment (Vercel)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || process.env.VERCEL_ENV;
const isProduction = process.env.NODE_ENV === 'production';

// Connection string selection based on environment
// PRIORITY: Use DATABASE_POOLER_URL if available (for Vercel/serverless)
let connectionString = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;

// Log which connection we're using
if (process.env.DATABASE_POOLER_URL) {
  console.log('[DB] Using DATABASE_POOLER_URL (Connection Pooler for serverless)');
} else {
  console.log('[DB] Using DATABASE_URL (Direct connection)');
}

console.log('[DB] Environment: isVercel =', isVercel, ', isProduction =', isProduction);
// Expose `pool` and `db` variables for other modules to import. They will be
// assigned only if a connection string is provided. Declaring them here as
// `let` allows conditional initialization below.
export let pool = null;
export let db = null;

// If a connection string is provided, initialize the pool and drizzle client.
if (connectionString) {
  // Create PostgreSQL pool with proper SSL configuration
  // Different settings for serverless (Vercel) vs traditional server (localhost)
  const poolConfig = {
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    
    // Serverless-optimized settings (Vercel)
    ...(isVercel && {
      max: 1, // Vercel: 1 connection per function instance
      min: 0, // Don't maintain idle connections
      idleTimeoutMillis: 10000, // Close after 10s idle
      connectionTimeoutMillis: 10000, // 10s connection timeout
      allowExitOnIdle: true, // Allow pool to close when idle
    }),
    
    // Traditional server settings (localhost)
    ...(!isVercel && {
      max: 10, // Up to 10 concurrent connections
      min: 2, // Keep 2 connections alive
      idleTimeoutMillis: 30000, // 30s idle timeout
      connectionTimeoutMillis: 5000, // 5s connection timeout
    }),
    
    // Common settings
    query_timeout: 15000, // 15s query timeout
    statement_timeout: 15000, // 15s statement timeout
  };

  pool = new Pool(poolConfig);

  // Handle unexpected errors
  pool.on('error', (err) => {
    console.error('[DB] Unexpected database pool error:', err.message);
    if (err.code === 'ECONNRESET') {
      console.error('[DB] Connection was reset. This is common in serverless environments.');
    }
  });

  // Handle connection events
  pool.on('connect', () => {
    if (!isVercel) {
      console.log('[DB] New client connected to pool');
    }
  });

  pool.on('remove', () => {
    if (!isVercel) {
      console.log('[DB] Client removed from pool');
    }
  });

  db = drizzle(pool, { schema });
}

// NOTE:
// We intentionally do not run an aggressive connection test here. In the past
// attempts to probe the database on module import could raise fatal errors
// (especially in serverless or misconfigured environments) and crash the
// process. The application will log connection issues at runtime when actual
// database operations are attempted.

// If you want to run a connection test locally, you can call the helper
// below from a startup script or REPL. Keeping the startup path lightweight
// avoids crashes when the DB is temporarily unavailable.

export const testConnection = async () => {
  if (!pool) {
    console.warn('[DB] ⚠️  No database connection available (DATABASE_URL not configured)');
    return false;
  }

  try {
    const result = await pool.query('SELECT NOW(), version()');
    console.log('[DB] ✅ Database connected successfully at:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('[DB] ❌ Connection test failed:', err.message);
    console.error('[DB] Code:', err.code);
    return false;
  }
};
