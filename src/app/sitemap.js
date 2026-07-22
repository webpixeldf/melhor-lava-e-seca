import { getAllPosts } from '@/lib/blog';
import { site } from '@/lib/site';

export default function sitemap() {
  const base = site.url;
  const now = new Date().toISOString();

  const staticPages = [
    { url: `${base}/`, priority: 1.0, changeFrequency: 'daily' },
    { url: `${base}/sobre/`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${base}/contato/`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${base}/privacidade/`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/termos/`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${base}/afiliados/`, priority: 0.5, changeFrequency: 'yearly' },
    { url: `${base}/blog/`, priority: 0.8, changeFrequency: 'daily' },
  ].map((item) => ({ ...item, lastModified: now }));

  // lastmod do post e a data real de publicacao/atualizacao, nao a hora do
  // build: lastmod igual em tudo faz o Google ignorar o campo.
  const blogPages = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}/`,
    priority: 0.7,
    changeFrequency: 'weekly',
    lastModified: new Date(post.updated || post.date).toISOString(),
  }));

  return [...staticPages, ...blogPages];
}
