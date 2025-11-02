# 🔧 Database Setup Guide

## Problem: "Tenant or user not found" Error

This error means your `DATABASE_URL` in the `.env` file is incorrect or the database doesn't exist.

## ✅ Quick Fix Options

### Option 1: Use Supabase (Recommended - Free Tier Available)

1. **Create a Supabase Account**
   - Go to https://supabase.com
   - Sign up for free

2. **Create a New Project**
   - Click "New Project"
   - Choose a name, password, and region
   - Wait for database to be created (~2 minutes)

3. **Get Your Connection String**
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Copy the **Connection Pooling** URL (for Vercel/production)
   - Format: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

4. **Update Your .env File**
   ```bash
   # Direct connection (for local development)
   DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   
   # Connection pooler (for production/Vercel)
   DATABASE_POOLER_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

5. **Replace placeholders:**
   - `[REF]` = Your project reference (e.g., `abcdefghijklm`)
   - `[PASSWORD]` = Your database password
   - `[REGION]` = Your region (e.g., `us-east-1`)

### Option 2: Use Neon (Free Tier, Serverless)

1. **Create Account**
   - Go to https://neon.tech
   - Sign up for free

2. **Create Project**
   - Click "Create Project"
   - Choose a name and region

3. **Copy Connection String**
   - Format: `postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require`

4. **Update .env**
   ```bash
   DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
   ```

### Option 3: Local PostgreSQL

1. **Install PostgreSQL**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Start PostgreSQL**
   ```bash
   # Windows (as service - should auto-start)
   # Mac
   brew services start postgresql
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create Database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE shortifi;
   
   # Exit
   \q
   ```

4. **Update .env**
   ```bash
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/shortifi
   ```

## 🚀 After Setting Up Database

1. **Run Migration**
   ```bash
   cd server
   npm run db:migrate
   ```

2. **Start Server**
   ```bash
   npm run dev
   ```

3. **You Should See:**
   ```
   [DB] ✅ Database connected successfully at: 2025-11-02...
   Server running at http://localhost:3000
   ```

## 🐛 Common Issues

### Error: "password authentication failed"
- **Fix:** Check your password in DATABASE_URL
- Make sure special characters are URL-encoded

### Error: "ECONNREFUSED"
- **Fix:** PostgreSQL is not running
- Start PostgreSQL service

### Error: "database does not exist"
- **Fix:** Create the database first
- Or use the database name from your provider

### Error: "SSL required"
- **Fix:** Add `?sslmode=require` to your DATABASE_URL
- Example: `postgresql://user:pass@host:5432/db?sslmode=require`

## 📝 Current Server Status

✅ Server will now start even if database connection fails  
⚠️ Database operations will fail until you fix the connection  
🔧 Fix your DATABASE_URL in the `.env` file  

## 🎯 Recommended: Supabase

For this project, I recommend **Supabase** because:
- ✅ Free tier (500MB database)
- ✅ Connection pooling built-in
- ✅ Works great with Vercel
- ✅ PostgreSQL compatible
- ✅ Easy setup (2 minutes)
- ✅ Great for portfolio projects

## Need Help?

1. Check your `.env` file exists in `server/` folder
2. Make sure `DATABASE_URL` is set correctly
3. Test connection: `psql "your_database_url_here"`
4. Check server logs for specific error codes
