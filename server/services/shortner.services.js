import { db } from "../config/db-client.js";
import { eq, desc } from 'drizzle-orm';
import { short_links } from '../drizzle/schema.js';

// Load all links for a user, newest first
export const loadLinks = async (userId) => {
    try {
        let query = db
                    .select()
                    .from(short_links)
                    .where(eq(short_links.userId,userId))
                    .orderBy(desc(short_links.id));
        
        const rows = await query;
        return rows;
    } catch (error) {
        console.error("Error loading links from database:", error);
        return [];
    }
};

// Find a single link by its short code
export const getLinkByShortCode = async (shortCode) => {
    try {
        const rows = await db.select()
                             .from(short_links)
                             .where(eq(short_links.shortCode, shortCode));
        return rows[0] || null;
    } catch (error) {
        console.error("Error finding link by short code:", error);
        return null;
    }
};

// Save a new short link record
export const saveLinks = async (shortCode, url, userId) => {
    try {
        const result = await db.insert(short_links).values({ 
            shortCode, 
            url, 
            userId 
        });
        return result;
    } catch (error) {
        console.error("Error saving link to database:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Short code already exists');
        }
        throw error;
    }
};

// Retrieve a short link by its numeric ID
export const findShortLinkById= async(id)=>{
    try {
        const rows = await db.select()
                         .from(short_links)
                         .where(eq(short_links.id, id));
        return rows[0] || null;
    } catch (error) {
        console.error("Error geting the shortlink by id",error)
        return null;
    }
    
}

// Update url and shortCode for an existing short link by ID
export const updateShortLinkById = async (id, url, shortCode, userId) => {
    try {
        const result = await db.update(short_links)
                              .set({ url, shortCode })
                              .where(eq(short_links.id, id));
        return result;
    } catch (error) {
        console.error("Error updating short link:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Short code already exists');
        }
        throw error;
    }
}

// Delete a short link by its ID
export const deleteShortCodeById=async(id)=>{
    try {
        const delRes= await db.delete(short_links)
                        .where(eq(short_links.id,id))
        console.log("Link deleted successfully");
        return delRes;
        
        
    } catch (error) {
        console.error(error);
        console.error("Error deleting the link!");
        
    }
}
