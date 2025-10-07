// Import Router from express and controller handlers
import { Router } from "express";
import { postShortner, getShortnerpage, redirectShortCode, getShortenerEditPage, updateShortLink ,deletShortCode} from "../controllers/postShortner.controller.js"; 

// Create an Express router instance
const router = Router();

// Serve the URL shortener form and list at the root path
router.get("/", getShortnerpage);

// Handle form submissions to create a new shortened URL
router.post('/', postShortner);

// Redirect a shortcode to its original URL (keep this route after specific routes to avoid conflicts)
router.get("/:shortcode", redirectShortCode); 

// Show edit page (GET) and apply updates to a short link (POST)
router.route("/edit/:id")
    .get(getShortenerEditPage)
    .post(updateShortLink);

// Remove a short code via POST
router.route("/delete/:id").post(deletShortCode);

// Export the configured router for use by the app
export default router;
