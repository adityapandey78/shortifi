import { Google } from "arctic";
import { env } from "../../config/env.js";

// Validate Google OAuth credentials are configured
if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️  Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file");
}

// Use FRONTEND_URL from environment for OAuth callback
const callbackURL = `${env.FRONTEND_URL}/google/callback`;
console.log(`[OAuth] Google callback URL: ${callbackURL}`);

export const google = new Google(
    env.GOOGLE_CLIENT_ID || "dummy-client-id",
    env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    callbackURL
);