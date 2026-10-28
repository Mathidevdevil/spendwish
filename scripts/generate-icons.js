const fs = require('fs');
const sharp = require('sharp');

if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

const svg = (size) => Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#grad)" />
  <path d="M120 180 C120 157.9 137.9 140 160 140 L380 140 C397.7 140 412 154.3 412 172 C412 189.7 397.7 204 380 204 L120 204 Z" fill="rgba(255,255,255,0.7)" />
  <rect x="100" y="190" width="312" height="190" rx="24" fill="white" />
  <circle cx="350" cy="285" r="20" fill="#2563eb" />
</svg>
`);

Promise.all([
  sharp(svg(192)).resize(192, 192).png().toFile('public/icons/icon-192.png'),
  sharp(svg(512)).resize(512, 512).png().toFile('public/icons/icon-512.png')
]).then(() => {
  console.log('Spendwise PWA icons generated successfully in public/icons/');
}).catch((err) => {
  console.error(err);
});
