import { Router } from "express";
import * as apiShortnerControllers from "../controllers/api-shortner.controller.js";

/**
 * JSON API Routes for URL Shortener
 * All routes return JSON responses for the React frontend
 * Base path: /api/links
 */
const router = Router();

// Get all short links for authenticated user
// GET /api/links
router.get("/", apiShortnerControllers.apiGetAllLinks);

// Create a new short link
// POST /api/links
// Body: { url, shortCode? }
router.post("/", apiShortnerControllers.apiCreateShortLink);

// Get a specific short link by ID
// GET /api/links/:id
router.get("/:id", apiShortnerControllers.apiGetShortLink);

// Update a short link
// PUT /api/links/:id
// Body: { url, shortCode }
router.put("/:id", apiShortnerControllers.apiUpdateShortLink);

// Delete a short link
// DELETE /api/links/:id
router.delete("/:id", apiShortnerControllers.apiDeleteShortLink);

export const apiShortnerRoutes = router;
