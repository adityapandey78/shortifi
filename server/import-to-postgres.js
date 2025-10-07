import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function importData() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to PostgreSQL (Supabase)\n');

    const exportDir = './mysql-exports';
    
    // Import order matters due to foreign keys
    const importOrder = [
      'users',
      'sessions',
      'short_links',
      'oauth_accounts',
      'is_email_valid'
    ];

    await client.query('BEGIN');

    for (const tableName of importOrder) {
      const filePath = path.join(exportDir, `${tableName}.json`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`No export file for ${tableName}, skipping`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      if (data.length === 0) {
        console.log(`Table ${tableName} has no data, skipping`);
        continue;
      }

      console.log(`Importing ${tableName}... (${data.length} rows)`);

      // Handle each table specifically
      switch (tableName) {
        case 'users':
          for (const row of data) {
            await client.query(
              `INSERT INTO users (id, name, email, password, is_email_valid, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (id) DO NOTHING`,
              [row.id, row.name, row.email, row.password, Boolean(row.isEmailValid || row.is_email_valid), row.createdAt || row.created_at, row.updatedAt || row.updated_at]
            );
          }
          // Update sequence
          await client.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);
          break;

        case 'sessions':
          for (const row of data) {
            await client.query(
              `INSERT INTO sessions (id, user_id, valid, user_agent, ip, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (id) DO NOTHING`,
              [row.id, row.userId || row.user_id, Boolean(row.valid), row.userAgent || row.user_agent, row.ip, row.createdAt || row.created_at, row.updatedAt || row.updated_at]
            );
          }
          await client.query(`SELECT setval('sessions_id_seq', (SELECT MAX(id) FROM sessions))`);
          break;

        case 'short_links':
          for (const row of data) {
            // Skip rows with invalid user_id
            const userId = row.userId || row.user_id;
            if (!userId || userId === 0) {
              console.log(`Skipping short_link ${row.id} with invalid user_id: ${userId}`);
              continue;
            }
            
            await client.query(
              `INSERT INTO short_links (id, "shortCode", url, user_id, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (id) DO NOTHING`,
              [row.id, row.shortCode, row.url, userId, row.createdAt || row.created_at, row.updatedAt || row.updated_at]
            );
          }
          await client.query(`SELECT setval('short_links_id_seq', (SELECT MAX(id) FROM short_links))`);
          break;

        case 'oauth_accounts':
          for (const row of data) {
            await client.query(
              `INSERT INTO oauth_accounts (id, user_id, provider, provider_account_id, created_at)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (id) DO NOTHING`,
              [row.id, row.userId || row.user_id, row.provider, row.providerAccountId || row.provider_account_id, row.createdAt || row.created_at]
            );
          }
          await client.query(`SELECT setval('oauth_accounts_id_seq', (SELECT MAX(id) FROM oauth_accounts))`);
          break;

        case 'is_email_valid':
          for (const row of data) {
            await client.query(
              `INSERT INTO is_email_valid (id, user_id, token, expires_at, created_at)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (id) DO NOTHING`,
              [row.id, row.userId || row.user_id, row.token, row.expiresAt || row.expires_at, row.createdAt || row.created_at]
            );
          }
          await client.query(`SELECT setval('is_email_valid_id_seq', (SELECT MAX(id) FROM is_email_valid))`);
          break;
      }

      console.log(`Imported ${data.length} rows into ${tableName}`);
    }

    await client.query('COMMIT');
    console.log('\n All data imported successfully!');
    
    // Show summary
    console.log('\n Summary:');
    const tables = ['users', 'sessions', 'short_links', 'oauth_accounts', 'is_email_valid'];
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`  ${table}: ${result.rows[0].count} rows`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n Import failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

importData();
