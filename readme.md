# Shortifi - Enterprise URL Shortener

Shortifi is a comprehensive URL shortening platform that demonstrates proficiency in full-stack development, secure authentication patterns, database design, and cloud deployment. The application features a responsive React frontend with a RESTful Node.js backend, implementing industry-standard security practices and scalable architecture patterns.

### Key Features

- **Secure Authentication System**: JWT-based authentication with refresh token rotation, session management, and OAuth 2.0 integration
- **Custom URL Shortening**: User-defined short codes with collision detection and validation
- **Email Verification**: MJML-templated transactional emails with spam prevention
- **Real-time Link Management**: CRUD operations with optimistic UI updates
- **Responsive Design**: Mobile-first UI built with TailwindCSS and Framer Motion animations
- **Production-Ready**: Deployed on Vercel with PostgreSQL database and connection pooling

## Architecture & Technology Stack

### Backend Architecture

**Runtime & Framework:**
- **Node.js (ES Modules)**: Modern JavaScript runtime with native ESM support
- **Express.js**: Minimalist web framework with custom middleware architecture
- **Vercel Serverless**: Zero-config deployment with automatic scaling

**Database Layer:**
- **PostgreSQL**: Production database with ACID compliance
- **Drizzle ORM**: Type-safe SQL query builder with migration system
- **Connection Pooling**: Supabase Pooler for efficient connection management

**Authentication & Security:**
- **JWT (jsonwebtoken)**: Stateless authentication with RS256 signing algorithm
- **Refresh Tokens**: 7-day rotating refresh tokens with automatic renewal
- **Argon2**: Memory-hard password hashing (OWASP recommended)
- **Session Management**: Database-backed session revocation and invalidation
- **CORS**: Configurable cross-origin resource sharing with credential support
- **Google OAuth 2.0**: PKCE flow implementation using Arctic library

**Email System:**
- **Nodemailer**: SMTP transport with Gmail integration
- **MJML**: Responsive email templates with cross-client compatibility
- **EJS Templating**: Dynamic content injection in email bodies

### Frontend Architecture

**Core Framework:**
- **React 18**: Component-based UI with concurrent rendering features
- **Vite**: Next-generation build tool with HMR and optimized production builds
- **React Router v6**: Client-side routing with loader and action patterns

**State Management & Data Fetching:**
- **Zustand**: Lightweight state management with persistence middleware
- **Axios**: Promise-based HTTP client with interceptor architecture
- **React Hook Form**: Performant form handling with uncontrolled components
- **Zod**: TypeScript-first schema validation

**UI/UX Design:**
- **TailwindCSS**: Utility-first CSS framework with JIT compiler
- **shadcn/ui**: Accessible component library built on Radix UI primitives
- **Framer Motion**: Production-ready animation library with gesture support
- **Responsive Design**: Mobile-first approach with breakpoint system (sm/md/lg/xl)

### Development Tools & Workflow

- **Drizzle Kit**: Schema migrations and database introspection
- **ESLint**: Code quality enforcement with React hooks plugin
- **PostCSS**: CSS transformations with autoprefixer
- **Git**: Version control with conventional commits

## Technical Implementation Details

### Authentication Flow

```
1. User Registration
   └─> Password hashing (Argon2)
   └─> User record creation
   └─> Email verification token generation
   └─> Transactional email dispatch

2. Login Process
   └─> Credential validation
   └─> Session creation in database
   └─> JWT generation (Access: 15min, Refresh: 7d)
   └─> HttpOnly cookie assignment

3. Token Refresh Strategy
   └─> Access token expiration detection
   └─> Automatic refresh token exchange
   └─> Seamless user experience (no re-authentication)
   └─> Session validation and renewal

4. Logout & Session Termination
   └─> Session deletion from database
   └─> Cookie clearance
   └─> Token blacklisting
```

### Database Schema Design

**Users Table:**
- Primary key: UUID
- Indexed fields: email (unique), createdAt
- Relationships: 1-to-many with sessions, short_links, oauth_accounts

**Sessions Table:**
- Composite index: (userId, expiresAt)
- Automatic cleanup via cron job
- Stores refresh token hash for validation

**Short Links Table:**
- Unique constraint on shortCode
- B-tree index on userId for fast lookups
- Soft delete pattern with deletedAt timestamp

**OAuth Accounts Table:**
- Composite unique constraint: (provider, providerId)
- Links external accounts to local user records

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- npm or yarn package manager
- Gmail account (for SMTP) or alternative email service
- Google Cloud Platform account (for OAuth)

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/adityapandey78/shortifi.git
cd shortifi
```

**2. Install Dependencies**
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

**3. Environment Configuration**

Create `.env` files from provided examples:

**Server Environment Variables** :`server/.env`

**Client Environment Variables** :`client/.env`

**4. Database Setup**

```bash
cd server

# Generate Drizzle schema migrations
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Optional: Open Drizzle Studio for database inspection
npm run db:studio
```

**5. Start Development Servers**

```bash
# Terminal 1: Backend API Server
cd server
npm run dev
# Server running at http://localhost:3000

# Terminal 2: Frontend Development Server
cd client
npm run dev
# Client running at http://localhost:5173
```

## Security Implementation

### Password Security
- **Argon2id**: Memory-hard hashing algorithm resistant to GPU attacks
- **Salt**: Automatically generated unique salt per password
- **Parameters**: Memory cost: 65536 KB, Time cost: 3 iterations

### Token Management
- **Access Tokens**: Short-lived (15 minutes) to minimize exposure window
- **Refresh Tokens**: Long-lived (7 days) stored as HTTP-only cookies
- **Token Rotation**: New refresh token issued on each refresh operation
- **Session Binding**: Tokens tied to database sessions for revocation capability

### API Security
- **CORS Policy**: Whitelist-based origin validation
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Rate Limiting**: Ready for integration (recommended: express-rate-limit)
- **XSS Protection**: Content Security Policy headers in production

## API Documentation

### Public Endpoints

#### Redirect Short URL
```http
GET /:shortCode
```
Redirects to the original URL associated with the short code.

**Response:** `302 Redirect` or `404 Not Found`

---

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailValid": false
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Sets HTTP-only cookies (`access_token`, `refresh_token`)

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

#### Google OAuth Flow
```http
GET /api/auth/google
```
Initiates OAuth 2.0 authorization flow.

```http
GET /api/auth/google/callback?code=<auth_code>&state=<state>
```
Handles OAuth callback and creates session.

---

### Link Management Endpoints

#### Get User's Links
```http
GET /api/shortner
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "links": [
    {
      "id": "uuid",
      "url": "https://example.com/very/long/url",
      "shortCode": "abc123",
      "shortUrl": "https://shortifi.com/abc123",
      "createdAt": "2025-10-24T12:00:00Z"
    }
  ]
}
```

#### Create Short Link
```http
POST /api/shortner
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "shortCode": "custom-code"  // Optional
}
```

#### Update Short Link
```http
PUT /api/shortner/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "url": "https://updated-url.com",
  "shortCode": "new-code"
}
```

#### Delete Short Link
```http
DELETE /api/shortner/:id
Authorization: Bearer <access_token>
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),  -- Argon2 hash
  is_email_valid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_expires ON sessions(user_id, expires_at);
```

### Short Links Table
```sql
CREATE TABLE short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  short_code VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_short_links_user ON short_links(user_id);
CREATE UNIQUE INDEX idx_short_links_code ON short_links(short_code);
```

### OAuth Accounts Table
```sql
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);
```

### Verify Email Tokens Table
```sql
CREATE TABLE verify_email_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Production Deployment

### Vercel Deployment (Recommended)

**Prerequisites:**
- Vercel account with CLI installed (`npm i -g vercel`)
- PostgreSQL database (Supabase, Railway, or Neon recommended)
- Google Cloud Platform project with OAuth 2.0 credentials

**Deployment Steps:**

**1. Deploy Backend**
```bash
cd server
vercel --prod

# Note the deployment URL: https://your-backend.vercel.app
```

**2. Configure Backend Environment Variables**

In Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Database (Production)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT Configuration
JWT_SECRET=your-production-secret-minimum-32-characters
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Application URLs
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.vercel.app
NODE_ENV=production

# Google OAuth (Production Credentials)
GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-prod-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.vercel.app/api/auth/google/callback

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**3. Deploy Frontend**
```bash
cd client
vercel --prod
```

**4. Configure Frontend Environment Variables**

In Vercel Dashboard → Project → Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

**5. Google OAuth Configuration**

Navigate to [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Select your OAuth 2.0 Client ID
2. Add Authorized Redirect URIs:
   ```
   https://your-backend.vercel.app/api/auth/google/callback
   ```
3. Add Authorized JavaScript Origins:
   ```
   https://your-frontend.vercel.app
   ```

**6. Database Connection Pooling**

For Vercel's serverless environment, use connection pooling:

```env
# Supabase Pooler Example
DATABASE_URL=postgresql://user:pass@aws-0-region.pooler.supabase.com:5432/postgres?pgbouncer=true
```

---

## Performance Optimizations

### Backend
- **Connection Pooling**: Efficient database connection reuse
- **JWT Stateless Auth**: Reduces database queries for authentication
- **Indexed Queries**: Optimized database indexes on frequently queried columns
- **Lazy Loading**: Email templates loaded on-demand

### Frontend
- **Code Splitting**: Route-based lazy loading with React.lazy()
- **Tree Shaking**: Unused code elimination in production builds
- **Asset Optimization**: Image compression and lazy loading
- **CSS Purging**: TailwindCSS JIT compiler removes unused styles
- **Bundle Analysis**: Vite's rollup-based bundling for optimal chunks

---

## Development Workflow

### Database Migrations

**Generate Migration (after schema changes):**
```bash
cd server
npm run db:generate
```

**Review Generated SQL:**
```bash
# Check: server/drizzle/migration/XXXX_migration_name.sql
```

**Apply Migration:**
```bash
npm run db:migrate
```

**Inspect Database:**
```bash
npm run db:studio
# Opens Drizzle Studio at http://localhost:4983
```

### Code Quality

**Linting:**
```bash
# Frontend linting
cd client
npm run lint

# Backend linting
cd server
npm run lint
```

**Type Checking:**
```bash
# JavaScript validation with JSDoc
npm run type-check
```

---
## Migration Notes

This project was successfully migrated from MySQL to PostgreSQL to leverage:
- Better JSON support for future analytics features
- Native UUID type for distributed systems
- Advanced indexing strategies (GiST, GIN)
- Superior concurrent write performance

Detailed migration steps documented in [MIGRATION.md](./MIGRATION.md).

---

## Technical Achievements

- **Zero-downtime Deployments**: Vercel's edge network for instant global availability
- **Security First**: OWASP Top 10 compliance with modern auth patterns
- **Developer Experience**: Hot module replacement, TypeScript-ready, ESM modules
- **Production Monitoring**: Ready for integration with Sentry, LogRocket, or DataDog
- **SEO Optimized**: Meta tags, Open Graph support, dynamic sitemap generation
---
#### *`Note:`* The readme is generated with the help of AI tools to ensure accuracy and completeness under my guidance.