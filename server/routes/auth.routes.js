import {Router} from "express"
import * as authControllers from "../controllers/auth.controller.js"

// 2) Initialize a router instance to attach route handlers
const router=Router();

// 3) Routes for user registration:
router
      .route("/register")
      .get(authControllers.getRegisterPage)
      .post(authControllers.postRegister)

// 4) Routes for user login:
router
      .route("/login")
      .get(authControllers.getLoginPage)
      .post(authControllers.postLogin)

// 5) Route to get current authenticated user info

router
      .route("/me")
      .get(authControllers.getMe);

// 6) Route to render the user's profile page
router
      .route("/profile")
      .get(authControllers.getProfilePage);

// 7) Route to logout the user
router
      .route("/logout")
      .get(authControllers.logoutUser);

// 8) Routes for email verification flows:
router
      .route("/verify-email")
      .get(authControllers.getVerifyEmailPage);

router
      .route("/resend-verification-link")
      .post(authControllers.resendVerificationLink);
router 
      .route("/verify-email-token")
      .get(authControllers.verifyEmailToken);

// 9) Routes for Google OAuth login:
router 
      .route("/google").get(authControllers.getGoogleLoginPage);

router.route("/google/callback").get(authControllers.getGoogleLoginCallback);

// 10) Route to render the edit profile page
router
      .route("/edit-profile").get(authControllers.getEditProfilePage)

export const authRoutes = router;