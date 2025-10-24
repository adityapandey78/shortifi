import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { db } from "../config/db-client.js";
import { oauthAccountsTable, sessionsTable, short_links, usersTable, verifyEmailTokensTable } from "../drizzle/schema.js";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import crypto from "crypto";
// import { sendEmail } from '../lib/send-email.js';
import { sendEmail } from "../lib/nodemailer.js";
import mjml2html from 'mjml';
import ejs from "ejs";

/*
  Auth service - step-by-step comments:

  This file groups helper functions used across authentication flows:
  - User lookup and creation
  - Password hashing & verification
  - JWT generation & verification
  - Session creation, lookup, and clearing
  - Token refresh flow
  - Email verification: token generation, storage, lookup, and sending
  - OAuth helper functions

  Each exported function below includes a short comment that describes:
  1) What the function does
  2) Key inputs and outputs
  3) Important side effects (DB writes, cookies, emails)
*/

/* Get a user record by email from the users table */
export const getUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
};

/* Create a new user row and return the inserted id */
export const createUser = async ({ name, email, password }) => {
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password })
    .returning({ id: usersTable.id });
  return user;
};

/* Hash a plain text password using argon2 */
export const hashPassword = async (password) => {
  return await argon2.hash(password);
};

/* Verify a plain password against an argon2 hash */
export const comparePassword = async (hash, password) => {
  return await argon2.verify(hash, password);
};

/* Generate a standard long-lived JWT (used in some flows) */
export const generateToken = ({ id, name, email }) => {
  return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* Verify a JWT using the shared secret */
export const verifyJWTToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/* Create a session row (records userId, ip, userAgent) and return it */
export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent })
    .returning({ id: sessionsTable.id });
  return session;
};

/* Find a session by its id */
export const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));
  return session;
};

/* Find a user by id */
export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return user;
};

/* Create an access token signed with JWT_SECRET
   Includes sessionId and isEmailValid in payload */
export const createAccessToken = ({ id, name, email, sessionId, isEmailValid }) => {
  console.log("JWT_SECRET in createAccessToken:", process.env.JWT_SECRET ? "***SET***" : "UNDEFINED");
  return jwt.sign({ id, name, email, sessionId, isEmailValid }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

/* Create a refresh token that contains sessionId */
export const createRefreshToken = ({ sessionId }) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

/* Refresh tokens flow:
   1. Verify provided refresh token
   2. Find session and validate it
   3. Load user and rebuild user info
   4. Issue new access and refresh tokens */
export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifyJWTToken(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.valid) {
      throw new Error("Invalid Session!");
    }

    const user = await findUserById(currentSession.userId);

    if (!user) throw new Error("Invalid User!");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentSession.id,
    };

    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken({ sessionId: currentSession.id });

    return {
      newAccessToken,
      newRefreshToken,
      user: userInfo,
    };
  } catch (error) {
    console.log("Error in refreshTokens:", error.message);
    throw error;
  }
};

/* Clear a session (delete by id) */
export const clearSession = async (sessionId) => {
  return db.delete(sessionsTable)
            .where(eq(sessionsTable.id, sessionId));
};

/* Authenticate user by creating a session and setting cookies:
   1. Create DB session
   2. Create access and refresh JWTs
   3. Set cookies on response with secure/httpOnly options */
export const authenticateUser = async ({ req, res, user, name, email }) => {
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name || name,
    email: user.email || email,
    isEmailValid: user.isEmailValid,
    sessionId: session.id,
  });
  const refreshToken = createRefreshToken({ sessionId: session.id });

  // Cookie configuration for cross-origin (Vercel deployment)
  const isProduction = process.env.NODE_ENV === 'production';
  const baseConfig = { 
    httpOnly: true, 
    secure: true, // Always secure (HTTPS)
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
    path: '/',
  };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

/* Get all short links for a given userId */
export const getAllShortLinks = async (userId) => {
  return await db.select()
                  .from(short_links)
                  .where(eq(short_links.id, userId));
};

/* Generate a numeric random token of given digits (default 8) */
export const generateRandomToken = async (digit = 8) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit;

  return crypto.randomInt(min, max).toString();
};

/* Insert a verification token:
   1. Remove expired tokens
   2. Remove existing tokens for the user
   3. Insert the new token */
export const insertVerifyEmailToken = async ({ userId, token }) => {
  return db.transaction(async (tx) => {
    try {
      console.log("Inserting the token in to DB");
      await tx.delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));

      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId));

      await tx.insert(verifyEmailTokensTable).values({ userId, token });
      console.log("Insertion completed into the DB!");
    } catch (error) {
      console.log("Unable to insert into DB", error);
      console.error(error);
    }
  });
};

/* Create a verification link using the URL API */
export const createVerifyEmailLink = async ({ email, token }) => {
  const url = new URL(`${process.env.FRONTEND_URL}/verify-email`);
  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  const generatedLink = url.toString();
  console.log("Generated verification link: ", generatedLink);
  return generatedLink;
};

/* Find a verification token by token and email, only if not expired:
   Uses a join to return user and token info in one query */
export const findVerificationEmailToken = async ({ token, email }) => {
  const rows = await db
    .select({
      userId: usersTable.id,
      email: usersTable.email,
      token: verifyEmailTokensTable.token,
      expiresAt: verifyEmailTokensTable.expiresAt,
    })
    .from(verifyEmailTokensTable)
    .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id))
    .where(
      and(
        eq(verifyEmailTokensTable.token, token),
        eq(usersTable.email, email),
        gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`)
      )
    );

  if (!rows || rows.length === 0) return null;
  return rows[0];
};

/* Mark a user's email as verified */
export const findVerificationEmailAndUpdate = async (email) => {
  return db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};

/* Clear verification tokens for a given email:
   1. Lookup user by email
   2. Delete tokens for that user id */
export const clearVerifyEmailTokens = async (email) => {
  const [user] = await db.select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!user) return 0;

  return await db.delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, user.id));
};

/* Generate and send a new verification email:
   1. Generate numeric token and insert into DB
   2. Build verify link
   3. Render MJML template with EJS
   4. Convert MJML to HTML and send email */
export const sendNewVerifyEmailLink = async ({ userId, email }) => {
  const randomToken = await generateRandomToken();
  console.log("random token is:", randomToken);

  await insertVerifyEmailToken({ userId, token: randomToken });

  const verifyEmailLink = await createVerifyEmailLink({
    email: email,
    token: randomToken,
  });

  try {
    const mjmlTemplate = await fs.readFile(
      path.join(__dirname, "..", "emails", "verify-email.mjml"),
      "utf-8"
    );

    const filledTemplate = ejs.render(mjmlTemplate, {
      code: randomToken,
      link: verifyEmailLink,
    });

    const htmlOutput = mjml2html(filledTemplate).html;
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify Your Email - Shortifi",
      html: htmlOutput,
    });
    console.log("Email sent successfully:", emailResult);
    return { success: true, emailResult };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
};

/* Get a user and attached oauth account info (left join by provider) */
export const getUserWithOauthId = async ({ email, provider }) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      isEmailValid: usersTable.isEmailValid,
      providerAccountId: oauthAccountsTable.providerAccountId,
      provider: oauthAccountsTable.provider,
    })
    .from(usersTable)
    .leftJoin(
      oauthAccountsTable,
      and(
        eq(oauthAccountsTable.userId, usersTable.id),
        eq(oauthAccountsTable.provider, provider)
      )
    )
    .where(eq(usersTable.email, email));
  return user;
};

/* Link an existing user to an oauth account (insert row) */
export const linkUserWithOauth = async ({ userId, provider, providerAccountId }) => {
  await db.insert(oauthAccountsTable).values({
    userId,
    provider,
    providerAccountId
  });
};

/* Create a user and an associated oauth account inside a transaction:
   1. Insert user (isEmailValid true)
   2. Insert oauth account referencing new user id
   3. Return assembled user object */
export const createUserWithOauth = async ({
  name,
  email,
  provider,
  providerAccountId
}) => {
  const user = await db.transaction(async (trx) => {
    const [newUser] = await trx
      .insert(usersTable)
      .values({
        email,
        name,
        password: '', // OAuth users don't have passwords, use empty string
        isEmailValid: true,
      })
      .returning({ id: usersTable.id });
    await trx.insert(oauthAccountsTable).values({
      provider,
      providerAccountId,
      userId: newUser.id
    });

    return {
      id: newUser.id,
      name,
      email,
      isEmailValid: true,
      provider,
      providerAccountId
    };
  });

  return user;
};
