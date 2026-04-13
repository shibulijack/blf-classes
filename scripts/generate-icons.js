// Simple script to generate BLF PWA icons as SVGs
// Run: node scripts/generate-icons.js
const fs = require("fs");
const path = require("path");

function generateSVG(size) {
  const fontSize = Math.round(size * 0.3);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#2563eb"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-weight="700" font-size="${fontSize}">BLF</text>
</svg>`;
}

const iconsDir = path.join(__dirname, "..", "public", "icons");

// Write SVG files (browsers accept SVG icons, and for PNG we'd need sharp/canvas)
fs.writeFileSync(path.join(iconsDir, "icon-192.svg"), generateSVG(192));
fs.writeFileSync(path.join(iconsDir, "icon-512.svg"), generateSVG(512));

console.log("SVG icons generated in public/icons/");
console.log("For production PNG icons, convert these SVGs using any image tool.");
