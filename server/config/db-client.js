import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema.js";
import './dotenv.config.js';

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const db = drizzle(pool, { schema });

// Optional: Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});
