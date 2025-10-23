// Test Supabase Connection with Pooler URL
// Run this to verify your pooler connection works
// node test-pooler-connection.js

import pkg from "pg";
const { Pool } = pkg;

// IMPORTANT: Replace this with your Supabase POOLER URL (port 6543)
const POOLER_URL = process.env.DATABASE_URL || "postgresql://postgres.vokbvbdzvturbvmcuocz:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres";

console.log("🧪 Testing Supabase Connection Pooler...\n");

// Check if URL contains pooler
if (!POOLER_URL.includes(":6543")) {
  console.log("⚠️  WARNING: Your URL doesn't use port 6543 (pooler port)");
  console.log("   Make sure you're using the Connection Pooler URL, not direct connection!\n");
}

// Extract hostname for display
const hostnameMatch = POOLER_URL.match(/@([^:]+)/);
const hostname = hostnameMatch ? hostnameMatch[1] : "unknown";

console.log(`📡 Connecting to: ${hostname}`);
console.log(`🔌 Port: ${POOLER_URL.includes(":6543") ? "6543 (Pooler ✅)" : "5432 (Direct ❌)"}\n`);

// Create pool with Vercel-optimized settings
const pool = new Pool({
  connectionString: POOLER_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  query_timeout: 15000,
  statement_timeout: 15000,
  allowExitOnIdle: true,
});

// Test connection
pool.query('SELECT NOW(), version()', async (err, res) => {
  if (err) {
    console.error("❌ Connection FAILED!\n");
    console.error("Error:", err.message);
    console.error("\n📋 Troubleshooting:");
    console.error("  1. Make sure you're using the POOLER URL from Supabase");
    console.error("  2. Get it from: Supabase Dashboard → Settings → Database → Connection Pooling");
    console.error("  3. Use 'Transaction' mode (port 6543)");
    console.error("  4. Check your password is correct in the URL\n");
    process.exit(1);
  } else {
    console.log("✅ Connection SUCCESSFUL!\n");
    console.log(`⏰ Server time: ${res.rows[0].now}`);
    console.log(`📊 Database: ${res.rows[0].version.split(' ')[0]} ${res.rows[0].version.split(' ')[1]}\n`);
    
    // Test query on users table
    try {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users in database: ${usersResult.rows[0].count}\n`);
      
      const linksResult = await pool.query('SELECT COUNT(*) as count FROM short_links');
      console.log(`🔗 Short links in database: ${linksResult.rows[0].count}\n`);
      
      console.log("✅ All tests passed! Your database connection is working.\n");
      console.log("📋 Next steps:");
      console.log("  1. Set this URL in Vercel: vercel env add DATABASE_URL production");
      console.log("  2. Redeploy: vercel --prod");
      console.log("  3. Test your production app\n");
    } catch (queryErr) {
      console.log("⚠️  Connection works but query failed:");
      console.log("   ", queryErr.message);
      console.log("\n   This might mean tables don't exist yet.");
      console.log("   Run migrations if needed.\n");
    }
    
    await pool.end();
    process.exit(0);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error("❌ Connection timeout (30s)");
  console.error("\n📋 Possible issues:");
  console.error("  - Firewall blocking connection");
  console.error("  - Wrong connection URL");
  console.error("  - Supabase project paused\n");
  process.exit(1);
}, 30000);
