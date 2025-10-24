# MySQL to PostgreSQL Migration

This project was migrated from MySQL to PostgreSQL. The migration files are preserved in `server/mysql-exports/`.

## Migration Process

### 1. Export MySQL Data
```bash
cd server
node export-mysql-data.js
```
Creates JSON exports in `server/mysql-exports/`:
- `users.json`
- `sessions.json`
- `short_links.json`
- `oauth_accounts.json`

### 2. Update Schema
Updated `server/drizzle/schema.js` from MySQL to PostgreSQL syntax:
- Changed `mysqlTable` → `pgTable`
- Updated column types (e.g., `varchar` → `text`, `datetime` → `timestamp`)
- Added proper PostgreSQL constraints

### 3. Generate Migration
```bash
npm run db:generate
```
Created migration in `server/drizzle/migration/0000_fantastic_ikaris.sql`

### 4. Import to PostgreSQL
```bash
node import-to-postgres.js
```
Imports all data from JSON files to PostgreSQL database.

### 5. Verify Migration
```bash
npm run db:studio
```
Check data in Drizzle Studio UI.

## Database Configuration

**Local Development:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

**Production (Vercel):**
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Files Preserved
- `server/export-mysql-data.js` - MySQL export script
- `server/import-to-postgres.js` - PostgreSQL import script
- `server/mysql-exports/` - JSON data exports
- `server/drizzle/migration-mysql-backup/` - Old MySQL migrations

## Key Changes
- Database driver: `mysql2` → `pg`
- ORM: Drizzle (same, different dialect)
- Schema: Updated for PostgreSQL types
- Connection pooling: Added for serverless (Vercel)
