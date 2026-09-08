import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { site } from './site';
import { resolvedImage } from './images';
import { topicFor } from './topics';
import { expandCatalog } from './catalog-markdown';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

function ensureDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

export function getAllSlugs() {
  ensureDir();
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => f.replace(/\.(md|mdx)$/, ''))
    .filter((slug) => getPostBySlug(slug));
}

export function getPostBySlug(slug) {
  ensureDir();
  const candidates = [
    path.join(BLOG_DIR, `${slug}.md`),
    path.join(BLOG_DIR, `${slug}.mdx`),
  ];
  const fullPath = candidates.find((p) => fs.existsSync(p));
  if (!fullPath) return null;

  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content: rawContent } = matter(raw);
  const content = expandCatalog(rawContent);
  if (data.draft === true || data.status === 'draft' || data.status === 'retired') return null;
  if (!data.date || !Number.isFinite(Date.parse(data.date))) throw new Error(`Data de publicação inválida: ${slug}`);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date,
    updated: data.updated || data.date,
    category: data.category || 'Guia',
    tags: data.tags || [],
    author: data.author || site.author,
    image: resolvedImage(data.image),
    imageAlt: data.imageAlt || '',
    reviewed: data.reviewed || null,
    reviewer: data.reviewer || null,
    sources: data.sources || [],
    keywords: data.keywords || [],
    content,
    readingTime: `${Math.max(1, Math.round(stats.minutes))} min de leitura`,
    wordCount: stats.words,
  };
}

export function getAllPosts() {
  return getAllSlugs()
    .map(getPostBySlug)
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLatestPosts(n = 3) {
  return getAllPosts().slice(0, n);
}

export async function renderMarkdown(markdown) {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return enhanceLinks(String(processed)).replace(/<table>/g, '<p class="table-hint">No celular, deslize a tabela para ver todas as colunas.</p><div class="article-table-scroll" role="region" aria-label="Tabela comparativa — deslize para ver todas as colunas" tabindex="0"><table>').replace(/<\/table>/g, '</table></div>');
}

/**
 * Pós-processa HTML do blog para injetar atributos rel/target nos links:
 *  - Amazon (afiliado): rel="sponsored nofollow noopener" + target="_blank"
 *  - Outros externos:   rel="noopener"                   + target="_blank"
 *  - Internos (/):      sem modificação
 */
function enhanceLinks(html) {
  return html.replace(
    /<a\s+([^>]*?)href="([^"]+)"([^>]*?)>/gi,
    (match, pre, href, post) => {
      // link interno (começa com /, #, ou mesmo caminho relativo sem protocolo)
      const isExternal = /^https?:\/\//i.test(href);
      if (!isExternal) return match;

      const host = new URL(href).hostname.toLowerCase();
      if (host === new URL(site.url).hostname) return match;
      const isAmazon = host === 'amzn.to' || host === 'amazon.com.br' || host.endsWith('.amazon.com.br') || host === 'amazon.com' || host.endsWith('.amazon.com');

      // Remove atributos rel/target que porventura já existam pra não duplicar
      const clean = (pre + post).replace(/\s*(rel|target)="[^"]*"/gi, '').trim();

      const rel = isAmazon
        ? 'sponsored nofollow noopener'
        : 'noopener noreferrer';

      return `<a ${clean ? clean + ' ' : ''}href="${href}" target="_blank" rel="${rel}">`;
    }
  );
}

export function getRelatedPosts(post, limit = 6) {
 const all=getAllPosts();
 const siblings=all.filter(p=>topicFor(p).slug===topicFor(post).slug).sort((a,b)=>a.slug.localeCompare(b.slug));
 const position=siblings.findIndex(p=>p.slug===post.slug);
 const neighbors=siblings.length>1?[siblings[(position+siblings.length-1)%siblings.length],siblings[(position+1)%siblings.length]]:[];
 const terms=new Set(post.slug.split('-').filter(w=>w.length>2&&!['lava','seca','como','melhor','para','uma'].includes(w)));
 const ranked=all.filter(p=>p.slug!==post.slug).map(p=>({post:p,score:p.slug.split('-').filter(w=>terms.has(w)).length*3+(topicFor(p).slug===topicFor(post).slug?2:0)})).filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.post.slug.localeCompare(b.post.slug)).map(p=>p.post);
 return [...new Map([...neighbors,...ranked].filter(p=>p.slug!==post.slug).map(p=>[p.slug,p])).values()].slice(0,limit);
}
