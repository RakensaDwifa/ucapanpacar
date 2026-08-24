// Simple script to generate placeholder PNG icons for PWA
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Minimal 1x1 transparent PNG base64
const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(transparentPngBase64, 'base64');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

sizes.forEach(size => {
  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Created icon-${size}x${size}.png`);
});

console.log('All placeholder icons created. Replace with actual icons later.');