import crypto from "crypto";
import z from "zod";
import { loadLinks, saveLinks, getLinkByShortCode, findShortLinkById, updateShortLinkById,deleteShortCodeById } from "../services/shortner.services.js";
import { shortnerSchema } from "../validators/shortner-validator.js";
import { trackClick } from "../services/analytics.services.js";
import requestIp from "request-ip";

// Render the homepage with the list of short links (user-specific when logged in)
export const getShortnerpage = async (req, res) => {
    try {
        // Determine user context and load links
        const userId = req.user ? req.user.id : null;
        const links = await loadLinks(userId);
        
        // Detect login status from cookies
        let isLoggedIn = false;
        if (req.cookies && req.cookies.access_token) {
            isLoggedIn = true;
        }

        // Transform DB results into a template-friendly array
        const shortcodesList = links.map(link => ({
            shortCode: link.shortCode,
            url: link.url,
            host: req.get('host'),
            id: link.id
        }));
        
        const result = res.render('index', { 
            links: shortcodesList,
            isLoggedIn: isLoggedIn,
            errors: req.flash("errors")
        });
        
        return result;
    } catch (error) {
        console.error("Error in getShortnerpage:", error);
        return res.status(500).send("An unexpected error occurred while loading the homepage.");
    }
}

// Handle POST form to create a new short URL (requires authentication)
export const postShortner = async (req, res) => {
    try {
        console.log("POST request received:", req.body);
        const { url, shortCode } = req.body;
        
        // Require authenticated user
        if (!req.user) {
            req.flash("errors", "Please log in to create short links.");
            return res.redirect("/login");
        }
        
        console.log("Validating input with Zod:", { url, shortcode: shortCode });
        // Validate input using Zod schema
        const validation = shortnerSchema.safeParse({ url, shortcode: shortCode });
        if (!validation.success) {
            console.log("Validation failed:", validation.error.issues);
            
            // Collect validation messages and flash them
            const errorMessages = validation.error.issues.map(issue => issue.message);
            console.log("Validation error messages:", errorMessages);
            errorMessages.forEach(message => req.flash("errors", message));
            return res.redirect("/");
        }

        console.log("Validation passed");
        // Determine final shortcode (use provided or generate random)
        const finalShortCode = shortCode && shortCode.trim() 
            ? shortCode.trim() 
            : crypto.randomBytes(4).toString("hex");
        
        console.log("Final shortcode:", finalShortCode);
        
        // Prevent duplicate shortcodes
        const existingLink = await getLinkByShortCode(finalShortCode);
        
        if (existingLink) {
            console.log("Shortcode already exists");
            req.flash("errors", "A short code with that value already exists. Please choose another.");
            return res.redirect("/");
        }

        console.log("Saving to database");
        // Persist new mapping with user association
        await saveLinks(finalShortCode, url, req.user.id);
        
        console.log("Successfully saved");
        return res.redirect("/");
    } catch (error) {
        console.error("Error creating short URL:", error);
        console.error("Error stack:", error.stack);
        
        if (error.message === 'Short code already exists') {
            req.flash("errors", "This short code is already taken. Choose a different short code.");
            return res.redirect("/");
        }
        
        req.flash("errors", `An error occurred while creating the short URL: ${error.message}`);
        return res.redirect("/");
    }
}

// Redirect a request for a shortcode to its original URL
export const redirectShortCode = async (req, res) => {
    try {
        const { shortcode } = req.params;
        
        // Lookup shortcode in storage
        const link = await getLinkByShortCode(shortcode);
        
        // If not found, return a simple 404 HTML response
        if (!link) {
            return res.status(404).send(`
                <div style="text-align: center; margin-top: 50px;">
                    <h2>404 - Not Found</h2>
                    <p>The short code "${shortcode}" does not exist.</p>
                    <a href="/" style="color: #007bff;">← Go to Homepage</a>
                </div>
            `);
        }

        // Check if link is active
        if (!link.isActive) {
            return res.status(410).send(`
                <div style="text-align: center; margin-top: 50px;">
                    <h2>Link Inactive</h2>
                    <p>This link has been deactivated by the owner.</p>
                    <a href="/" style="color: #007bff;">← Go to Homepage</a>
                </div>
            `);
        }

        // Check if link has expired
        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
            return res.status(410).send(`
                <div style="text-align: center; margin-top: 50px;">
                    <h2>Link Expired</h2>
                    <p>This link has expired and is no longer available.</p>
                    <a href="/" style="color: #007bff;">← Go to Homepage</a>
                </div>
            `);
        }

        // Track the click analytics (async, don't wait for it)
        const clientIp = requestIp.getClientIp(req);
        const userAgent = req.get('user-agent') || '';
        const referer = req.get('referer') || req.get('referrer') || '';
        
        // Track analytics without blocking the redirect
        trackClick(link.id, {
            ip: clientIp,
            userAgent,
            referer,
        }).catch(err => {
            console.error('Error tracking click:', err);
        });

        // Redirect to the original URL
        return res.redirect(link.url);
    } catch (error) {
        console.error("Error in redirectShortCode:", error);
        return res.status(500).send("An unexpected error occurred while redirecting.");
    }
}

// Render edit page for a specific short link (user must be authenticated)
export const getShortenerEditPage= async(req,res)=>{
    if(!req.user) return res.redirect("/login");

    const {data:id,error}=z.coerce.number().int().safeParse(req.params.id);
    if(error) return res.redirect("/404");

    try {
        // Fetch the short link by id and render the edit form
        const shortLink= await findShortLinkById(id);
        if(!shortLink) return res.redirect("/404");

        res.render("edit-shortLink",{
            id:shortLink.id,
            url:shortLink.url,
            shortCode:shortLink.shortCode,
            error:req.flash("errors"),
        });
    } catch (error) {
        console.error("Error loading edit page:", error);
        return res.status(500).send("An unexpected error occurred while loading the edit page.");
    }
}

// Update an existing short link (validates input and enforces ownership)
export const updateShortLink = async (req, res) => {
    try {
        if (!req.user) {
            req.flash("errors", "Please log in to update short links.");
            return res.redirect("/login");
        }

        const { data: id, error: idError } = z.coerce.number().int().safeParse(req.params.id);
        if (idError) {
            req.flash("errors", "Invalid link ID provided.");
            return res.redirect("/");
        }

        const { url, shortCode } = req.body;
        
        // Validate URL and shortcode using schema
        const validation = shortnerSchema.safeParse({ url, shortcode: shortCode });
        if (!validation.success) {
            const errorMessages = validation.error.issues.map(issue => issue.message);
            errorMessages.forEach(message => req.flash("errors", message));
            return res.redirect(`/edit/${id}`);
        }

        // Ensure the link exists and belongs to the current user
        const existingLink = await findShortLinkById(id);
        if (!existingLink) {
            req.flash("errors", "Short link not found.");
            return res.redirect("/");
        }

        if (existingLink.userId !== req.user.id) {
            req.flash("errors", "You can only edit links you own.");
            return res.redirect("/");
        }

        // Check for conflicts if shortcode changed
        if (shortCode !== existingLink.shortCode) {
            const duplicateLink = await getLinkByShortCode(shortCode);
            if (duplicateLink && duplicateLink.id !== id) {
                req.flash("errors", "Short code is already in use. Please choose another.");
                return res.redirect(`/edit/${id}`);
            }
        }

        // Persist the update
        await updateShortLinkById(id, url, shortCode, req.user.id);
        
        console.log(`Successfully updated link ${id}: ${shortCode} -> ${url}`);
        return res.redirect("/");
    } catch (error) {
        console.error("Error updating short link:", error);
        
        if (error.message === 'Short code already exists') {
            req.flash("errors", "Short code already exists. Please choose another.");
            return res.redirect(`/edit/${req.params.id}`);
        }
        
        req.flash("errors", "An error occurred while updating the short link.");
        return res.redirect("/");
    }
}

// Delete a short code by id (requires authentication)
export const deletShortCode = async (req,res)=>{
    try {
        if(!req.user) return res.redirect("/login");

        // Validate id from params
        const {data:id,error}=z.coerce
                                .number()
                                .int()
                                .safeParse(req.params.id);
        if(error) return res.redirect("/404");

        // Perform deletion and return to homepage
        await deleteShortCodeById(id)

        return res.redirect("/");
    } catch (error) {
        console.error("Error deleting short link:", error);
        return res.status(500).send("An unexpected error occurred while deleting the short link.");
    }
}
