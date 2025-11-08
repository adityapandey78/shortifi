import { db } from "../config/db-client.js";
import { analytics, short_links } from '../drizzle/schema.js';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { UAParser } from 'ua-parser-js';
import geoip from 'fast-geoip';
import { getRegionName, getCountryName } from '../lib/geo-utils.js';

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
 * Get location information from IP address using fast-geoip
 * @param {string} ip - IP address to lookup
 * @returns {Promise<Object>} Location information
 */
async function getLocationFromIP(ip) {
  try {
    // Handle localhost and private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        country: 'Local',
        region: 'Local Network',
        city: 'Local',
        timezone: null,
      };
    }

    // Clean IPv6-mapped IPv4 addresses (e.g., ::ffff:192.168.1.1 -> 192.168.1.1)
    const cleanedIp = ip.replace(/^::ffff:/i, '');
    
    const geo = await geoip.lookup(cleanedIp);
    
    if (geo) {
      // Get full country and region names
      const countryName = getCountryName(geo.country);
      const regionName = getRegionName(geo.region, geo.country);
      
      return {
        country: countryName || geo.country || null,
        region: regionName || geo.region || null,
        city: geo.city || null,
        timezone: geo.timezone || null,
      };
    }
    
    // If lookup fails, return null values
    return {
      country: null,
      region: null,
      city: null,
      timezone: null,
    };
  } catch (error) {
    console.error('Error in getLocationFromIP:', error);
    return {
      country: null,
      region: null,
      city: null,
      timezone: null,
    };
  }
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
    
    // Get location from IP (async operation)
    const locationInfo = await getLocationFromIP(ip);
    
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
    
    // Get link details
    const link = await db.select()
      .from(short_links)
      .where(eq(short_links.id, linkId))
      .limit(1);
    
    if (!link || link.length === 0) {
      return null;
    }
    
    // Use actual analytics records count for accurate total clicks
    const totalClicks = clicks.length;
    
    // Sync the clickCount in short_links table if it's different
    if (link[0].clickCount !== totalClicks) {
      await db.update(short_links)
        .set({ clickCount: totalClicks })
        .where(eq(short_links.id, linkId));
    }
    
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
    
    // Group by country and region combined for better geographic insights
    const countryBreakdown = clicks.reduce((acc, click) => {
      const country = click.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    
    // Separate region breakdown
    const regionBreakdown = clicks.reduce((acc, click) => {
      if (click.region) {
        const regionKey = click.country ? `${click.region}, ${click.country}` : click.region;
        acc[regionKey] = (acc[regionKey] || 0) + 1;
      }
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
      totalClicks,
      analytics: {
        totalClicks,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        countryBreakdown,
        regionBreakdown,
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
