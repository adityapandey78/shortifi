import {
    ACCESS_TOKEN_EXPIRY,
    OAUTH_EXCHANGE_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import {
    getUserByEmail,
    createUser,
    hashPassword,
    comparePassword,
    createSession,
    createAccessToken,
    createRefreshToken,
    clearSession,
    authenticateUser,
    findUserById,
    getAllShortLinks,
    generateRandomToken,
    insertVerifyEmailToken,
    createVerifyEmailLink,
    findVerificationEmailToken,
    findVerificationEmailAndUpdate,
    clearVerifyEmailTokens,
    sendNewVerifyEmailLink,
    getUserWithOauthId,
    linkUserWithOauth,
    createUserWithOauth,
} from "../services/auth.services.js";
import { sendEmail } from "../lib/nodemailer.js";
import {
    loginUserSchema,
    registerUserSchema,
    verifyEmailSchema,
} from "../validators/auth-validator.js";
import { decodeIdToken, generateCodeVerifier, generateState, Google } from "arctic";
import {google} from "../lib/oauth/google.js"

//
// Controller for authentication-related routes and flows.
// Each handler performs request validation, calls service functions,
// manages cookies/flash messages, and redirects or renders views.
//

export const getRegisterPage = (req, res) => {
    // If already authenticated, redirect to home
    if (req.user) return res.redirect("/");
    // Render registration page with any validation errors from flash
    return res.render("../views/auth/register", { errors: req.flash("errors") });
};

export const postRegister = async (req, res) => {
    // Prevent registering while already authenticated
    if (req.user) return res.redirect("/");

    // Validate incoming registration data
    const { success, data, error } = registerUserSchema.safeParse(req.body);
    if (!success) {
        const errorMessage = error.issues?.[0]?.message || "Validation error";
        req.flash("errors", errorMessage);
        return res.redirect("/register");
    }

    const { name, email, password } = data;

    // Check if a user with this email already exists
    const userExists = await getUserByEmail(email);
    console.log("Existing user lookup result:", userExists);

    if (userExists) {
        req.flash("errors", "User already exists with this email.");
        return res.redirect("/register");
    }

    // Hash the provided password before storing
    const hashedPassword = await hashPassword(password);

    // Create the user record
    const [user] = await createUser({ name, email, password: hashedPassword });
    console.log("New user created:", user);

    // Authenticate the newly created user and create session cookies
    await authenticateUser({ req, res, user, name, email });

    // Send an email verification link/code to the user's email
    await sendNewVerifyEmailLink({ email, userId: user.id });

    // Inform the user that verification has been sent and redirect to verification page
    req.flash("success", "Verification link sent to your email. Please check your inbox for the 8-digit code.");
    res.redirect("/verify-email");
};

export const getLoginPage = (req, res) => {
    // If already authenticated, redirect to home
    if (req.user) return res.redirect("/");
    // Render login page with any validation errors from flash
    return res.render("../views/auth/login", { errors: req.flash("errors") });
};

export const postLogin = async (req, res) => {
    // Prevent login when already authenticated
    if (req.user) return res.redirect("/");

    // Validate login request body
    const { success, data, error } = loginUserSchema.safeParse(req.body);
    if (!success) {
        const errorMessage = error.issues?.[0]?.message || "Validation error";
        req.flash("errors", errorMessage);
        return res.redirect("/login");
    }
    const { email, password } = data;

    // Find user by email
    const user = await getUserByEmail(email);
    console.log("User lookup during login:", user);

    if (!user) {
        req.flash("errors", "Invalid email or password.");
        return res.redirect("/login");
    }

    // Verify provided password against stored hash
    const isPasswordValid = await comparePassword(user.password, password);
    if (!isPasswordValid) {
        req.flash("errors", "Invalid email or password.");
        return res.redirect("/login");
    }

    // Authenticate the user and establish session/cookies
    await authenticateUser({ req, res, user });
    res.redirect("/");
};

export const getMe = (req, res) => {
    // Return basic info for authenticated user or a message if not logged in
    if (!req.user) return res.send("Not logged in");
    return res.send(`<h1> hey ${req.user.name} - ${req.user.email}</h1>`);
};

export const logoutUser = async (req, res) => {
    // Clear backend session and client cookies, then redirect to login
    await clearSession(req.user.sessionId);

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.redirect("/login");
};

export const getProfilePage = async (req, res) => {
    // Ensure user is authenticated and exists in DB
    if (!req.user) return res.send("Not logged in!");

    const user = await findUserById(req.user.id);
    if (!user) return res.redirect("/login");

    // Get all short links for this user and render profile
    const userShortLinks = await getAllShortLinks(user.id);

    return res.render("auth/profile", {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isEmailValid: user.isEmailValid,
            createdAt: user.createdAt,
            links: userShortLinks,
        },
    });
};

export const getVerifyEmailPage = async (req, res) => {
    // Ensure the user is authenticated before verifying email
    if (!req.user) return res.redirect("/login");

    // If already verified, send to home
    if (req.user.isEmailValid === true) return res.redirect("/");

    const user = await findUserById(req.user.id);
    if (!user) return res.redirect("/login");
    if (user.isEmailValid === true) return res.redirect("/");

    // Log debug info about the user and verification status
    console.log("Verify email page - user:", req.user);
    console.log("Verify email page - isEmailValid:", req.user.isEmailValid);

    // Render verification page with any flash messages
    return res.render("auth/verify-email", {
        email: req.user.email,
        success: req.flash('success'),
        errors: req.flash('errors'),
    });
};

export const resendVerificationLink = async (req, res) => {
    // Only allow resending when authenticated
    if (!req.user) return res.redirect("/");

    const user = await findUserById(req.user.id);

    // If user does not exist or is already verified, redirect to home
    if (!user || user.isEmailValid) return res.redirect("/");

    try {
        // Send a fresh verification link/code
        await sendNewVerifyEmailLink({ email: req.user.email, userId: req.user.id });
        req.flash('success', 'Verification link sent to your email. Please check your inbox.');
    } catch (error) {
        // Log and show a friendly error message when sending fails
        console.error('Failed to resend verification link:', error);
        req.flash('errors', 'Failed to send verification email. Please try again later.');
    }

    return res.redirect('/verify-email');
};

export const verifyEmailToken = async (req, res) => {
    // Validate query parameters for verification
    const { data, error } = verifyEmailSchema.safeParse(req.query);
    if (error) {
        req.flash('errors', 'Verification link invalid or expired. Please request a new code.');
        return res.redirect('/verify-email');
    }

    // Find token record and ensure it's valid and not expired
    const token = await findVerificationEmailToken(data);
    if (!token) {
        req.flash('errors', 'Verification code is invalid or expired. Please request a new code.');
        return res.redirect('/verify-email');
    }

    // Mark the user's email as verified
    await findVerificationEmailAndUpdate(token.email);

    // Clear any existing verification tokens for the email (best-effort)
    clearVerifyEmailTokens(token.email).catch(console.error);

    // Inform the user and redirect to profile
    req.flash('success', 'Email verified successfully.');
    return res.redirect('/profile');
};

export const getGoogleLoginPage = async (req, res) => {
    // Prevent starting OAuth flow when already authenticated
    if (req.user) return res.redirect("/");

    // Generate state and code verifier for PKCE flow
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    // Build Google authorization URL with requested scopes
    const url = google.createAuthorizationURL(state, codeVerifier, [
        "openid",
        "profile",
        "email",
    ]);

    // Store state and verifier in secure cookies for callback validation
    const cookieConfig = {
        httpOnly: true,
        secure: true,
        maxAge: OAUTH_EXCHANGE_EXPIRY,
        sameSite: "lax",
    };

    res.cookie("google_oauth_state", state, cookieConfig);
    res.cookie("google_code_verifier", codeVerifier, cookieConfig);

    // Redirect the user to Google's authorization page
    return res.redirect(url.toString());
}

export const getGoogleLoginCallback= async(req,res)=>{
    // Handle Google OAuth callback: validate state and exchange the code for tokens
    const {code,state}= req.query;

    const {
        google_oauth_state:storedState,
        google_code_verifier:codeVerifier,
    }= req.cookies;
    
    // Validate presence and integrity of OAuth parameters
    if (
        !code ||
        !state ||
        !storedState ||
        !codeVerifier ||
        state !== storedState
    ) {
        req.flash(
          "errors",
          "Unable to complete Google login due to an invalid or tampered callback. Please try again."
        );
        return res.redirect("/login");
    }

    let tokens;
    try {
        // Exchange authorization code for tokens using the stored code verifier
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch {
        req.flash(
          "errors",
          "Unable to complete Google login. Authorization code exchange failed. Please try again."
        );
        return res.redirect("/login");
    }
    console.log("Google OAuth callback query:", { code, state });
    console.log("Google tokens received:", tokens);

    // Decode ID token to get user claims
    const claims = decodeIdToken(tokens.idToken());
    console.log("ID token claims:", claims);

    const { sub: googleUserId, name, email, picture } = claims;

    // Handle three cases:
    // 1) Existing user already linked to Google
    // 2) Existing user with same email but not linked -> link accounts
    // 3) New user -> create account using Google profile
    let user = await getUserWithOauthId({
        provider: "google",
        email,
    });

    if (user && !user.providerAccountId) {
        await linkUserWithOauth({
            userId: user.id,
            provider: "google",
            providerAccountId: googleUserId,
            avatarUrl: picture,
        });
    }

    if (!user) {
        user = await createUserWithOauth({
            name,
            email,
            provider: "google",
            providerAccountId: googleUserId,
            avatarUrl: picture,
        });
    }

    // Authenticate the user and establish session/cookies
    await authenticateUser({ req, res, user, name, email });

    return res.redirect("/");
}

export const getEditProfilePage = async (req, res) => {
    // Only allow authenticated users to access edit profile page
    if (!req.user) return res.redirect("/");

    const user = await findUserById(req.user.id);
    if (!user) return res.redirect("/login");

    // Render edit profile page with current user info
    return res.render("auth/edit-profile", {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isEmailValid: user.isEmailValid,
            createdAt: user.createdAt,
        },
    });
}
