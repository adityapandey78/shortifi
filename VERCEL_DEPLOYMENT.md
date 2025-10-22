# 🚀 Vercel Deployment Guide for Shortifi

This guide will walk you through deploying both the frontend (React) and backend (Node.js/Express) to Vercel.

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ A Vercel account (sign up at https://vercel.com)
- ✅ Vercel CLI installed: `npm install -g vercel`
- ✅ A Supabase PostgreSQL database (or any PostgreSQL provider)
- ✅ Google OAuth credentials (if using Google login)
- ✅ Gmail App Password (if using email verification)
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

---

## 🎯 Deployment Strategy

We'll deploy **two separate Vercel projects**:

1. **Frontend (Client)** - React app with Vite
2. **Backend (Server)** - Node.js/Express API

---

## 📦 Step 1: Prepare Your Code

### 1.1 Push to Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/shortifi.git

# Push
git push -u origin main
```

### 1.2 Verify Configuration Files

Make sure these files exist:
- ✅ `client/vercel.json`
- ✅ `server/vercel.json`
- ✅ `server/.env.production.example`

---

## 🎨 Step 2: Deploy Frontend (Client)

### 2.1 Login to Vercel

```bash
vercel login
```

### 2.2 Deploy Frontend

```bash
# Navigate to client folder
cd client

# Deploy to Vercel
vercel

# Follow the prompts:
# ? Set up and deploy "~/shortifi/client"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? shortifi-client
# ? In which directory is your code located? ./
```

### 2.3 Configure Frontend Environment Variables

After deployment, add environment variables in Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add:

```env
VITE_API_URL=https://shortifi-api.vercel.app
```

### 2.4 Deploy to Production

```bash
# Deploy to production
vercel --prod
```

**🎉 Frontend deployed!** Your URL will be something like:
`https://shortifi-client.vercel.app`

---

## ⚙️ Step 3: Deploy Backend (Server)

### 3.1 Deploy Backend

```bash
# Navigate to server folder
cd ../server

# Deploy to Vercel
vercel

# Follow the prompts:
# ? Set up and deploy "~/shortifi/server"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? shortifi-api
# ? In which directory is your code located? ./
```

### 3.2 Configure Backend Environment Variables

Go to Vercel Dashboard → Your Backend Project → **Settings** → **Environment Variables**

Add ALL these variables (copy from `.env.production.example`):

#### **Database** (Required)
```env
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

#### **JWT** (Required)
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### **Server** (Required)
```env
PORT=3000
NODE_ENV=production
CLIENT_URL=https://shortifi-client.vercel.app
```

#### **Google OAuth** (Required for Google login)
```env
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://shortifi-api.vercel.app/auth/google/callback
```

#### **Email SMTP** (Required for email verification)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=noreply@shortifi.com
EMAIL_NAME=Shortifi
```

#### **Session** (Required)
```env
SESSION_SECRET=your-session-secret-min-32-chars
APP_NAME=Shortifi
APP_URL=https://shortifi-client.vercel.app
```

### 3.3 Deploy Backend to Production

```bash
# Deploy to production
vercel --prod
```

**🎉 Backend deployed!** Your API URL will be something like:
`https://shortifi-api.vercel.app`

---

## 🔗 Step 4: Update CORS and URLs

### 4.1 Update Backend CORS

The backend should now accept requests from your frontend domain. Check `server/app.js`:

```javascript
// CORS configuration for API routes
app.use('/api', cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4.2 Update Frontend API URL

Update `client/.env` or environment variable in Vercel:

```env
VITE_API_URL=https://shortifi-api.vercel.app
```

### 4.3 Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   ```
   https://shortifi-api.vercel.app/auth/google/callback
   ```
5. Add authorized JavaScript origins:
   ```
   https://shortifi-client.vercel.app
   https://shortifi-api.vercel.app
   ```

---

## 🔄 Step 5: Link Frontend to Backend

### 5.1 Update Frontend Environment

In Vercel Dashboard → Frontend Project → **Settings** → **Environment Variables**:

```env
VITE_API_URL=https://shortifi-api.vercel.app
```

### 5.2 Redeploy Frontend

```bash
cd client
vercel --prod
```

---

## 🧪 Step 6: Test Your Deployment

### Test Checklist:

1. ✅ Frontend loads: Visit `https://shortifi-client.vercel.app`
2. ✅ Register new user
3. ✅ Login with email/password
4. ✅ Login with Google (if configured)
5. ✅ Create short link
6. ✅ View links on Dashboard
7. ✅ Edit link
8. ✅ Delete link
9. ✅ Copy link
10. ✅ Test short URL redirect

---

## 🐛 Troubleshooting

### Issue: "Network Error" or CORS Error

**Solution:**
1. Check `CLIENT_URL` in backend env vars matches frontend domain
2. Verify CORS configuration in `server/app.js`
3. Check browser console for exact error

### Issue: "Database connection failed"

**Solution:**
1. Verify `DATABASE_URL` is correct in Vercel backend env vars
2. Make sure Supabase allows connections from `0.0.0.0/0` (all IPs)
3. Check Supabase connection pooler is used (port 6543)

### Issue: "Google OAuth doesn't work"

**Solution:**
1. Update Google Cloud Console authorized URIs
2. Check `GOOGLE_REDIRECT_URI` matches exactly
3. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### Issue: "Email verification not sending"

**Solution:**
1. Verify Gmail App Password (not regular password)
2. Check SMTP settings in env vars
3. Look at Vercel function logs for errors

### Issue: "500 Internal Server Error"

**Solution:**
1. Check Vercel function logs: Dashboard → Project → **Functions**
2. Look for specific error messages
3. Verify all required env vars are set

---

## 📝 Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to Project Settings → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CLIENT_URL` and `APP_URL` to your custom domain

### Enable Analytics (Optional)

1. Go to Project Settings → **Analytics**
2. Enable Vercel Analytics
3. Add to your React app:
   ```bash
   npm install @vercel/analytics
   ```

### Performance Monitoring

- Check **Speed Insights** in Vercel Dashboard
- Monitor **Function Logs** for backend errors
- Use **Real-Time** logs during development

---

## 🔐 Security Checklist

Before going live:

- ✅ Change all default secrets (`JWT_SECRET`, `SESSION_SECRET`)
- ✅ Use strong passwords (min 32 characters)
- ✅ Enable 2FA on Vercel account
- ✅ Set up proper CORS origins
- ✅ Review Google OAuth consent screen
- ✅ Enable HTTPS only
- ✅ Add rate limiting (optional)
- ✅ Set up monitoring and alerts

---

## 🎉 You're Live!

Your Shortifi app is now deployed on Vercel! 

- **Frontend**: `https://shortifi-client.vercel.app`
- **Backend**: `https://shortifi-api.vercel.app`

### Next Steps:

1. Share your app with users
2. Monitor logs and analytics
3. Set up custom domain
4. Enable CI/CD with Git integration
5. Add more features!

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)

---

## 💬 Need Help?

- Check Vercel Function Logs
- Review browser console errors
- Check database connection status
- Verify all environment variables

**Good luck with your deployment! 🚀**
