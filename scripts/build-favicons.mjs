#!/usr/bin/env node
/**
 * Gera favicons e icones PWA a partir do SVG em public/favicon.svg
 * Outputs:
 *   public/favicon-16x16.png
 *   public/favicon-32x32.png
 *   public/favicon-48x48.png
 *   public/favicon.ico (multi-size)
 *   public/apple-touch-icon.png (180x180)
 *   public/android-chrome-192x192.png
 *   public/android-chrome-512x512.png
 *   public/logo.png (512x512 transparente)
 *   public/og/og-default.png (1200x630)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SVG = path.join(ROOT, 'public', 'favicon.svg');
const OG_DIR = path.join(ROOT, 'public', 'og');

if (!fs.existsSync(SVG)) {
  console.log('ℹ️  public/favicon.svg ainda nao existe. Pulei a geracao de favicons.');
  process.exit(0);
}

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('⚠️  sharp nao instalado ainda. Pulei a geracao de favicons.');
  process.exit(0);
}

fs.mkdirSync(OG_DIR, { recursive: true });

const SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 512, name: 'logo.png' },
];

async function main() {
  const svg = fs.readFileSync(SVG);

  for (const { size, name } of SIZES) {
    const out = path.join(ROOT, 'public', name);
    await sharp(svg, { density: 300 })
      .resize(size, size)
      .png()
      .toFile(out);
    console.log(`✅ ${name} (${size}x${size})`);
  }

  // favicon.ico (multi-size — 16/32/48)
  try {
    const ico16 = await sharp(svg, { density: 300 }).resize(16, 16).png().toBuffer();
    const ico32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
    const ico48 = await sharp(svg, { density: 300 }).resize(48, 48).png().toBuffer();
    const ico = pngsToIco([ico16, ico32, ico48]);
    fs.writeFileSync(path.join(ROOT, 'public', 'favicon.ico'), ico);
    console.log('✅ favicon.ico (16/32/48)');
  } catch (err) {
    console.warn('⚠️  favicon.ico falhou:', err.message);
  }

  // og default 1200x630 com fundo gradiente azul
  const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B5FFF"/>
      <stop offset="1" stop-color="#0847B8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(100 200)">
    <rect x="-10" y="-40" width="160" height="160" rx="36" fill="rgba(255,255,255,0.12)"/>
    <circle cx="70" cy="40" r="48" fill="#fff"/>
    <circle cx="70" cy="40" r="26" fill="#E8F1FF"/>
    <circle cx="70" cy="40" r="10" fill="#0B5FFF"/>
  </g>
  <text x="300" y="280" fill="#fff" font-family="Inter, Arial" font-size="72" font-weight="800">Melhor Lava e Seca</text>
  <text x="300" y="360" fill="rgba(255,255,255,0.85)" font-family="Inter, Arial" font-size="36" font-weight="500">Reviews honestos das melhores de 2026</text>
  <text x="300" y="480" fill="rgba(255,255,255,0.7)" font-family="Inter, Arial" font-size="28" font-weight="500">melhorlavaeseca.com</text>
</svg>
  `.trim();
  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(OG_DIR, 'og-default.png'));
  console.log('✅ og/og-default.png (1200x630)');
}

// Converte PNGs em ICO (implementacao minima)
function pngsToIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  pngBuffers.forEach((buf, i) => {
    const dims = pngDim(buf);
    dir.writeUInt8(dims.w === 256 ? 0 : dims.w, 16 * i + 0);
    dir.writeUInt8(dims.h === 256 ? 0 : dims.h, 16 * i + 1);
    dir.writeUInt8(0, 16 * i + 2);
    dir.writeUInt8(0, 16 * i + 3);
    dir.writeUInt16LE(1, 16 * i + 4);
    dir.writeUInt16LE(32, 16 * i + 6);
    dir.writeUInt32LE(buf.length, 16 * i + 8);
    dir.writeUInt32LE(offset, 16 * i + 12);
    offset += buf.length;
  });

  return Buffer.concat([header, dir, ...pngBuffers]);
}

function pngDim(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
