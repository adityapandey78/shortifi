import { Google } from "arctic";
import { env } from "../../config/env.js";

// Validate Google OAuth credentials are configured
if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️  Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file");
}

// Determine the correct backend URL based on environment
const isProduction = env.NODE_ENV === 'production';

// Use BACKEND_URL from env if available, otherwise determine based on environment
const backendURL = process.env.BACKEND_URL || (isProduction 
    ? 'https://shortifi-sand.vercel.app'  // Your BACKEND production domain
    : 'http://localhost:3000');

// OAuth callback should be on the BACKEND
const callbackURL = `${backendURL}/google/callback`;
console.log(`[OAuth] Google callback URL: ${callbackURL}`);

export const google = new Google(
    env.GOOGLE_CLIENT_ID || "dummy-client-id",
    env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    callbackURL
);