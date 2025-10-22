# Shortifi — URL Shortener (Backend-focused)

This repository contains the backend implementation for Shortifi, a secure, production-minded URL shortener service built with Node.js, Express and PostgreSQL (Drizzle ORM). The README focuses on the backend architecture, security choices, data model, developer setup and implementing React-based frontend (React, Redux, Zod, react-hook-form and axios).


## Highlights

- Backend: Node.js (ES modules), Express, EJS views (server-rendered), modular controllers and services
- DB: PostgreSQL accessed via `pg` and Drizzle ORM; migrations managed with `drizzle-kit`
- Auth: argon2 password hashing, JWT access & refresh tokens, server-side session records and token rotation
- Email: MJML templates rendered with EJS, converted to HTML and sent via nodemailer
- OAuth: Google using PKCE
- Frontend: React SPA (Redux, Zod, react-hook-form, axios) — production-ready client integrated with backend auth

## Architecture and code layout (short)

- server/app.js — app bootstrap, middleware and route registration
- server/routes/* — express route modules (`auth.routes.js`, `shortner.routes.js`)
- server/controllers/* — request handling, validation and orchestration
- server/services/* — business logic and DB access (auth, short links, email)
- server/drizzle/schema.js — Drizzle table definitions and relations
- server/emails/*.mjml — MJML templates used for verification emails

## Data model (concise)

Main tables (see `server/drizzle/schema.js`):

- users: id, name, email, password, is_email_valid, created_at, updated_at
- verify_email_tokens: user_id, token, expires_at
- short_links: id, shortCode, url, user_id, created_at, updated_at
- oauth_accounts: provider, provider_account_id, user_id
- sessions: user_id, valid, user_agent, ip, created_at

Naming: DB columns use snake_case; application code uses camelCase.

## Authentication & token flow (detailed)

1. User authenticates (local or OAuth). The server creates a DB session row in `sessions` and issues two httpOnly cookies: `access_token` and `refresh_token`.

2. `access_token` (short lived, default 15 minutes) contains user claims and session id.

3. On each request the `verify-auth.middleware.js` attempts to verify the access token:
	- If valid: request proceeds with `req.user` set.
	- If expired and `refresh_token` is present: middleware calls `refreshTokens()` which validates the refresh JWT, ensures session is still valid in DB, and issues rotated tokens (new access & refresh), updating cookies.

4. Logout clears the session row and clears auth cookies.

Design reasons: combining JWTs with server-side sessions provides the performance benefits of JWTs and the safety of server-side revocation and session auditing.

## Email verification and OAuth

- Email: verification codes are numeric tokens stored in `verify_email_tokens` with expiry; messages rendered from MJML templates using EJS and sent via nodemailer.
- OAuth: Google PKCE implemented; new OAuth users are created with `isEmailValid=true` and an associated `oauth_accounts` row.

## Frontend integration

- SPA stack: React + Redux Toolkit, react-hook-form + Zod resolver for all user forms, axios configured with `withCredentials: true`.
- Auth handling: client does not read tokens directly; it relies on browser-sent cookies. axios is configured to send credentials and handle 401 flows by retrying after the server refresh (server-side middleware refreshes tokens when cookies are present).

## Key developer tasks & commands

1) Install dependencies

```powershell
cd server
npm install
```

2) Environment (create `server/.env`)

Minimum recommended values:

- DATABASE_URL (Postgres)
- JWT_SECRET (strong random secret)
- FRONTEND_URL (used when generating verify links)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (if using Google OAuth)

3) Run

```powershell
npm run dev
```

4) Drizzle helpers

- `npm run db:generate` — generate migration from schema
- `npm run db:migrate` — apply pending migrations
- `npm run db:studio` — open Drizzle studio

## Important endpoints (concise)

- GET /                — homepage with create form and list of links
- POST /               — create short link (body: { url, shortCode? })
- GET /:shortcode      — redirect to original URL
- Auth: /register, /login, /logout, /verify-email, /verify-email-token, /resend-verification-link
- OAuth: /google, /google/callback

Note: the server currently issues redirects and sets cookies. If you prefer a JSON-first API for the SPA, the routes can be duplicated under `/api` to return JSON responses.

## Security & production notes

- Use HTTPS and set cookie `secure: true` in production
- Store secrets (DB, JWT, email provider keys) in a secrets manager
- Add rate limiting (auth, redirect endpoints) and consider bot-detection on redirect creation
- Optional: move session store to Redis for cross-instance session revocation

## Where to inspect code

- server/app.js, server/routes/*, server/controllers/*, server/services/*
- Drizzle schema and migrations: server/drizzle/
- Emails: server/emails/

## 🚀 Deployment

### Deploy to Vercel

This project is optimized for Vercel deployment. See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for complete step-by-step instructions.

**Quick deployment:**

1. **Frontend (Client)**
   ```bash
   cd client
   vercel --prod
   ```

2. **Backend (Server)**
   ```bash
   cd server
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Add all required env vars in Vercel Dashboard
   - See `.env.production.example` for full list

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random secret (min 32 chars)
- `CLIENT_URL` - Your frontend Vercel URL
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `SMTP_*` - Email configuration
- See full list in `VERCEL_DEPLOYMENT.md`

**Configuration Files:**
- `client/vercel.json` - Frontend deployment config
- `server/vercel.json` - Backend API deployment config

For detailed instructions, troubleshooting, and best practices, see **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**.

---

This readme is generated with the help of AI (GPT-4) and human-edited for clarity.
