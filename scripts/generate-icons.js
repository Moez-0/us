import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp SVG design for Us.
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="108" fill="#0D0F18"/>
  <defs>
    <linearGradient id="coralPlum" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E27D60" />
      <stop offset="50%" stop-color="#C25975" />
      <stop offset="100%" stop-color="#7B506F" />
    </linearGradient>
    <radialGradient id="softGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E27D60" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0D0F18" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Background subtle glow -->
  <circle cx="256" cy="256" r="210" fill="url(#softGlow)" />
  
  <!-- Interconnected couple rings -->
  <circle cx="210" cy="240" r="100" fill="none" stroke="url(#coralPlum)" stroke-width="16" stroke-linecap="round" opacity="0.9"/>
  <circle cx="302" cy="240" r="100" fill="none" stroke="#D4CCE3" stroke-width="16" stroke-linecap="round" opacity="0.85"/>
  
  <!-- Center intersection heart essence -->
  <path d="M256 205 C256 190, 240 180, 226 192 C210 206, 256 250, 256 250 C256 250, 302 206, 286 192 C272 180, 256 190, 256 205 Z" fill="#E27D60" />

  <!-- App Title Typography -->
  <text x="256" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Geist', 'Inter', sans-serif" font-size="52" font-weight="600" fill="#FAF8F5" letter-spacing="4" text-anchor="middle">Us.</text>
</svg>`;

// Maskable icon with safe zone padding (central 80%)
const maskableSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#0D0F18"/>
  <defs>
    <linearGradient id="coralPlumM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E27D60" />
      <stop offset="50%" stop-color="#C25975" />
      <stop offset="100%" stop-color="#7B506F" />
    </linearGradient>
  </defs>
  <g transform="translate(51, 51) scale(0.8)">
    <circle cx="210" cy="230" r="90" fill="none" stroke="url(#coralPlumM)" stroke-width="16" stroke-linecap="round" opacity="0.9"/>
    <circle cx="302" cy="230" r="90" fill="none" stroke="#D4CCE3" stroke-width="16" stroke-linecap="round" opacity="0.85"/>
    <path d="M256 200 C256 186, 242 176, 228 188 C214 200, 256 240, 256 240 C256 240, 298 200, 284 188 C270 176, 256 186, 256 200 Z" fill="#E27D60" />
    <text x="256" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Geist', 'Inter', sans-serif" font-size="46" font-weight="600" fill="#FAF8F5" letter-spacing="4" text-anchor="middle">Us.</text>
  </g>
</svg>`;

const ogSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBackground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#101322" />
      <stop offset="100%" stop-color="#2C1E37" />
    </linearGradient>
    <linearGradient id="ogAccent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF3366" />
      <stop offset="100%" stop-color="#8338EC" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#ogBackground)" />
  <circle cx="935" cy="315" r="210" fill="none" stroke="#FF3366" stroke-width="22" opacity="0.9" />
  <circle cx="1065" cy="315" r="210" fill="none" stroke="#FFD166" stroke-width="22" opacity="0.82" />
  <path d="M1000 240 C1000 205 960 185 930 220 C900 255 1000 345 1000 345 C1000 345 1100 255 1070 220 C1040 185 1000 205 1000 240 Z" fill="url(#ogAccent)" />
  <rect x="78" y="82" width="112" height="48" fill="#FF3366" />
  <text x="134" y="115" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#FFFFFF" text-anchor="middle">US.</text>
  <text x="78" y="270" font-family="Arial, sans-serif" font-size="76" font-weight="700" fill="#FAF8F5">A private place</text>
  <text x="78" y="360" font-family="Arial, sans-serif" font-size="76" font-weight="700" fill="#FAF8F5">for two.</text>
  <text x="82" y="438" font-family="Arial, sans-serif" font-size="30" fill="#D4CCE3">Moez and Eliza, wherever you are.</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

async function generate() {
  const svgBuffer = Buffer.from(svgContent);
  const maskableBuffer = Buffer.from(maskableSvgContent);

  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(maskableBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(Buffer.from(ogSvgContent)).resize(1200, 630).png().toFile(path.join(publicDir, 'og-image.png'));

  console.log('Successfully generated all PWA and web icons!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
