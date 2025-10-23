import { Google } from "arctic";
import { env } from "../../config/env.js";

// Validate Google OAuth credentials are configured
if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️  Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file");
}

// Determine the correct backend URL based on environment
const isProduction = env.NODE_ENV === 'production';
const backendURL = isProduction 
    ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://shortifi-sand.vercel.app')
    : 'http://localhost:3000';

// OAuth callback should be on the BACKEND, not frontend
const callbackURL = `${backendURL}/api/auth/google/callback`;
console.log(`[OAuth] Google callback URL: ${callbackURL}`);

export const google = new Google(
    env.GOOGLE_CLIENT_ID || "dummy-client-id",
    env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    callbackURL
);