#!/usr/bin/env node
/**
 * Gera favicons e icones PWA a partir da marca real.
 *
 * FONTES (versionadas, nao mexer sem trocar a marca):
 *   public/favicon-source.png          — icone quadrado 400x400
 *   public/melhor-lava-e-seca-logo.png — logomarca horizontal transparente
 *
 * Outputs:
 *   public/favicon-16x16.png
 *   public/favicon-32x32.png
 *   public/favicon-48x48.png
 *   public/favicon.ico (multi-size)
 *   public/apple-touch-icon.png (180x180)
 *   public/android-chrome-192x192.png
 *   public/android-chrome-512x512.png
 *   public/og/og-default.png (1200x630)
 *
 * ATENCAO: este script roda no postinstall, ou seja, a cada `npm ci` do
 * workflow do blog (3x por dia). Tudo que ele gera e sobrescrito nessas horas.
 * Nao edite os arquivos de saida na mao — edite a fonte aqui em cima.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICON_SRC = path.join(ROOT, 'public', 'favicon-source.png');
const LOGO_SRC = path.join(ROOT, 'public', 'melhor-lava-e-seca-logo.png');
const OG_DIR = path.join(ROOT, 'public', 'og');

if (!fs.existsSync(ICON_SRC)) {
  console.log('ℹ️  public/favicon-source.png nao existe. Pulei a geracao de favicons.');
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
];

async function main() {
  for (const { size, name } of SIZES) {
    const out = path.join(ROOT, 'public', name);
    await sharp(ICON_SRC).resize(size, size).png().toFile(out);
    console.log(`✅ ${name} (${size}x${size})`);
  }

  // favicon.ico (multi-size — 16/32/48)
  try {
    const ico16 = await sharp(ICON_SRC).resize(16, 16).png().toBuffer();
    const ico32 = await sharp(ICON_SRC).resize(32, 32).png().toBuffer();
    const ico48 = await sharp(ICON_SRC).resize(48, 48).png().toBuffer();
    const ico = pngsToIco([ico16, ico32, ico48]);
    fs.writeFileSync(path.join(ROOT, 'public', 'favicon.ico'), ico);
    console.log('✅ favicon.ico (16/32/48)');
  } catch (err) {
    console.warn('⚠️  favicon.ico falhou:', err.message);
  }

  // og default 1200x630.
  // Fundo claro, e nao o degrade azul de antes: a logomarca tem o "Melhor" em
  // azul escuro e sumiria em cima de azul.
  const ogFundo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#E8F1FF"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="606" width="1200" height="24" fill="#0B5FFF"/>
  <text x="100" y="430" fill="#0A2A5E" font-family="Inter, Arial" font-size="40" font-weight="700">Reviews honestos das melhores de 2026</text>
  <text x="100" y="500" fill="#5A6B85" font-family="Inter, Arial" font-size="30" font-weight="500">melhorlavaeseca.com</text>
</svg>
  `.trim();

  const logoOg = await sharp(LOGO_SRC).resize({ width: 620 }).png().toBuffer();

  await sharp(Buffer.from(ogFundo))
    .composite([{ input: logoOg, left: 100, top: 150 }])
    .png()
    .toFile(path.join(OG_DIR, 'og-default.png'));
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
