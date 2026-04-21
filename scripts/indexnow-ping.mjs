#!/usr/bin/env node
/**
 * Notifica Bing / Yandex / Seznam / DuckDuckGo via IndexNow quando
 * URLs novas ou atualizadas são publicadas.
 *
 * Uso:
 *   node scripts/indexnow-ping.mjs https://melhorlavaeseca.com/blog/slug/
 *   node scripts/indexnow-ping.mjs url1 url2 url3
 *   node scripts/indexnow-ping.mjs --all       # envia todas as URLs do sitemap
 *   node scripts/indexnow-ping.mjs --latest    # envia apenas o último artigo commitado
 *
 * Docs: https://www.indexnow.org/documentation
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const KEY = '60b4c3b475374b8aa2b25e2dde636b2c';
const HOST = 'melhorlavaeseca.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

function urlFromMdFile(filepath) {
  const slug = path.basename(filepath, '.md');
  return `https://${HOST}/blog/${slug}/`;
}

function getLatestArticleFromGit() {
  try {
    const out = execSync(
      'git diff-tree --no-commit-id --name-only -r HEAD',
      { cwd: ROOT, encoding: 'utf8' }
    );
    const mdFiles = out
      .split('\n')
      .filter((f) => f.startsWith('src/content/blog/') && f.endsWith('.md'));
    return mdFiles.map(urlFromMdFile);
  } catch {
    return [];
  }
}

function getAllUrlsFromSitemap() {
  const sitemapPath = path.join(ROOT, 'out', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ sitemap.xml não encontrado em out/. Rode npm run build primeiro.');
    process.exit(1);
  }
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function pingIndexNow(urls) {
  if (urls.length === 0) {
    console.log('ℹ️  Nenhuma URL pra notificar. Saindo.');
    return 0;
  }

  console.log(`📡 Notificando IndexNow com ${urls.length} URL(s):`);
  urls.forEach((u) => console.log(`   • ${u}`));

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  if (res.status === 200 || res.status === 202) {
    console.log(`✅ IndexNow aceitou (HTTP ${res.status})`);
    return 0;
  }

  const txt = await res.text().catch(() => '');
  console.error(`❌ IndexNow retornou ${res.status}: ${txt}`);

  // 422 = algumas URLs invalidas. 400 = JSON ruim. 403 = chave incorreta.
  // Retornamos 0 mesmo em falha leve pra não quebrar o workflow.
  return res.status === 403 ? 1 : 0;
}

async function main() {
  const args = process.argv.slice(2);

  let urls = [];
  if (args.includes('--all')) {
    urls = getAllUrlsFromSitemap();
  } else if (args.includes('--latest')) {
    urls = getLatestArticleFromGit();
  } else {
    urls = args.filter((a) => a.startsWith('http'));
  }

  if (urls.length === 0) {
    console.log('ℹ️  Nenhuma URL alvo. Uso: node scripts/indexnow-ping.mjs --latest | --all | <url>');
    process.exit(0);
  }

  const code = await pingIndexNow(urls);
  process.exit(code);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
