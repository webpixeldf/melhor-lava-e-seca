import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, getPostBySlug, renderMarkdown } from '@/lib/blog';
import { ArticleSchema, BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import { blogAnchor, imageAlt } from '@/lib/keywords';

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}/`,
    image: post.image,
    type: 'article',
    publishedTime: post.date,
    modifiedTime: post.updated,
    authorName: post.author,
    articleSection: post.category,
    articleTags: post.tags,
    keywords: post.keywords,
  });
}

export default async function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);
  const anchor = blogAnchor(post);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Blog', url: `${site.url}/blog/` },
          { name: post.title, url: `${site.url}/blog/${post.slug}/` },
        ]}
      />
      <ArticleSchema article={post} />

      <article className="article">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Início</Link></li>
              <li><Link href="/blog/">Blog</Link></li>
              <li>{post.title}</li>
            </ol>
          </nav>

          <header className="article-header">
            <span className="tag">{post.category}</span>
            <h1>{post.title}</h1>
            <p className="text-muted">
              <span>{new Date(post.date).toLocaleDateString('pt-BR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}</span>
              {' · '}
              <span>{post.readingTime}</span>
              {' · '}
              <span>Por {post.author}</span>
            </p>
          </header>

          {post.image && (
            <div className="container-narrow" style={{ marginBottom: '2rem' }}>
              <Link href="/" title={anchor} aria-label={anchor}>
                <img
                  src={post.image}
                  alt={imageAlt(anchor, post.title)}
                  width={1200}
                  height={630}
                  style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }}
                />
              </Link>
            </div>
          )}

          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <aside className="related-home container-narrow">
            <h3>Ainda não escolheu sua lava e seca?</h3>
            <p className="mb-2">Veja o ranking atualizado das 9 melhores de 2026.</p>
            <Link href="/" className="btn btn-primary">Ver o ranking completo →</Link>
          </aside>
        </div>
      </article>
    </>
  );
}
