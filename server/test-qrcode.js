import QRCode from 'qrcode';

console.log('Testing QRCode library...\n');

const testUrl = 'https://example.com/test';

async function testQRGeneration() {
  try {
    console.log('1. Testing Data URL generation...');
    const dataURL = await QRCode.toDataURL(testUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('✓ Data URL generated successfully');
    console.log('  Length:', dataURL.length, 'characters');
    console.log('  Preview:', dataURL.substring(0, 50) + '...\n');

    console.log('2. Testing Buffer generation (PNG)...');
    const buffer = await QRCode.toBuffer(testUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });
    console.log('✓ Buffer generated successfully');
    console.log('  Size:', buffer.length, 'bytes\n');

    console.log('3. Testing SVG string generation...');
    const svgString = await QRCode.toString(testUrl, { 
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });
    console.log('✓ SVG generated successfully');
    console.log('  Length:', svgString.length, 'characters');
    console.log('  Preview:', svgString.substring(0, 50) + '...\n');

    console.log('=== All QR Code generation tests passed! ===');
    
  } catch (error) {
    console.error('❌ QR Code generation failed:', error);
  }
}

testQRGeneration();
