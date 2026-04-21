#!/usr/bin/env node
/**
 * Normaliza os links internos dos artigos existentes:
 *  - remove TODOS os links para "/" e para "/#..." do corpo do artigo
 *  - injeta UM unico paragrafo final com link para "/" usando anchor keyword-rich
 *
 * Uso: node scripts/normalize-blog-links.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

const ANCHORS = [
  'melhor lava e seca',
  'melhor lava e seca 2026',
  'melhores lava e seca',
  'ranking das lava e seca',
  'lava e seca top de linha',
  'lava e seca mais vendida',
  'lava e seca premium',
  'lava e seca economica',
  'lava e seca barata',
  'lava e seca com wifi',
  'lava e seca com vapor',
  'lava e seca 11kg',
  'lava e seca para familia',
  'lava e seca inteligente',
];

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function anchorFor(seed) {
  return ANCHORS[hashStr(seed) % ANCHORS.length];
}

function stripInternalLinks(body) {
  // Remove [texto](/...) mantendo apenas o texto
  // Cobre: (/) (/#ancora) (/path) (/path/)
  return body.replace(/\[([^\]]+)\]\(\/[^\s)]*\)/g, '$1');
}

function appendHomeLink(body, anchor) {
  const trimmed = body.replace(/\s+$/, '');
  const paragraph = `\nSe voce ainda esta escolhendo a sua, ve o ranking completo da [${anchor}](/) atualizado toda semana.\n`;
  return `${trimmed}\n\n${paragraph}`;
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  console.log(`📚 Normalizando ${files.length} artigos\n`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const full = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);

    const before = (content.match(/\]\(\/[^\s)]*\)/g) || []).length;
    const stripped = stripInternalLinks(content);
    const anchor = anchorFor(slug);
    const finalContent = appendHomeLink(stripped, anchor);
    const after = (finalContent.match(/\]\(\/[^\s)]*\)/g) || []).length;

    const updated = matter.stringify(finalContent, data);
    fs.writeFileSync(full, updated);
    console.log(`✅ ${slug}`);
    console.log(`   ${before} links internos → ${after} (anchor: "${anchor}")`);
  }

  console.log('\n🎉 Todos os artigos normalizados.');
}

main();
