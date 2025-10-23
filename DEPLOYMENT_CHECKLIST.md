# Vercel Deployment Checklist

## ⚠️ CURRENT ISSUE: Database Connection Error

**Status:** ENOTFOUND db.vokbvbdzvturbvmcuocz.supabase.co
**Solution:** See `QUICK_FIX.md` or `VERCEL_ISSUES_RESOLVED.md`
**Required:** Use Supabase Connection Pooler (port 6543) instead of direct connection (port 5432)

---

Use this checklist to ensure a smooth deployment.

## 📋 Pre-Deployment

### Code Preparation
- [x] All code committed to Git repository
- [x] Repository pushed to GitHub/GitLab/Bitbucket
- [x] `client/vercel.json` exists
- [x] `server/vercel.json` exists
- [x] `server/app.js` exports default app
- [x] No sensitive data in code (all in `.env`)

### Database Setup
- [x] PostgreSQL database created (Supabase)
- [ ] **🔥 CRITICAL: Database POOLER URL copied (port 6543)**
- [ ] **🔥 CRITICAL: Using connection pooler (port 6543 for Supabase)**
- [ ] Database accessible from anywhere (0.0.0.0/0)

### Google OAuth (if using)
- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Secret copied
- [ ] Authorized redirect URIs will be updated after deployment

### Email Setup (if using)
- [ ] Gmail account ready
- [ ] Gmail App Password generated (not regular password)
- [ ] SMTP settings documented

### Secrets Generated
- [ ] JWT_SECRET generated (min 32 chars): `openssl rand -base64 32`
- [ ] SESSION_SECRET generated (min 32 chars): `openssl rand -base64 32`

---

## 🎨 Frontend Deployment

### Deploy
- [ ] `cd client`
- [ ] `vercel login` (if not already logged in)
- [ ] `vercel` (initial deployment)
- [ ] Note the deployment URL

### Environment Variables
- [ ] Add `VITE_API_URL` (will be backend URL)

### Production Deploy
- [ ] `vercel --prod`
- [ ] Copy production URL: `https://[project].vercel.app`

---

## ⚙️ Backend Deployment

### Deploy
- [ ] `cd server`
- [ ] `vercel` (initial deployment)
- [ ] Note the deployment URL

### Environment Variables
Add ALL these in Vercel Dashboard:

#### Required
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRES_IN` (15m)
- [ ] `JWT_REFRESH_EXPIRES_IN` (7d)
- [ ] `SESSION_SECRET`
- [ ] `NODE_ENV` (production)
- [ ] `PORT` (3000)
- [ ] `CLIENT_URL` (frontend URL from above)
- [ ] `APP_URL` (frontend URL)
- [ ] `APP_NAME` (Shortifi)

#### OAuth (if using)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REDIRECT_URI` (https://[backend-url]/auth/google/callback)

#### Email (if using)
- [ ] `SMTP_HOST` (smtp.gmail.com)
- [ ] `SMTP_PORT` (465)
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS` (App Password)
- [ ] `EMAIL_FROM`
- [ ] `EMAIL_NAME`

### Production Deploy
- [ ] `vercel --prod`
- [ ] Copy production URL: `https://[project].vercel.app`

---

## 🔗 Post-Deployment Configuration

### Update Frontend
- [ ] Update `VITE_API_URL` to backend production URL
- [ ] Redeploy frontend: `vercel --prod`

### Update Google OAuth
- [ ] Go to Google Cloud Console → Credentials
- [ ] Edit OAuth 2.0 Client
- [ ] Add Authorized redirect URIs:
  - [ ] `https://[backend-url]/auth/google/callback`
- [ ] Add Authorized JavaScript origins:
  - [ ] `https://[frontend-url]`
  - [ ] `https://[backend-url]`
- [ ] Save changes

### Update Backend Environment
- [ ] Verify `CLIENT_URL` matches frontend production URL
- [ ] Verify `GOOGLE_REDIRECT_URI` matches backend URL
- [ ] Redeploy backend if changed: `vercel --prod`

---

## 🧪 Testing

### Frontend Tests
- [ ] Homepage loads
- [ ] Theme toggle works
- [ ] Navigation works

### Authentication Tests
- [ ] Register new user
- [ ] Login with email/password
- [ ] Login with Google (if configured)
- [ ] Email verification (if configured)
- [ ] Logout works

### Short Links Tests
- [ ] Create short link without custom code
- [ ] Create short link with custom code
- [ ] View links on Dashboard
- [ ] Edit link
- [ ] Delete link
- [ ] Copy link to clipboard
- [ ] Short URL redirects correctly

### API Tests
- [ ] Check `/api/auth/me` endpoint
- [ ] Check `/api/links` endpoint
- [ ] Verify CORS working

---

## 🐛 Troubleshooting

If you encounter issues:

### Check Vercel Logs
- [ ] Frontend: Dashboard → Project → Functions
- [ ] Backend: Dashboard → Project → Functions
- [ ] Look for specific error messages

### Common Issues
- [ ] **CORS Error**: Verify `CLIENT_URL` matches frontend domain
- [ ] **Database Error**: Check `DATABASE_URL` format and IP whitelist
- [ ] **OAuth Error**: Verify redirect URIs in Google Console
- [ ] **Email Error**: Check Gmail App Password (not regular password)
- [ ] **500 Error**: Check function logs for specific error

### Verify Environment Variables
- [ ] All required variables set in Vercel Dashboard
- [ ] No typos in variable names
- [ ] No extra spaces in values
- [ ] URLs include `https://` prefix

---

## ✅ Final Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Database connected
- [ ] Authentication working
- [ ] Short links creating and redirecting
- [ ] Google OAuth working (if configured)
- [ ] Email verification working (if configured)
- [ ] All tests passed
- [ ] No errors in Vercel logs

---

## 📝 Post-Launch

### Optional Enhancements
- [ ] Add custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up monitoring alerts
- [ ] Enable Web Vitals tracking
- [ ] Configure CDN caching
- [ ] Add rate limiting

### Security Review
- [ ] All secrets are strong (32+ chars)
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] OAuth consent screen reviewed
- [ ] Database IP restrictions reviewed

---

## 🎉 Deployment Complete!

**Frontend URL**: `https://[your-frontend].vercel.app`  
**Backend URL**: `https://[your-backend].vercel.app`

Save these URLs for future reference!

---

**Need help?** Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.
