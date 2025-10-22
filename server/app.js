import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import requestIp from "request-ip";

import path from "path";
import RouterUrl from "./routes/shortner.routes.js";
import { db } from "./config/db-client.js";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { apiAuthRoutes } from "./routes/api-auth.routes.js";
import { apiShortnerRoutes } from "./routes/api-shortner.routes.js";
import { sql } from "drizzle-orm";
import { verifyAuthentication } from "./middlewares/verify-auth.middleware.js";

// Create Express application
const app = express();
const PORT = env.PORT;

// Configure EJS template engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Middleware setup
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add JSON body parser for API routes

// Cookie parser must come before session and auth middleware
app.use(cookieParser());

// Session middleware (after cookie parser, before auth)
app.use(
  session({
    secret: "my-secret",
    resave: true,
    saveUninitialized: false,
  })
);

// Flash messages
app.use(flash());

// Get client IP
app.use(requestIp.mw());

// Authentication middleware to verify JWT; placed after cookie parser/session
app.use(verifyAuthentication);

// Make authenticated user available to views via res.locals.user
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// CORS middleware for API routes (allow React frontend)
app.use("/api", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", env.FRONTEND_URL || "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Register API routes (JSON responses for React frontend)
app.use("/api/auth", apiAuthRoutes);
app.use("/api/links", apiShortnerRoutes);

// Register traditional routes (HTML/EJS responses)
app.use(authRoutes);
app.use("/", RouterUrl);

// Initialize database and start server
const startServer = async () => {
  try {
    // Optionally test DB connection here if needed
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  if (db && typeof db.end === "function") {
    await db.end();
    console.log("Database connection closed");
  }
  process.exit(0);
});

startServer();
