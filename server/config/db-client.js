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

// Validate connection string
if (!connectionString) {
  console.error('[DB] ERROR: DATABASE_URL is not set!');
  throw new Error('DATABASE_URL environment variable is required');
}

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

const pool = new Pool(poolConfig);

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

export const db = drizzle(pool, { schema });

// Export pool for graceful shutdown
export { pool };

// Test connection on startup (non-blocking)
// Only test in non-serverless environments or on first invocation
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW(), version()');
    console.log('[DB] ✅ Database connected successfully at:', result.rows[0].now);
    console.log('[DB] PostgreSQL version:', result.rows[0].version.split(',')[0]);
    
    // Verify tables exist
    const tables = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    console.log('[DB] Tables found:', tables.rows.map(r => r.tablename).join(', '));
  } catch (err) {
    console.error('[DB] ❌ Connection failed:', err.message);
    console.error('[DB] Code:', err.code);
    
    if (err.code === 'ENOTFOUND') {
      console.error('[DB] SOLUTION: Use Supabase Connection Pooler URL for Vercel');
      console.error('[DB] Format: postgresql://postgres.[REF]:[PWD]@aws-0-[REGION].pooler.supabase.com:6543/postgres');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('[DB] SOLUTION: Check if PostgreSQL is running locally');
      console.error('[DB] Or verify DATABASE_URL is correct');
    } else if (err.code === '28P01') {
      console.error('[DB] SOLUTION: Invalid username or password');
    }
    
    // In development, exit on connection failure
    // In production/serverless, continue (connection might work on next request)
    if (!isProduction) {
      throw err;
    }
  }
};

// Run connection test
testConnection();
