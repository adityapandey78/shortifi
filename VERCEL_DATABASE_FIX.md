# 🔧 Vercel Database Connection Fix

## Problem
Your Vercel deployment shows: `ENOTFOUND db.vokbvbdzvturbvmcuocz.supabase.co`

This happens because **Supabase requires a different connection string for serverless environments like Vercel**.

---

## ✅ Solution: Use Supabase Connection Pooler

### Step 1: Get Your Supabase Pooler URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection Pooling**
5. Copy the **Connection string** in **Transaction mode**
6. It should look like:
   ```
   postgresql://postgres.vokbvbdzvturbvmcuocz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 2: Set Environment Variables in Vercel

Run these commands in PowerShell (replace with your actual values):

```powershell
# Navigate to your project
cd "D:\Coding\Development\ProjctsOP\shortifi"

# Set the POOLER URL (use Transaction mode, port 6543)
vercel env add DATABASE_URL production

# When prompted, paste your pooler URL:
# postgresql://postgres.vokbvbdzvturbvmcuocz:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Set FRONTEND_URL
vercel env add FRONTEND_URL production
# Enter: https://shortifi-sand.vercel.app

# Set JWT_SECRET
vercel env add JWT_SECRET production
# Enter: flGu8NqvaHGVJ8X9Nsx9zDxk3a/EaRupCOXv4ATW16YU1/xqhiSRVXz/1L1br3MSHLvY0o30VXN2r9ryvni2cw==

# Set SMTP credentials
vercel env add SMTP_HOST production
# Enter: smtp.gmail.com

vercel env add SMTP_PORT production
# Enter: 465

vercel env add SMTP_USER production
# Enter: pandeyernest@gmail.com

vercel env add SMTP_PASS production
# Enter: qduvvudiphbmztox

vercel env add FROM_NAME production
# Enter: URL_Shortener

# Set Google OAuth
vercel env add GOOGLE_CLIENT_ID production
# Enter: 1000834607535-btcbq5epaf3l9rpprjgj9htpjgqiki8c.apps.googleusercontent.com

vercel env add GOOGLE_CLIENT_SECRET production
# Enter: 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

vercel env add NODE_ENV production
# Enter: production
```

### Step 3: Update Google OAuth Callback

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://shortifi-sand.vercel.app/google/callback
   ```
4. Remove or keep the localhost one for development
5. Click **Save**

### Step 4: Redeploy

```powershell
# Trigger a redeployment to pick up the new environment variables
vercel --prod
```

---

## 🎯 Quick One-Liner (Alternative)

If you have `.env` file ready, you can pull all at once:

```powershell
# This will prompt you for each variable
vercel env pull .env.production
```

---

## 📝 Important Notes

### Why Connection Pooler?

- **Regular URL** (port 5432): Direct connection, not suitable for serverless
- **Pooler URL** (port 6543): Transaction mode, optimized for Vercel/serverless

### Database URL Formats:

```bash
# ❌ DON'T USE (Direct connection - causes ENOTFOUND)
postgresql://postgres:[PASSWORD]@db.vokbvbdzvturbvmcuocz.supabase.co:5432/postgres

# ✅ USE THIS (Pooler - works with Vercel)
postgresql://postgres.vokbvbdzvturbvmcuocz:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Verify Environment Variables

After setting them, verify in Vercel Dashboard:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Ensure all variables are set for **Production**

---

## 🧪 Test After Deployment

1. Visit: `https://shortifi-sand.vercel.app/api/auth/register`
2. Try to register a new user
3. Check Vercel logs - should NOT see `ENOTFOUND` errors

---

## 🔍 Troubleshooting

If still getting errors:

1. **Check Supabase Logs**: [Supabase Dashboard](https://supabase.com/dashboard) → Logs
2. **Verify Pooler URL**: Make sure it's port **6543** not 5432
3. **Check Password**: Ensure no special characters are breaking the URL
4. **IPv6 Issue**: Some networks block IPv6, try using IPv4 pooler if available

---

## 📞 Need Help?

Check Vercel deployment logs:
```powershell
vercel logs --prod
```

Or check specific function logs in Vercel Dashboard → Deployments → Select deployment → Functions
