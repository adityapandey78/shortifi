// Quick database connection test
import pkg from "pg";
const { Client } = pkg;

const DATABASE_URL = 'postgresql://postgres:XlepzDIq2Z7VVzpv@db.vokbvbdzvturbvmcuocz.supabase.co:5432/postgres';
const POOLER_URL = 'postgresql://postgres.vokbvbdzvturbvmcuocz:XlepzDIq2Z7VVzpv@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('Testing database connections...\n');

// Test direct connection
async function testDirect() {
  console.log('📡 Testing DATABASE_URL (Direct Connection)...');
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW(), version()');
    console.log('✅ Direct connection SUCCESS!');
    console.log('   Time:', result.rows[0].now);
    console.log('   Version:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Direct connection FAILED!');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    return false;
  }
}

// Test pooler connection
async function testPooler() {
  console.log('\n📡 Testing DATABASE_POOLER_URL (Pooler Connection)...');
  const client = new Client({
    connectionString: POOLER_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Pooler connection SUCCESS!');
    console.log('   Time:', result.rows[0].now);
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Pooler connection FAILED!');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    return false;
  }
}

// Run tests
(async () => {
  const directOk = await testDirect();
  const poolerOk = await testPooler();
  
  console.log('\n' + '='.repeat(50));
  if (directOk || poolerOk) {
    console.log('✅ At least one connection works!');
    if (poolerOk) {
      console.log('💡 Recommendation: Use DATABASE_POOLER_URL in your app');
    }
  } else {
    console.log('❌ Both connections failed!');
    console.log('\n🔧 Possible fixes:');
    console.log('   1. Check if Supabase project is paused (free tier)');
    console.log('   2. Verify credentials in Supabase dashboard');
    console.log('   3. Check your internet connection');
    console.log('   4. Try regenerating database password');
  }
  process.exit(0);
})();
