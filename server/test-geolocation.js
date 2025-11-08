import geoip from 'fast-geoip';

console.log('Testing fast-geoip geolocation...\n');

// Test with some public IPs
const testIPs = [
  '8.8.8.8',          // Google DNS (USA)
  '1.1.1.1',          // Cloudflare DNS (Australia registered)
  '208.67.222.222',   // OpenDNS (USA)
  '142.250.185.46',   // Google (USA)
  '127.0.0.1',        // Localhost
  '192.168.1.1',      // Private IP
];

async function testGeolocation() {
  for (const ip of testIPs) {
    try {
      const geo = await geoip.lookup(ip);
      console.log(`IP: ${ip}`);
      if (geo) {
        console.log(`  Country: ${geo.country}`);
        console.log(`  Region: ${geo.region}`);
        console.log(`  City: ${geo.city}`);
        console.log(`  Timezone: ${geo.timezone}`);
      } else {
        console.log('  No geolocation data found (likely localhost/private IP)');
      }
      console.log('---');
    } catch (error) {
      console.log(`IP: ${ip}`);
      console.log(`  Error: ${error.message}`);
      console.log('---');
    }
  }
  
  console.log('\nGeolocation test complete!');
}

testGeolocation();
