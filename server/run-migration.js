// Quick migration runner
import pkg from "pg";
import fs from "fs";
const { Client } = pkg;

const POOLER_URL = process.env.DATABASE_POOLER_URL || 'postgresql://postgres.vokbvbdzvturbvmcuocz:XlepzDIq2Z7VVzpv@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('🚀 Running manual migration...\n');

const migrationSQL = `
CREATE TABLE IF NOT EXISTS "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"ip" varchar(45),
	"user_agent" text,
	"referer" varchar(1024),
	"device_type" varchar(50),
	"device_vendor" varchar(100),
	"device_model" varchar(100),
	"browser" varchar(50),
	"browser_version" varchar(50),
	"os" varchar(50),
	"os_version" varchar(50),
	"country" varchar(100),
	"region" varchar(100),
	"city" varchar(100),
	"timezone" varchar(100),
	"clicked_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "short_links" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "short_links" ADD COLUMN IF NOT EXISTS "password" varchar(255);
ALTER TABLE "short_links" ADD COLUMN IF NOT EXISTS "click_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "short_links" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'analytics_link_id_short_links_id_fk'
    ) THEN
        ALTER TABLE "analytics" ADD CONSTRAINT "analytics_link_id_short_links_id_fk" 
        FOREIGN KEY ("link_id") REFERENCES "public"."short_links"("id") 
        ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
`;

async function runMigration() {
  const client = new Client({
    connectionString: POOLER_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    console.log('📝 Running migration SQL...');
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n🎉 All tables and columns created!');
    console.log('   - analytics table created');
    console.log('   - short_links.expires_at added');
    console.log('   - short_links.password added');
    console.log('   - short_links.click_count added');
    console.log('   - short_links.is_active added');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) console.error('   Error code:', error.code);
    process.exit(1);
  }
}

runMigration();
