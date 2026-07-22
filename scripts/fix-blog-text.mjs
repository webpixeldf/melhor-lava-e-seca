#!/usr/bin/env node
/**
 * Manutencao dos artigos ja publicados em src/content/blog:
 *
 *   1. Conserta os H2 quebrados que o outline antigo gerava
 *      ("As melhores opções de Melhor lava e seca lg" ->
 *       "Melhor lava e seca LG: as melhores opções");
 *   2. Aplica a lista ampliada de acentuacao (lib/accents.mjs) — os primeiros
 *      artigos sairam com secoes inteiras sem acento ("nao", "voce", "pecas").
 *
 * URLs de link markdown e caminhos de imagem ficam intactos: a correcao de
 * acento nunca toca trecho entre parenteses sem espaco (ex.: "(/blog/...)").
 *
 * Uso: node scripts/fix-blog-text.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixAccents } from './lib/accents.mjs';
import { displayKeyword } from './lib/cronograma.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '..', 'src', 'content', 'blog');
const DRY = process.argv.includes('--dry-run');

/** Acentua so o texto, pulando URLs "(...)" e a linha image: do frontmatter. */
function fixAccentsSafe(md) {
  return md
    .split('\n')
    .map((line) => {
      if (/^image:/.test(line)) return line;
      return line
        .split(/(\([^()\s]*\))/)
        .map((part, i) => (i % 2 === 1 ? part : fixAccents(part)))
        .join('');
    })
    .join('\n');
}

function fixHeadings(md) {
  return md
    .replace(/^## As melhores opções de (.+)$/gim, (_, t) => `## ${displayKeyword(t.toLowerCase())}: as melhores opções`)
    .replace(/^## Perguntas frequentes sobre (?:a )?.+$/gim, '## Perguntas frequentes');
}

let touched = 0;
for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))) {
  const full = path.join(BLOG_DIR, file);
  const raw = fs.readFileSync(full, 'utf8');
  const out = fixAccentsSafe(fixHeadings(raw));
  if (out === raw) continue;
  touched++;
  console.log(`${DRY ? '[dry-run] ' : ''}corrigido: ${file}`);
  if (!DRY) fs.writeFileSync(full, out, 'utf8');
}
console.log(`\n${touched} arquivo(s) alterado(s)${DRY ? ' (nada gravado)' : ''}.`);
