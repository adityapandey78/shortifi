# Shortifi — URL Shortener

A secure, production-ready URL shortener service built with Node.js, Express, PostgreSQL and React.

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL + Drizzle ORM
- JWT authentication with refresh tokens
- Google OAuth (PKCE)
- Email verification (MJML + Nodemailer)

**Frontend:**
- React + React Router
- Zustand (state management)
- TailwindCSS + shadcn/ui
- React Hook Form + Zod
- Framer Motion

## Quick Start

### 1. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
# Server
cd server
cp .env.example .env

# Client
cd client
cp .env.example .env
```

### 3. Setup Database

```bash
cd server
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
```

### 4. Run Development

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

## Project Structure

```
server/
  ├── app.js              # Express app
  ├── config/             # Configuration
  ├── controllers/        # Request handlers
  ├── services/           # Business logic
  ├── routes/             # API routes
  ├── drizzle/schema.js   # Database schema
  └── lib/                # Utilities

client/
  ├── src/
  │   ├── pages/          # React pages
  │   ├── components/     # UI components
  │   ├── services/       # API calls
  │   ├── store/          # Zustand store
  │   └── lib/            # Utilities
  └── public/
```

## Authentication Flow

1. User registers/logs in
2. Server creates session in DB and issues JWT cookies
3. Access token (15min) + Refresh token (7d)
4. Middleware auto-refreshes expired access tokens
5. Logout clears session and cookies

## API Endpoints

**Public:**
- `GET /:shortcode` - Redirect to original URL

**Auth:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - OAuth callback

**Links:**
- `GET /api/shortner` - Get user's links
- `POST /api/shortner` - Create short link
- `PUT /api/shortner/:id` - Update link
- `DELETE /api/shortner/:id` - Delete link

## Database Schema

**Tables:**
- `users` - User accounts
- `sessions` - Active sessions
- `short_links` - Shortened URLs
- `oauth_accounts` - OAuth providers
- `verify_email_tokens` - Email verification

## Deployment

### Vercel

**Server:**
```bash
cd server
vercel --prod
```

**Client:**
```bash
cd client
vercel --prod
```

**Environment Variables:**

Set in Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASS=...
```

**Google OAuth Setup:**

Add redirect URI in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
```
https://your-backend.vercel.app/api/auth/google/callback
```

## Migration from MySQL

This project was migrated from MySQL to PostgreSQL. See [MIGRATION.md](./MIGRATION.md) for details.

## Development

**Drizzle Studio:**
```bash
cd server
npm run db:studio
```

**Generate Migration:**
```bash
npm run db:generate
```

**Apply Migration:**
```bash
npm run db:migrate
```

## License

MIT
