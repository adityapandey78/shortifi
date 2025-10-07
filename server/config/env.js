// Ensure dotenv loads FIRST so process.env is populated
import './dotenv.config.js';
import { z } from "zod";

// Define schema for expected environment variables and their defaults
export const env = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().optional().default(""),
    DATABASE_HOST: z.string().default("localhost"),
    DATABASE_USER: z.string().default("root"),
    DATABASE_PASSWORD: z.string().default(""),
    DATABASE_NAME: z.string().default("url_shortener"),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    GOOGLE_CLIENT_ID: z.string().optional().default(""),
    GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
    JWT_SECRET: z.string().default("fallback-jwt-secret-change-in-production"),
    RESEND_API_KEY: z.string().optional().default(""),
})
// Parse and validate process.env, applying defaults where values are missing
.parse(process.env);
