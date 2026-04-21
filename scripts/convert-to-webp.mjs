#!/usr/bin/env node
/**
 * Converte todas as imagens jpg/png em public/images/products-raw/
 * para webp otimizado em public/images/products/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'images', 'products-raw');
const DEST = path.join(ROOT, 'public', 'images', 'products');

fs.mkdirSync(DEST, { recursive: true });

const files = fs.existsSync(SRC) ? fs.readdirSync(SRC) : [];
const targets = files.filter((f) => /\.(jpe?g|png)$/i.test(f));

if (targets.length === 0) {
  console.log('ℹ️  Nenhuma imagem em products-raw. Rode antes: npm run images:download');
  process.exit(0);
}

async function main() {
  for (const file of targets) {
    const input = path.join(SRC, file);
    const base = file.replace(/\.(jpe?g|png)$/i, '');
    const output = path.join(DEST, `${base}.webp`);
    try {
      await sharp(input)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(output);
      const inSize = fs.statSync(input).size;
      const outSize = fs.statSync(output).size;
      const saved = Math.round(100 - (outSize / inSize) * 100);
      console.log(`✅ ${file} → ${path.basename(output)} (${saved}% menor)`);
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`);
    }
  }
  console.log(`\n🎨 Convertidas em ${path.relative(ROOT, DEST)}`);
}

main();
