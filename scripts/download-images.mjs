#!/usr/bin/env node
/**
 * Le src/content/paapi-results.json e baixa as imagens principais de cada produto
 * para public/images/products-raw/ mantendo o ASIN no nome.
 *
 * Em seguida rode: npm run images:webp
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RESULTS = path.join(ROOT, 'src', 'content', 'paapi-results.json');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'products-raw');

if (!fs.existsSync(RESULTS)) {
  console.error('❌ Rode primeiro: npm run amazon:search');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(RESULTS, 'utf8'));
const items = data.SearchResult?.Items || [];

if (items.length === 0) {
  console.error('❌ Nenhum item em paapi-results.json. Rode amazon:search de novo.');
  process.exit(1);
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  return buffer.length;
}

async function main() {
  let saved = 0;
  for (const item of items) {
    const url = item.Images?.Primary?.Large?.URL;
    if (!url) {
      console.log(`⚠️  ${item.ASIN}: sem imagem disponivel`);
      continue;
    }
    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const dest = path.join(OUT_DIR, `${item.ASIN}${ext}`);
    try {
      const size = await download(url, dest);
      console.log(`✅ ${item.ASIN} — ${(size / 1024).toFixed(0)}KB`);
      saved++;
    } catch (err) {
      console.error(`❌ ${item.ASIN}: ${err.message}`);
    }
  }
  console.log(`\n📦 ${saved} imagens salvas em ${path.relative(ROOT, OUT_DIR)}`);
  console.log('Proximo passo: npm run images:webp');
}

main();
