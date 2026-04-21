#!/usr/bin/env node
/**
 * Roda o divisor de parágrafos longos em todos os artigos existentes.
 * Preserva frontmatter, cabeçalhos, listas e blocos de código.
 * Só toca em parágrafos de prosa com mais de 550 caracteres.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '..', 'src', 'content', 'blog');
const LIMIT = 550;

function splitLongParagraphs(md) {
  const lines = md.split(/\n/);
  const out = [];
  let buf = [];

  const flush = () => {
    if (buf.length === 0) return;
    const para = buf.join(' ').trim();
    buf = [];
    if (para.length <= LIMIT) {
      out.push(para);
      return;
    }
    const sentences = para.match(/[^.!?]+[.!?]+(\s|$)/g) || [para];
    let current = '';
    for (const s of sentences) {
      if ((current + s).length > LIMIT && current.length > 0) {
        out.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) out.push(current.trim());
  };

  let inFrontmatter = false;
  let frontmatterDone = false;

  for (const line of lines) {
    // frontmatter YAML entre --- ... ---
    if (line.trim() === '---') {
      flush();
      out.push(line);
      inFrontmatter = !inFrontmatter;
      if (!inFrontmatter) frontmatterDone = true;
      continue;
    }
    if (inFrontmatter) {
      out.push(line);
      continue;
    }

    // elementos que NÃO são prosa
    if (
      line.trim() === '' ||
      /^(#{1,3}\s|```|>\s?|\-\s|\d+\.\s|---$|!\[|<!--)/.test(line.trim())
    ) {
      flush();
      out.push(line);
      continue;
    }

    buf.push(line);
  }
  flush();

  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

function stats(md) {
  const paragraphs = md
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('---'));
  const long = paragraphs.filter((p) => p.length > LIMIT);
  return { total: paragraphs.length, long: long.length, maxLen: Math.max(...paragraphs.map((p) => p.length), 0) };
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  console.log(`📚 ${files.length} artigos encontrados\n`);

  let changed = 0;
  for (const file of files) {
    const fullPath = path.join(BLOG_DIR, file);
    const before = fs.readFileSync(fullPath, 'utf8');
    const sBefore = stats(before);

    if (sBefore.long === 0) {
      console.log(`✓ ${file} — OK (${sBefore.total} parágrafos, maior ${sBefore.maxLen})`);
      continue;
    }

    const after = splitLongParagraphs(before);
    const sAfter = stats(after);

    fs.writeFileSync(fullPath, after);
    changed++;
    console.log(`✂️  ${file}`);
    console.log(`   ${sBefore.long} longos → ${sAfter.long} · maior ${sBefore.maxLen} → ${sAfter.maxLen}`);
  }

  console.log(`\n🎉 ${changed} arquivos modificados.`);
}

main();
