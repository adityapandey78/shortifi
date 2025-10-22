import crypto from "crypto";
import z from "zod";
import { 
    loadLinks, 
    saveLinks, 
    getLinkByShortCode, 
    findShortLinkById, 
    updateShortLinkById,
    deleteShortCodeById 
} from "../services/shortner.services.js";
import { shortnerSchema } from "../validators/shortner-validator.js";

/**
 * JSON API Controllers for Shortener
 * These return JSON instead of HTML for the React frontend
 */

/**
 * GET /api/links
 * Get all short links for the authenticated user
 * Returns: { success, links[] }
 */
export const apiGetAllLinks = async (req, res) => {
    try {
        // Allow fetching links even when not logged in (public links)
        const userId = req.user ? req.user.id : null;
        const links = await loadLinks(userId);

        // Transform to clean JSON format
        const linksData = links.map(link => ({
            id: link.id,
            shortCode: link.shortCode,
            url: link.url,
            userId: link.userId,
            createdAt: link.createdAt,
            // Include full short URL for convenience
            shortUrl: `${req.protocol}://${req.get('host')}/${link.shortCode}`,
        }));

        return res.json({ success: true, links: linksData });
    } catch (error) {
        console.error("API Get All Links error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch links" });
    }
};

/**
 * POST /api/links
 * Create a new short link
 * Body: { url, shortCode? }
 * Returns: { success, link, message }
 */
export const apiCreateShortLink = async (req, res) => {
    try {
        // Require authentication
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Please log in to create short links" });
        }

        const { url, shortCode } = req.body;

        // Validate input
        const validation = shortnerSchema.safeParse({ url, shortcode: shortCode });
        if (!validation.success) {
            const errorMessage = validation.error.issues[0]?.message || "Validation error";
            return res.status(400).json({ success: false, message: errorMessage });
        }

        // Determine final shortcode (use provided or generate random)
        const finalShortCode = shortCode && shortCode.trim() 
            ? shortCode.trim() 
            : crypto.randomBytes(4).toString("hex");

        // Check if shortcode already exists
        const existingLink = await getLinkByShortCode(finalShortCode);
        if (existingLink) {
            return res.status(400).json({ 
                success: false, 
                message: "Short code already exists. Please choose another." 
            });
        }

        // Save the link
        const newLink = await saveLinks(finalShortCode, url, req.user.id);

        return res.status(201).json({
            success: true,
            message: "Short link created successfully",
            link: {
                id: newLink.id,
                shortCode: finalShortCode,
                url: url,
                shortUrl: `${req.protocol}://${req.get('host')}/${finalShortCode}`,
                createdAt: newLink.createdAt,
            },
        });
    } catch (error) {
        console.error("API Create Short Link error:", error);
        
        if (error.message === 'Short code already exists') {
            return res.status(400).json({ 
                success: false, 
                message: "Short code already exists. Please choose another." 
            });
        }
        
        return res.status(500).json({ success: false, message: "Failed to create short link" });
    }
};

/**
 * GET /api/links/:id
 * Get a specific short link by ID
 * Returns: { success, link }
 */
export const apiGetShortLink = async (req, res) => {
    try {
        // Require authentication
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        // Validate ID
        const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
        if (error) {
            return res.status(400).json({ success: false, message: "Invalid link ID" });
        }

        // Fetch link
        const link = await findShortLinkById(id);
        if (!link) {
            return res.status(404).json({ success: false, message: "Short link not found" });
        }

        // Verify ownership
        if (link.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "You can only view links you own" });
        }

        return res.json({
            success: true,
            link: {
                id: link.id,
                shortCode: link.shortCode,
                url: link.url,
                userId: link.userId,
                createdAt: link.createdAt,
                shortUrl: `${req.protocol}://${req.get('host')}/${link.shortCode}`,
            },
        });
    } catch (error) {
        console.error("API Get Short Link error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch link" });
    }
};

/**
 * PUT /api/links/:id
 * Update a short link
 * Body: { url, shortCode }
 * Returns: { success, link, message }
 */
export const apiUpdateShortLink = async (req, res) => {
    try {
        // Require authentication
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        // Validate ID
        const { data: id, error: idError } = z.coerce.number().int().safeParse(req.params.id);
        if (idError) {
            return res.status(400).json({ success: false, message: "Invalid link ID" });
        }

        const { url, shortCode } = req.body;

        // Validate input
        const validation = shortnerSchema.safeParse({ url, shortcode: shortCode });
        if (!validation.success) {
            const errorMessage = validation.error.issues[0]?.message || "Validation error";
            return res.status(400).json({ success: false, message: errorMessage });
        }

        // Ensure link exists and belongs to user
        const existingLink = await findShortLinkById(id);
        if (!existingLink) {
            return res.status(404).json({ success: false, message: "Short link not found" });
        }

        if (existingLink.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "You can only edit links you own" });
        }

        // Check for shortcode conflicts if changed
        if (shortCode !== existingLink.shortCode) {
            const duplicateLink = await getLinkByShortCode(shortCode);
            if (duplicateLink && duplicateLink.id !== id) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Short code is already in use. Please choose another." 
                });
            }
        }

        // Update the link
        await updateShortLinkById(id, url, shortCode, req.user.id);

        return res.json({
            success: true,
            message: "Short link updated successfully",
            link: {
                id: id,
                shortCode: shortCode,
                url: url,
                shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
            },
        });
    } catch (error) {
        console.error("API Update Short Link error:", error);
        
        if (error.message === 'Short code already exists') {
            return res.status(400).json({ 
                success: false, 
                message: "Short code already exists. Please choose another." 
            });
        }
        
        return res.status(500).json({ success: false, message: "Failed to update short link" });
    }
};

/**
 * DELETE /api/links/:id
 * Delete a short link
 * Returns: { success, message }
 */
export const apiDeleteShortLink = async (req, res) => {
    try {
        // Require authentication
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        // Validate ID
        const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
        if (error) {
            return res.status(400).json({ success: false, message: "Invalid link ID" });
        }

        // Verify ownership before deleting
        const existingLink = await findShortLinkById(id);
        if (!existingLink) {
            return res.status(404).json({ success: false, message: "Short link not found" });
        }

        if (existingLink.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "You can only delete links you own" });
        }

        // Delete the link
        await deleteShortCodeById(id);

        return res.json({ success: true, message: "Short link deleted successfully" });
    } catch (error) {
        console.error("API Delete Short Link error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete short link" });
    }
};
