import { refreshTokens, verifyJWTToken } from "../services/auth.services.js";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";

/**
 * Middleware to verify user authentication.
 * Execution:
 * 1. Read access and refresh tokens from cookies.
 * 2. If no tokens, set req.user = null and continue.
 * 3. If access token exists, try to verify it and set req.user from the decoded token.
 * 4. If access token verification fails and refresh token exists, attempt to refresh tokens:
 *    - Call refreshTokens(refreshToken) to obtain new tokens and user data.
 *    - Set new tokens as httpOnly cookies.
 *    - Set req.user to the returned user.
 * 5. If refreshing fails, clear auth cookies and set req.user = null.
 * 6. Always call next() to continue request processing.
 */
export const verifyAuthentication = async (req, res, next) => {
    // Read tokens from cookies
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    // If no tokens exist, user is not authenticated
    if (!accessToken && !refreshToken) {
        req.user = null;
        return next();
    }

    // Try to verify access token first
    if (accessToken) {
        try {
            const decodedToken = verifyJWTToken(accessToken);
            req.user = decodedToken;
            return next();
        } catch (error) {
            // Access token invalid, will attempt refresh token next
            console.log("Access token invalid, trying refresh token");
        }
    }

    // Try to refresh tokens using refresh token
    if (refreshToken) {
        try {
            const { newAccessToken, newRefreshToken, user } = await refreshTokens(refreshToken);

            // Cookie configuration (httpOnly for security; secure should be true in production)
            const baseConfig = { httpOnly: true, secure: false };

            // Set refreshed tokens in cookies with appropriate expiry
            res.cookie("access_token", newAccessToken, {
                ...baseConfig,
                maxAge: ACCESS_TOKEN_EXPIRY,
            });

            res.cookie("refresh_token", newRefreshToken, {
                ...baseConfig,
                maxAge: REFRESH_TOKEN_EXPIRY,
            });

            // Attach user to request and continue
            req.user = user;
            return next();

        } catch (error) {
            // Refresh failed: clear cookies and treat as unauthenticated
            console.error("Refresh token failed:", error.message);

            res.clearCookie("access_token");
            res.clearCookie("refresh_token");

            req.user = null;
            return next();
        }
    }

    // No valid tokens could be used
    req.user = null;
    return next();
};
