# Quick Fix for Vercel Database Connection Issue

## 🎯 The Problem
`ENOTFOUND db.vokbvbdzvturbvmcuocz.supabase.co` means Vercel can't connect to your database.

## ✅ The Solution
Use Supabase's **Connection Pooler** (port 6543) instead of direct connection (port 5432).

---

## 🚀 Step-by-Step Fix

### 1. Get Your Supabase Pooler URL

1. Go to https://supabase.com/dashboard
2. Select your project
3. **Settings** → **Database** → Scroll to **Connection Pooling**
4. Copy the **Transaction** mode URL (should have port **6543**)

Example:
```
postgresql://postgres.vokbvbdzvturbvmcuocz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 2. Set in Vercel (Choose One Method)

#### Method A: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Select your `shortifi` project
3. **Settings** → **Environment Variables**
4. Click **Add New**
5. Add these variables for **Production**:

```
DATABASE_URL = postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
FRONTEND_URL = https://shortifi-sand.vercel.app
NODE_ENV = production
JWT_SECRET = flGu8NqvaHGVJ8X9Nsx9zDxk3a/EaRupCOXv4ATW16YU1/xqhiSRVXz/1L1br3MSHLvY0o30VXN2r9ryvni2cw==
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 465
SMTP_USER = pandeyernest@gmail.com
SMTP_PASS = qduvvudiphbmztox
FROM_NAME = URL_Shortener
GOOGLE_CLIENT_ID = 1000834607535-btcbq5epaf3l9rpprjgj9htpjgqiki8c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
```

#### Method B: Via CLI
Run this PowerShell script (saved as `set-vercel-env.ps1`):
```powershell
.\set-vercel-env.ps1
```

### 3. Update Google OAuth Redirect URI

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://shortifi-sand.vercel.app/google/callback
   ```
4. **Save**

### 4. Redeploy

```powershell
vercel --prod
```

---

## 🧪 Verify It Works

After redeployment, check:
1. Visit: https://shortifi-sand.vercel.app
2. Try to register/login
3. Check Vercel logs: `vercel logs --prod`
4. Should NOT see `ENOTFOUND` errors anymore

---

## 📊 Key Differences

| Type | Port | Use Case | Vercel Compatible |
|------|------|----------|-------------------|
| Direct Connection | 5432 | Long-running servers | ❌ No (causes ENOTFOUND) |
| Connection Pooler (Transaction) | 6543 | Serverless/Vercel | ✅ Yes |
| Connection Pooler (Session) | 6543 | Prepared statements | ⚠️ Maybe |

**Always use Transaction mode (port 6543) for Vercel!**

---

## 🔧 Troubleshooting

### Still Getting ENOTFOUND?
- Double-check you're using port **6543** not 5432
- Verify the pooler hostname (should be `pooler.supabase.com`)
- Make sure environment variables are set for **Production** environment

### Database Timeout?
- Check Supabase project is not paused
- Verify connection pooler is enabled
- Check Supabase logs for connection attempts

### OAuth Redirect Mismatch?
- Ensure Google Console has the correct redirect URI
- Match exactly: `https://shortifi-sand.vercel.app/google/callback`
- No trailing slash!
