import { db } from "../config/db-client.js";
import { analytics, short_links } from '../drizzle/schema.js';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { UAParser } from 'ua-parser-js';

/**
 * Analytics Service
 * Handles tracking and retrieval of link analytics data
 */

/**
 * Parse user agent string to extract device, browser, and OS information
 */
function parseUserAgent(userAgentString) {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  return {
    // Device info
    deviceType: result.device.type || 'desktop', // mobile, tablet, desktop
    deviceVendor: result.device.vendor || null,
    deviceModel: result.device.model || null,
    
    // Browser info
    browser: result.browser.name || null,
    browserVersion: result.browser.version || null,
    
    // OS info
    os: result.os.name || null,
    osVersion: result.os.version || null,
  };
}

/**
 * Get approximate location from IP address
 * Note: For production, consider using a premium GeoIP service or MaxMind GeoIP2
 */
function getLocationFromIP(ip) {
  // Basic implementation - in production, use MaxMind GeoIP2 or similar
  // For now, return null values - you can integrate MaxMind later
  return {
    country: null,
    region: null,
    city: null,
    timezone: null,
  };
}

/**
 * Track a click on a short link
 * @param {number} linkId - The ID of the short link
 * @param {Object} requestData - Request data containing IP, userAgent, referer
 * @returns {Promise<Object>} The created analytics record
 */
export const trackClick = async (linkId, requestData) => {
  try {
    const { ip, userAgent, referer } = requestData;
    
    // Parse user agent to get device/browser/OS info
    const deviceInfo = parseUserAgent(userAgent);
    
    // Get location from IP (basic implementation)
    const locationInfo = getLocationFromIP(ip);
    
    // Insert analytics record
    const result = await db.insert(analytics).values({
      linkId,
      ip,
      userAgent,
      referer: referer || null,
      ...deviceInfo,
      ...locationInfo,
    }).returning();
    
    // Increment click count on the short link
    await db.update(short_links)
      .set({ 
        clickCount: sql`${short_links.clickCount} + 1` 
      })
      .where(eq(short_links.id, linkId));
    
    return result[0];
  } catch (error) {
    console.error("Error tracking click:", error);
    throw error;
  }
};

/**
 * Get analytics summary for a specific link
 * @param {number} linkId - The ID of the short link
 * @returns {Promise<Object>} Analytics summary with counts and breakdowns
 */
export const getLinkAnalytics = async (linkId) => {
  try {
    // Get all clicks for this link
    const clicks = await db.select()
      .from(analytics)
      .where(eq(analytics.linkId, linkId))
      .orderBy(desc(analytics.clickedAt));
    
    // Get link details with click count
    const link = await db.select()
      .from(short_links)
      .where(eq(short_links.id, linkId))
      .limit(1);
    
    if (!link || link.length === 0) {
      return null;
    }
    
    // Calculate aggregations
    const totalClicks = clicks.length;
    
    // Group by device type
    const deviceBreakdown = clicks.reduce((acc, click) => {
      const device = click.deviceType || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    
    // Group by browser
    const browserBreakdown = clicks.reduce((acc, click) => {
      const browser = click.browser || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});
    
    // Group by OS
    const osBreakdown = clicks.reduce((acc, click) => {
      const os = click.os || 'Unknown';
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {});
    
    // Group by country
    const countryBreakdown = clicks.reduce((acc, click) => {
      const country = click.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    
    // Group by date (for time series chart)
    const clicksByDate = clicks.reduce((acc, click) => {
      const date = new Date(click.clickedAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Get top referrers
    const referrerBreakdown = clicks
      .filter(click => click.referer)
      .reduce((acc, click) => {
        const referer = click.referer;
        acc[referer] = (acc[referer] || 0) + 1;
        return acc;
      }, {});
    
    return {
      linkId,
      shortCode: link[0].shortCode,
      url: link[0].url,
      totalClicks: link[0].clickCount,
      analytics: {
        totalClicks,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        countryBreakdown,
        clicksByDate,
        referrerBreakdown,
      },
      recentClicks: clicks.slice(0, 10), // Last 10 clicks
    };
  } catch (error) {
    console.error("Error getting link analytics:", error);
    throw error;
  }
};

/**
 * Get analytics for all links belonging to a user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Array of link analytics
 */
export const getUserAnalytics = async (userId) => {
  try {
    // Get all links for the user
    const links = await db.select()
      .from(short_links)
      .where(eq(short_links.userId, userId))
      .orderBy(desc(short_links.createdAt));
    
    // Get analytics for each link
    const analyticsPromises = links.map(link => 
      getLinkAnalytics(link.id)
    );
    
    const allAnalytics = await Promise.all(analyticsPromises);
    
    return allAnalytics.filter(a => a !== null);
  } catch (error) {
    console.error("Error getting user analytics:", error);
    throw error;
  }
};

/**
 * Get analytics for a specific time period
 * @param {number} linkId - The ID of the short link
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} Analytics for the specified period
 */
export const getLinkAnalyticsByPeriod = async (linkId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const clicks = await db.select()
      .from(analytics)
      .where(
        and(
          eq(analytics.linkId, linkId),
          gte(analytics.clickedAt, startDate)
        )
      )
      .orderBy(desc(analytics.clickedAt));
    
    return {
      period: `${days} days`,
      totalClicks: clicks.length,
      clicks,
    };
  } catch (error) {
    console.error("Error getting analytics by period:", error);
    throw error;
  }
};

/**
 * Get overall statistics for a user's links
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Overall statistics
 */
export const getUserOverallStats = async (userId) => {
  try {
    // Get all links for the user
    const links = await db.select()
      .from(short_links)
      .where(eq(short_links.userId, userId));
    
    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
    const activeLinks = links.filter(link => link.isActive).length;
    
    // Get most clicked link
    const mostClickedLink = links.reduce((max, link) => 
      (link.clickCount > (max?.clickCount || 0)) ? link : max
    , null);
    
    return {
      totalLinks,
      totalClicks,
      activeLinks,
      inactiveLinks: totalLinks - activeLinks,
      mostClickedLink: mostClickedLink ? {
        id: mostClickedLink.id,
        shortCode: mostClickedLink.shortCode,
        url: mostClickedLink.url,
        clicks: mostClickedLink.clickCount,
      } : null,
    };
  } catch (error) {
    console.error("Error getting user overall stats:", error);
    throw error;
  }
};
