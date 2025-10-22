import { Router } from "express";
import * as apiAuthControllers from "../controllers/api-auth.controller.js";

/**
 * JSON API Routes for Authentication
 * All routes return JSON responses for the React frontend
 * Base path: /api/auth
 */
const router = Router();

// Register new user
// POST /api/auth/register
// Body: { name, email, password }
router.post("/register", apiAuthControllers.apiRegister);

// Login user
// POST /api/auth/login
// Body: { email, password }
router.post("/login", apiAuthControllers.apiLogin);

// Get current authenticated user
// GET /api/auth/me
router.get("/me", apiAuthControllers.apiGetMe);

// Logout user
// POST /api/auth/logout
router.post("/logout", apiAuthControllers.apiLogout);

// Resend email verification
// POST /api/auth/resend-verification
router.post("/resend-verification", apiAuthControllers.apiResendVerification);

// Verify email with token
// GET /api/auth/verify-email?token=xxx&email=xxx
router.get("/verify-email", apiAuthControllers.apiVerifyEmail);

// Google OAuth login
// GET /api/auth/google
router.get("/google", apiAuthControllers.apiGoogleLogin);

// Google OAuth callback
// GET /api/auth/google/callback?code=xxx&state=xxx
router.get("/google/callback", apiAuthControllers.apiGoogleCallback);

export const apiAuthRoutes = router;
