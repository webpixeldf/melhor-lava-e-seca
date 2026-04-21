/**
 * Helpers de RSS para o pipeline de geração de artigos do blog.
 *
 * Lê feeds públicos, filtra por palavras-chave de lava e seca,
 * deduplica contra histórico local e retorna tópicos ainda não usados.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USED_LOG = path.resolve(__dirname, '..', 'data', 'rss-used.json');

// -------- Fontes --------
// Lista editável. Se um feed 404, o script simplesmente ignora.
export const RSS_SOURCES = [
  // Reddit (sempre confiável, RSS nativo)
  { name: 'r/laundry', url: 'https://www.reddit.com/r/laundry/.rss', locale: 'en' },
  { name: 'r/appliances', url: 'https://www.reddit.com/r/appliances/.rss', locale: 'en' },
  { name: 'r/HomeImprovement', url: 'https://www.reddit.com/r/HomeImprovement/.rss', locale: 'en' },

  // Sites de review internacional
  { name: 'Reviewed Laundry', url: 'https://reviewed.usatoday.com/laundry/rss', locale: 'en' },
  { name: 'TechRadar Appliances', url: 'https://www.techradar.com/rss/news/appliances', locale: 'en' },
  { name: 'CNET Smart Home', url: 'https://www.cnet.com/rss/smart-home/', locale: 'en' },
  { name: 'The Spruce Appliances', url: 'https://www.thespruce.com/feed/major-appliances-4127854', locale: 'en' },

  // Tech Brasil
  { name: 'Tecnoblog', url: 'https://tecnoblog.net/feed/', locale: 'pt' },
  { name: 'Olhar Digital', url: 'https://olhardigital.com.br/feed/', locale: 'pt' },
  { name: 'Canaltech', url: 'https://canaltech.com.br/rss/', locale: 'pt' },
];

// Palavras que um item precisa conter (EN ou PT) pra ser relevante
export const KEYWORDS = [
  // Portuguese
  'lava e seca', 'lavadora', 'secadora', 'lava-e-seca', 'lavar roupa',
  'maquina de lavar', 'máquina de lavar', 'eletrodomestico', 'eletrodoméstico',
  'roupa de cama', 'detergente', 'sabão', 'lavanderia',
  // English
  'washing machine', 'washer', 'dryer', 'laundry', 'tumble dry',
  'front load', 'top load', 'detergent', 'fabric softener',
  'appliance', 'home appliance', 'laundry room',
];

// -------- Parser XML simples --------
function extractTag(xml, tag) {
  const regex = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`,
    'i'
  );
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanText(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const raw = match[1];
    const title = cleanText(extractTag(raw, 'title'));
    let link = extractTag(raw, 'link');

    // Atom: <link href="..." />
    if (!link) {
      const atomLink = raw.match(/<link[^>]*href="([^"]+)"/i);
      link = atomLink ? atomLink[1] : '';
    }
    link = link.replace(/<[^>]*>/g, '').trim();

    const description =
      cleanText(extractTag(raw, 'description')) ||
      cleanText(extractTag(raw, 'summary')) ||
      cleanText(extractTag(raw, 'content'));

    const pubDate =
      extractTag(raw, 'pubDate') || extractTag(raw, 'updated') || '';

    if (title && link) {
      items.push({ title, link, description, pubDate });
    }
  }

  return items;
}

export async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'MelhorLavaESeca/1.0 (+https://melhorlavaeseca.com)',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      console.warn(`  ⚠️  ${source.name}: HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const items = parseRssItems(xml).map((it) => ({
      ...it,
      source: source.name,
      locale: source.locale,
    }));
    return items;
  } catch (err) {
    console.warn(`  ⚠️  ${source.name}: ${err.message}`);
    return [];
  }
}

// -------- Filtro de relevância --------
export function isLavaSeca(item) {
  const haystack = `${item.title} ${item.description}`.toLowerCase();
  return KEYWORDS.some((kw) => haystack.includes(kw.toLowerCase()));
}

// -------- Dedup --------
function loadUsed() {
  try {
    fs.mkdirSync(path.dirname(USED_LOG), { recursive: true });
    if (!fs.existsSync(USED_LOG)) return { urls: [], titles: [] };
    const raw = fs.readFileSync(USED_LOG, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      urls: parsed.urls || [],
      titles: (parsed.titles || []).map((t) => t.toLowerCase()),
    };
  } catch {
    return { urls: [], titles: [] };
  }
}

function saveUsed(data) {
  fs.mkdirSync(path.dirname(USED_LOG), { recursive: true });
  fs.writeFileSync(USED_LOG, JSON.stringify(data, null, 2));
}

export function isUsed(item, used) {
  if (used.urls.includes(item.link)) return true;
  const t = item.title.toLowerCase();
  if (used.titles.includes(t)) return true;
  // Parecidos (substring muito grande) — evita repetir tópicos
  return used.titles.some(
    (u) => u.length > 30 && (t.includes(u) || u.includes(t))
  );
}

export function markUsed(item) {
  const used = loadUsed();
  used.urls.push(item.link);
  used.titles.push(item.title.toLowerCase());
  // Mantém histórico enxuto (últimos 500)
  if (used.urls.length > 500) used.urls = used.urls.slice(-500);
  if (used.titles.length > 500) used.titles = used.titles.slice(-500);
  saveUsed({ urls: used.urls, titles: used.titles });
}

// -------- Orquestração --------
export async function collectNewTopics({ limit = 20 } = {}) {
  const used = loadUsed();
  const all = [];

  console.log(`📡 Lendo ${RSS_SOURCES.length} feeds...`);
  for (const src of RSS_SOURCES) {
    const items = await fetchFeed(src);
    const relevant = items.filter(isLavaSeca);
    if (relevant.length > 0) {
      console.log(`  ✓ ${src.name}: ${items.length} itens → ${relevant.length} sobre lava e seca`);
    }
    all.push(...relevant);
  }

  // Dedup local contra histórico
  const fresh = all.filter((item) => !isUsed(item, used));

  console.log(`\n🎯 ${all.length} itens relevantes · ${fresh.length} novos (ainda não usados)`);
  return fresh.slice(0, limit);
}

export function getUsedStats() {
  const used = loadUsed();
  return { urls: used.urls.length, titles: used.titles.length, file: USED_LOG };
}
