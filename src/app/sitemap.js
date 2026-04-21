import { getAllSlugs } from '@/lib/blog';
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
  ];

  const blogPages = getAllSlugs().map((slug) => ({
    url: `${base}/blog/${slug}/`,
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  return [...staticPages, ...blogPages].map((item) => ({
    ...item,
    lastModified: now,
  }));
}
