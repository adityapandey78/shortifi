# 🚨 Vercel Deployment Issues - RESOLVED

## Issues Identified

### 1. ❌ Database Connection Error
**Error:** `ENOTFOUND db.vokbvbdzvturbvmcuocz.supabase.co`

**Root Cause:** 
- Using **direct connection** (port 5432) instead of **connection pooler** (port 6543)
- Vercel's serverless functions can't establish persistent connections to Supabase
- Missing environment variables in Vercel

**Solution:**
- Use Supabase Connection Pooler URL (Transaction mode, port 6543)
- Set all environment variables in Vercel Dashboard

### 2. ✅ Google OAuth Callback
**Status:** Already configured correctly! ✅
- Using `FRONTEND_URL` environment variable in `server/lib/oauth/google.js`
- Will automatically use correct URL when `FRONTEND_URL` is set in Vercel

---

## 🎯 How to Fix (3 Simple Steps)

### Step 1: Get Supabase Pooler URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Settings** → **Database**
4. Scroll to **Connection Pooling** section
5. Copy the **Transaction** mode connection string

**Example format:**
```
postgresql://postgres.vokbvbdzvturbvmcuocz:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Key points:**
- Must use port **6543** (pooler) not 5432 (direct)
- Hostname should be `pooler.supabase.com`
- Use **Transaction** mode, not Session mode

### Step 2: Set Vercel Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your `shortifi` project
3. Go to: **Settings** → **Environment Variables**
4. Add the following for **Production** environment:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.xxx:[PASSWORD]@pooler.supabase.com:6543/postgres` |
| `FRONTEND_URL` | `https://shortifi-sand.vercel.app` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `flGu8NqvaHGVJ8X9Nsx9zDxk3a/EaRupCOXv4ATW16YU1/xqhiSRVXz/1L1br3MSHLvY0o30VXN2r9ryvni2cw==` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `pandeyernest@gmail.com` |
| `SMTP_PASS` | `qduvvudiphbmztox` |
| `FROM_NAME` | `URL_Shortener` |
| `GOOGLE_CLIENT_ID` | `1000834607535-btcbq5epaf3l9rpprjgj9htpjgqiki8c.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |

**Option B: Via PowerShell Script**

```powershell
# Run the automated script
.\set-vercel-env.ps1
```

### Step 3: Update Google OAuth & Redeploy

**Update Google Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://shortifi-sand.vercel.app/google/callback
   ```
4. Click **Save**

**Redeploy to Vercel:**
```powershell
cd "D:\Coding\Development\ProjctsOP\shortifi"
vercel --prod
```

---

## 🧪 Testing & Verification

### Local Test (Optional)
Test the pooler connection locally first:

```powershell
cd server
node test-pooler-connection.js
```

Should output:
```
✅ Connection SUCCESSFUL!
⏰ Server time: ...
📊 Database: PostgreSQL ...
👥 Users in database: X
🔗 Short links in database: Y
```

### Production Test
After deployment:

1. Visit: `https://shortifi-sand.vercel.app`
2. Try to **Register** a new user
3. Try to **Login**
4. Try to **Create a short link**
5. Check Vercel logs: `vercel logs --prod`

**Success indicators:**
- ✅ No more `ENOTFOUND` errors
- ✅ User registration works
- ✅ Login works
- ✅ Database queries execute successfully

---

## 📊 Technical Details

### Why Connection Pooler?

| Connection Type | Port | Suitable for Vercel | Reason |
|----------------|------|---------------------|--------|
| **Direct Connection** | 5432 | ❌ No | Requires persistent connections; serverless functions are ephemeral |
| **Pooler (Transaction)** | 6543 | ✅ Yes | Optimized for serverless; handles connection pooling automatically |
| **Pooler (Session)** | 6543 | ⚠️ Maybe | For prepared statements; not ideal for serverless |

### Files Modified
- ✅ `server/config/db-client.js` - Already configured for production with SSL
- ✅ `server/lib/oauth/google.js` - Already using `FRONTEND_URL` variable
- ✅ `server/config/env.js` - Already has all env variable schemas

**No code changes needed!** Just environment configuration.

---

## 🔍 Troubleshooting

### Still Getting ENOTFOUND?

**Check these:**
1. ✅ Using port 6543 (pooler) not 5432
2. ✅ Hostname is `pooler.supabase.com`
3. ✅ Environment variable is set for **Production** (not Preview/Development)
4. ✅ Redeployed after setting env vars

**Verify env vars:**
```powershell
vercel env ls
```

### Database Timeout?

**Possible causes:**
- Supabase project is paused (free tier)
- Connection pooler is disabled
- Firewall/network issue

**Check:**
- Supabase Dashboard → Project Settings → ensure project is active
- Connection Pooling is enabled in Supabase

### OAuth Redirect Mismatch?

**Ensure:**
- Google Console redirect URI: `https://shortifi-sand.vercel.app/google/callback`
- No trailing slash
- Exact match (HTTPS, not HTTP)

---

## 📝 Summary

### What Was Wrong:
1. ❌ Using direct Supabase connection (port 5432) - doesn't work with Vercel serverless
2. ❌ Missing environment variables in Vercel production

### What's Fixed:
1. ✅ Instructions to use Supabase Connection Pooler (port 6543)
2. ✅ Scripts and docs to set all required environment variables
3. ✅ OAuth callback already configured correctly

### Files Created:
- `QUICK_FIX.md` - Quick reference guide
- `VERCEL_DATABASE_FIX.md` - Detailed troubleshooting
- `set-vercel-env.ps1` - PowerShell script to automate env setup
- `server/test-pooler-connection.js` - Test connection locally

---

## 🚀 Next Steps

1. **Get your Supabase Pooler URL** (Step 1 above)
2. **Set environment variables in Vercel** (Step 2 above)
3. **Update Google OAuth redirect URI** (Step 3 above)
4. **Redeploy:** `vercel --prod`
5. **Test:** Visit https://shortifi-sand.vercel.app

**Expected result:** All database operations work, no more ENOTFOUND errors! ✨
