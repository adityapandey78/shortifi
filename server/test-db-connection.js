// Quick test to verify Supabase connection
import pkg from "pg";
const { Client } = pkg;

const testConnection = async () => {
  console.log('🔍 Testing Supabase Connection...\n');
  
  const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:XlepzDIq2Z7VVzpv@db.vokbvbdzvturbvmcuocz.supabase.co:5432/postgres';
  
  console.log('📊 Connection Details:');
  console.log('   URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('\n⏳ Connecting...');
    await client.connect();
    console.log('✅ Connection successful!\n');
    
    const result = await client.query('SELECT NOW(), version()');
    console.log('🕐 Server Time:', result.rows[0].now);
    console.log('📦 PostgreSQL Version:', result.rows[0].version.split(',')[0]);
    
    // Test tables
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    console.log('\n📋 Tables found:', tables.rows.map(r => r.tablename).join(', '));
    
    await client.end();
    console.log('\n✅ Database is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possible fixes:');
      console.error('   1. Check if Supabase project is paused (free tier)');
      console.error('   2. Verify DATABASE_URL is correct');
      console.error('   3. Check your internet connection');
      console.error('   4. Use Supabase connection pooler (port 6543)');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection timeout:');
      console.error('   1. Supabase might be slow to respond');
      console.error('   2. Check firewall/network settings');
      console.error('   3. Use connection pooler for better performance');
    }
    
    process.exit(1);
  }
};

testConnection();
