import geoip from 'fast-geoip';

// Test with various India IPs to see accuracy
const testIPs = [
  '103.21.163.81',   // Example India IP
  '106.51.25.11',    // Example India IP
  '117.239.195.165', // Example India IP
];

async function testIndianIPs() {
  console.log('Testing IP geolocation accuracy for Indian IPs...\n');
  
  for (const ip of testIPs) {
    const geo = await geoip.lookup(ip);
    console.log(`IP: ${ip}`);
    if (geo) {
      console.log(`  Country: ${geo.country}`);
      console.log(`  Region: ${geo.region}`);
      console.log(`  City: ${geo.city}`);
      console.log(`  Lat/Long: ${geo.ll}`);
      console.log(`  Timezone: ${geo.timezone}`);
    } else {
      console.log('  No data found');
    }
    console.log('---');
  }
  
  console.log('\nNote: IP geolocation shows ISP location, not exact user location.');
  console.log('This is a limitation of all IP-based geolocation services.');
}

testIndianIPs();
