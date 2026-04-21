#!/usr/bin/env node
/**
 * Busca novas imagens no Unsplash para todos os artigos existentes.
 * Redimensiona pra 1200x630 webp e atualiza o campo `image` do frontmatter.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import matter from 'gray-matter';
import { fetchBlogCover } from './lib/unsplash.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'blog');

// Mapeamento slug → query Unsplash pra conseguir imagens mais relacionadas
const QUERIES = {
  'como-lavar-edredom-em-lava-e-seca': 'bedding laundry',
  'quanto-gasta-lava-e-seca-por-mes': 'electricity meter',
  'samsung-vs-lg-lava-e-seca': 'washing machine comparison',
  'erros-que-matam-lava-e-seca': 'broken washing machine',
  'lava-e-seca-fazendo-barulho': 'washing machine repair',
  'lava-e-seca-vale-a-pena': 'laundry room modern',
  'como-lavar-travesseiro-em-lava-e-seca-o-guia-que-eu-precisava-ha-anos': 'pillow laundry',
};

function pickQuery(slug, tags) {
  if (QUERIES[slug]) return QUERIES[slug];
  const keyword = (tags && tags[0]) || 'laundry';
  return `${keyword} laundry`;
}

async function main() {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  console.log(`📚 ${files.length} artigos encontrados\n`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const fullPath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);

    const query = pickQuery(slug, data.tags);
    const destPath = path.join(IMG_DIR, `${slug}.webp`);
    const webPath = `/images/blog/${slug}.webp`;

    console.log(`🖼️  ${slug}`);
    console.log(`   query: "${query}"`);

    try {
      const cover = await fetchBlogCover(query, destPath, {
        fallbackQueries: ['washing machine', 'laundry room'],
      });
      console.log(`   ✅ foto de ${cover.photographer}`);
    } catch (err) {
      console.warn(`   ⚠️  ${err.message}`);
      continue;
    }

    // Atualiza o frontmatter do artigo
    const newData = { ...data, image: webPath };
    const updated = matter.stringify(content, newData);
    fs.writeFileSync(fullPath, updated);
    console.log(`   ✅ frontmatter atualizado\n`);

    // Pausa pra nao estourar o rate limit do Unsplash (50 req/h no free tier)
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log('🎉 Todas as capas foram atualizadas.');
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
