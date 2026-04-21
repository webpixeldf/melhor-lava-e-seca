import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

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
    .map((f) => f.replace(/\.(md|mdx)$/, ''));
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
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    updated: data.updated || data.date || new Date().toISOString(),
    category: data.category || 'Guia',
    tags: data.tags || [],
    author: data.author || 'Equipe Melhor Lava e Seca',
    image: data.image || '/images/blog/default-cover.jpg',
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
  return String(processed);
}
