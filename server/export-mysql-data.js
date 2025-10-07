import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'url_shortner_mysql',
};

async function exportData() {
  let connection;
  
  try {
    // Create exports directory
    const exportDir = './mysql-exports';
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Connect to MySQL
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✓ Connected to MySQL');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log(`\nFound ${tableNames.length} tables:`, tableNames.join(', '));

    // Export each table
    for (const tableName of tableNames) {
      console.log(`\nExporting ${tableName}...`);
      
      const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
      
      if (rows.length === 0) {
        console.log(`  ⚠ Table ${tableName} is empty, skipping`);
        continue;
      }

      // Save as JSON for easy import
      const filePath = path.join(exportDir, `${tableName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
      
      console.log(`  ✓ Exported ${rows.length} rows to ${filePath}`);
    }

    console.log('\n✅ Export completed successfully!');
    console.log(`\nExported files are in: ${path.resolve(exportDir)}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

exportData();
