import express from "express";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";

import { db } from "./config/db-client.js";
import { env } from "./config/env.js";
import { apiAuthRoutes } from "./routes/api-auth.routes.js";
import { apiShortnerRoutes } from "./routes/api-shortner.routes.js";
import { verifyAuthentication } from "./middlewares/verify-auth.middleware.js";
import { redirectShortCode } from "./controllers/postShortner.controller.js";

// Create Express application
const app = express();
const PORT = env.PORT;

// Middleware setup
app.use(express.json()); // JSON body parser for API routes
app.use(cookieParser()); // Cookie parser for JWT auth

// Get client IP
app.use(requestIp.mw());

// Authentication middleware to verify JWT from cookies
app.use(verifyAuthentication);

// CORS middleware for API routes (allow React frontend)
app.use("/api", (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "https://shortifii.vercel.app",
    "https://shortifi.vercel.app"
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Register API routes (JSON responses for React frontend)
app.use("/api/auth", apiAuthRoutes);
app.use("/api/links", apiShortnerRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Shortifi API is running",
    timestamp: new Date().toISOString()
  });
});

// Shortcode redirect route (must be last to avoid conflicts with other routes)
// GET /:shortcode - Redirects to the original URL
app.get("/:shortcode", redirectShortCode);

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

// Start server only if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

// Export for Vercel serverless
export default app;
