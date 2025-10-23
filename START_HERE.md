# 🚨 READ THIS FIRST - Vercel Deployment Fix

## ⚡ Quick Summary

Your Vercel deployment is failing with:
```
Error: ENOTFOUND db.vokbvbdzvturbvmcuocz.supabase.co
```

**Reason:** Using direct Supabase connection (port 5432) instead of Connection Pooler (port 6543)

---

## 🎯 3-Step Fix

### 1️⃣ Get Supabase Pooler URL
1. Go to: https://supabase.com/dashboard
2. Settings → Database → **Connection Pooling**
3. Copy the **Transaction** mode URL (port **6543**)

### 2️⃣ Set Environment Variables in Vercel

**Easy way:** Run this script
```powershell
.\set-vercel-env.ps1
```

**Manual way:** Go to Vercel Dashboard → Settings → Environment Variables → Add all variables from QUICK_FIX.md

### 3️⃣ Redeploy
```powershell
vercel --prod
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **QUICK_FIX.md** | ⭐ Start here - Quick reference |
| **VERCEL_ISSUES_RESOLVED.md** | Complete troubleshooting guide |
| **VERCEL_DATABASE_FIX.md** | Database-specific fixes |
| **set-vercel-env.ps1** | Automated environment setup |
| **server/test-pooler-connection.js** | Test database connection |

---

## 🧪 Test Before Deploying

```powershell
cd server
node test-pooler-connection.js
```

Should show:
```
✅ Connection SUCCESSFUL!
```

---

## ✅ After Deploying

1. Visit: https://shortifi-sand.vercel.app
2. Test: Register → Login → Create Link
3. Check logs: `vercel logs --prod`
4. Should NOT see any ENOTFOUND errors

---

## 🆘 Need Help?

1. Read **QUICK_FIX.md** (2 minutes)
2. Check **VERCEL_ISSUES_RESOLVED.md** for detailed steps
3. Verify environment variables are set correctly

---

**Created:** October 22, 2025
**Status:** Ready to fix - Follow the 3 steps above
