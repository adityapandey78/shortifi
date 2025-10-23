import {
    getUserByEmail,
    createUser,
    hashPassword,
    comparePassword,
    authenticateUser,
    clearSession,
    findUserById,
    sendNewVerifyEmailLink,
    findVerificationEmailToken,
    findVerificationEmailAndUpdate,
    clearVerifyEmailTokens,
    getUserWithOauthId,
    linkUserWithOauth,
    createUserWithOauth,
} from "../services/auth.services.js";
import {
    loginUserSchema,
    registerUserSchema,
    verifyEmailSchema,
} from "../validators/auth-validator.js";
import { google } from "../lib/oauth/google.js";
import { generateCodeVerifier, generateState, decodeIdToken } from "arctic";
import { OAUTH_EXCHANGE_EXPIRY } from "../config/constants.js";

/**
 * JSON API Controllers for React Frontend
 * These endpoints return JSON responses instead of HTML/redirects
 * Used by the React SPA frontend
 */

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { name, email, password }
 * Returns: { success, message, user? }
 */
export const apiRegister = async (req, res) => {
    try {
        // Validate request body
        const { success, data, error } = registerUserSchema.safeParse(req.body);
        if (!success) {
            const errorMessage = error.issues?.[0]?.message || "Validation error";
            return res.status(400).json({ success: false, message: errorMessage });
        }

        const { name, email, password } = data;

        // Check if user already exists
        const userExists = await getUserByEmail(email);
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const user = await createUser({ name, email, password: hashedPassword });

        // Authenticate user (sets cookies)
        await authenticateUser({ req, res, user, name, email });

        // Send verification email
        await sendNewVerifyEmailLink({ email, userId: user.id });

        return res.json({
            success: true,
            message: "Registration successful. Verification email sent.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isEmailValid: user.isEmailValid,
            },
        });
    } catch (error) {
        console.error("API Register error:", error);
        return res.status(500).json({ success: false, message: "Registration failed" });
    }
};

/**
 * POST /api/auth/login
 * Login user
 * Body: { email, password }
 * Returns: { success, message, user? }
 */
export const apiLogin = async (req, res) => {
    try {
        // Validate request body
        const { success, data, error } = loginUserSchema.safeParse(req.body);
        if (!success) {
            const errorMessage = error.issues?.[0]?.message || "Validation error";
            return res.status(400).json({ success: false, message: errorMessage });
        }

        const { email, password } = data;

        // Find user by email
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Verify password
        const isPasswordValid = await comparePassword(user.password, password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Authenticate user (sets cookies)
        await authenticateUser({ req, res, user });

        return res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isEmailValid: user.isEmailValid,
            },
        });
    } catch (error) {
        console.error("API Login error:", error);
        return res.status(500).json({ success: false, message: "Login failed" });
    }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Returns: { success, user? }
 */
export const apiGetMe = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isEmailValid: user.isEmailValid,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("API Get Me error:", error);
        return res.status(500).json({ success: false, message: "Failed to get user info" });
    }
};

/**
 * POST /api/auth/logout
 * Logout user
 * Returns: { success, message }
 */
export const apiLogout = async (req, res) => {
    try {
        if (req.user?.sessionId) {
            await clearSession(req.user.sessionId);
        }

        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        return res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("API Logout error:", error);
        return res.status(500).json({ success: false, message: "Logout failed" });
    }
};

/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 * Returns: { success, message }
 */
export const apiResendVerification = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isEmailValid) {
            return res.status(400).json({ success: false, message: "Email already verified" });
        }

        await sendNewVerifyEmailLink({ email: req.user.email, userId: req.user.id });

        return res.json({ success: true, message: "Verification email sent" });
    } catch (error) {
        console.error("API Resend Verification error:", error);
        return res.status(500).json({ success: false, message: "Failed to send verification email" });
    }
};

/**
 * GET /api/auth/verify-email?token=xxx&email=xxx
 * Verify email with token
 * Returns: { success, message }
 */
export const apiVerifyEmail = async (req, res) => {
    try {
        // Validate query parameters
        const { data, error } = verifyEmailSchema.safeParse(req.query);
        if (error) {
            return res.status(400).json({ success: false, message: "Invalid verification link" });
        }

        // Find and validate token
        const token = await findVerificationEmailToken(data);
        if (!token) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        // Mark email as verified
        await findVerificationEmailAndUpdate(token.email);

        // Clear verification tokens
        clearVerifyEmailTokens(token.email).catch(console.error);

        return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        console.error("API Verify Email error:", error);
        return res.status(500).json({ success: false, message: "Email verification failed" });
    }
};

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 * Redirects to Google authorization page
 */
export const apiGoogleLogin = async (req, res) => {
    try {
        // Generate state and code verifier for PKCE
        const state = generateState();
        const codeVerifier = generateCodeVerifier();

        // Create authorization URL
        const url = google.createAuthorizationURL(state, codeVerifier, [
            "openid",
            "profile",
            "email",
        ]);

        // Store state and verifier in cookies
        const cookieConfig = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: OAUTH_EXCHANGE_EXPIRY,
            sameSite: "lax",
        };

        res.cookie("google_oauth_state", state, cookieConfig);
        res.cookie("google_code_verifier", codeVerifier, cookieConfig);

        // Return the URL for client-side redirect
        return res.json({ success: true, redirectUrl: url.toString() });
    } catch (error) {
        console.error("API Google Login error:", error);
        return res.status(500).json({ success: false, message: "Failed to initiate Google login" });
    }
};

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 * Query: { code, state }
 * Returns: { success, user?, message }
 */
export const apiGoogleCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        const { google_oauth_state: storedState, google_code_verifier: codeVerifier } = req.cookies;

        // Validate OAuth parameters
        if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
            return res.status(400).json({ success: false, message: "Invalid OAuth callback" });
        }

        // Exchange code for tokens
        let tokens;
        try {
            tokens = await google.validateAuthorizationCode(code, codeVerifier);
        } catch (err) {
            console.error("Google token exchange failed:", err);
            return res.status(400).json({ success: false, message: "Authorization code exchange failed" });
        }

        // Decode ID token
        const claims = decodeIdToken(tokens.idToken());
        const { sub: googleUserId, name, email, picture } = claims;

        // Find or create user
        let user = await getUserWithOauthId({ provider: "google", email });

        if (user && !user.providerAccountId) {
            // Link existing user with Google
            await linkUserWithOauth({
                userId: user.id,
                provider: "google",
                providerAccountId: googleUserId,
                avatarUrl: picture,
            });
        }

        if (!user) {
            // Create new user with Google
            user = await createUserWithOauth({
                name,
                email,
                provider: "google",
                providerAccountId: googleUserId,
                avatarUrl: picture,
            });
        }

        // Authenticate user (sets cookies)
        await authenticateUser({ req, res, user, name, email });

        // Clear OAuth cookies
        res.clearCookie("google_oauth_state");
        res.clearCookie("google_code_verifier");

        // Redirect to frontend home page after successful login
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?login=success`);
    } catch (error) {
        console.error("API Google Callback error:", error);
        // Redirect to frontend login page with error
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_oauth_failed`);
    }
};
