# Shortifi Server

Node.js backend for the Shortifi URL Shortener.

## Tech Stack

- Node.js + Express
- PostgreSQL + Drizzle ORM
- JWT (access + refresh tokens)
- Google OAuth (PKCE)
- Nodemailer (email verification)
- Argon2 (password hashing)

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run db:generate
npm run db:migrate
npm run dev
```

Server runs on `http://localhost:3000`

## Environment Variables

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_NAME=Shortifi
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

See `.env.example` for details.

## Project Structure

```
server/
├── app.js                # Express app
├── config/               # Configuration
│   ├── db-client.js     # Database connection
│   ├── env.js           # Environment variables
│   └── constants.js     # Constants
├── controllers/          # Request handlers
│   ├── api-auth.controller.js
│   └── api-shortner.controller.js
├── services/            # Business logic
│   ├── auth.services.js
│   └── shortner.services.js
├── routes/              # API routes
│   ├── api-auth.routes.js
│   └── api-shortner.routes.js
├── middlewares/         # Middleware
│   └── verify-auth.middleware.js
├── validators/          # Request validation
│   ├── auth-validator.js
│   └── shortner-validator.js
├── drizzle/             # Database
│   ├── schema.js        # Schema definitions
│   └── migration/       # Migrations
├── lib/                 # Utilities
│   ├── oauth/google.js  # Google OAuth
│   ├── nodemailer.js    # Email config
│   └── send-email.js    # Email sender
└── emails/              # Email templates
    └── verify-email.mjml
```

## Database Schema

**Tables:**

- `users` - User accounts
- `sessions` - Active sessions
- `short_links` - Shortened URLs
- `oauth_accounts` - OAuth providers
- `verify_email_tokens` - Email verification tokens

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/verify-email` - Verify email with token
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - OAuth callback

### Short Links

- `GET /api/shortner` - Get user's links
- `POST /api/shortner` - Create short link
- `PUT /api/shortner/:id` - Update link
- `DELETE /api/shortner/:id` - Delete link

### Redirect

- `GET /:shortcode` - Redirect to original URL

## Authentication Flow

1. User logs in
2. Server creates session in DB
3. Issues JWT cookies: `access_token` (15min) + `refresh_token` (7d)
4. Middleware verifies tokens on each request
5. Auto-refreshes expired access tokens
6. Logout clears session and cookies

## Database Commands

**Generate migration:**
```bash
npm run db:generate
```

**Run migrations:**
```bash
npm run db:migrate
```

**Open Drizzle Studio:**
```bash
npm run db:studio
```

## Email Configuration

Uses Gmail SMTP with app password:

1. Enable 2FA on Google account
2. Generate app password: https://myaccount.google.com/apppasswords
3. Add to `.env`: `SMTP_PASS=your-app-password`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.vercel.app/api/auth/google/callback`
4. Copy Client ID and Secret to `.env`

## Production Deployment

### Vercel

```bash
vercel --prod
```

**Environment Variables** (add in Vercel dashboard):

- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection
- `BACKEND_URL` - Your backend URL
- `FRONTEND_URL` - Your frontend URL
- `JWT_SECRET` - Strong secret (generate new)
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `SMTP_*` - Email config

See `.env.production.example` for complete list.

## Security

- Passwords hashed with Argon2
- JWT with httpOnly cookies
- Session-based revocation
- CSRF protection with SameSite cookies
- Rate limiting (TODO)

## Migration from MySQL

This project was migrated from MySQL to PostgreSQL. See [MIGRATION.md](../MIGRATION.md) for details.

## License

MIT
