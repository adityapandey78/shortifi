import { db } from "./config/db-client.js";
import { analytics } from './drizzle/schema.js';
import { isNull, or, eq } from 'drizzle-orm';
import geoip from 'fast-geoip';
import { getRegionName, getCountryName } from './lib/geo-utils.js';

/**
 * Backfill geolocation data for existing analytics records
 * This script updates analytics records that have IP addresses but missing location data
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

    // Clean IPv6-mapped IPv4 addresses
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
    
    return {
      country: null,
      region: null,
      city: null,
      timezone: null,
    };
  } catch (error) {
    console.error(`Error looking up IP ${ip}:`, error.message);
    return {
      country: null,
      region: null,
      city: null,
      timezone: null,
    };
  }
}

async function backfillGeolocation() {
  try {
    console.log('Starting geolocation backfill with improved region names...\n');

    // Find ALL analytics records to update with full region names
    const recordsToUpdate = await db.select()
      .from(analytics);

    console.log(`Found ${recordsToUpdate.length} records to update\n`);

    if (recordsToUpdate.length === 0) {
      console.log('No records found. Database might be empty.');
      return;
    }

    let updated = 0;
    let failed = 0;

    for (const record of recordsToUpdate) {
      try {
        if (!record.ip) {
          console.log(`Skipping record ${record.id} - no IP address`);
          failed++;
          continue;
        }

        const location = await getLocationFromIP(record.ip);
        
        await db.update(analytics)
          .set({
            country: location.country,
            region: location.region,
            city: location.city,
            timezone: location.timezone,
          })
          .where(eq(analytics.id, record.id));

        updated++;
        
        if (updated % 10 === 0) {
          console.log(`Progress: ${updated}/${recordsToUpdate.length} records updated...`);
        }
      } catch (error) {
        console.error(`Failed to update record ${record.id}:`, error.message);
        failed++;
      }
    }

    console.log('\n=== Backfill Complete ===');
    console.log(`✓ Successfully updated: ${updated} records`);
    console.log(`✗ Failed: ${failed} records`);
    console.log(`Total processed: ${recordsToUpdate.length} records`);
    console.log('\n💡 Region names now show full names (e.g., "Jharkhand" instead of "JH")');

  } catch (error) {
    console.error('Error during backfill:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the backfill
backfillGeolocation();
