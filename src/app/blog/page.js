import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import { blogAnchor, imageAlt } from '@/lib/keywords';

export const metadata = buildMetadata({
  title: 'Blog — Dicas, Tutoriais e Guias de Lava e Seca',
  description:
    'Artigos sobre manutenção, programas, economia de energia, escolha e uso diário de lava e seca.',
  path: '/blog/',
});

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Blog', url: `${site.url}/blog/` },
        ]}
      />

      <section className="section container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li>Blog</li>
          </ol>
        </nav>

        <div className="section-header" style={{ textAlign: 'left', maxWidth: '760px', margin: '1rem 0 2rem' }}>
          <span className="eyebrow">Blog Melhor Lava e Seca</span>
          <h1 style={{ marginTop: '0.4rem' }}>Tudo sobre lava e seca em um só lugar</h1>
          <p>Dicas, tutoriais e erros comuns que fazem sua máquina durar mais.</p>
          <p>
            Se ainda está escolhendo a sua, volte para a{' '}
            <Link href="/">página inicial</Link> e veja o ranking.
          </p>
        </div>

        {posts.length === 0 ? (
          <p>Ainda não temos artigos publicados. Volte em breve.</p>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => {
              const anchor = blogAnchor(post);
              return (
                <article key={post.slug} className="blog-card">
                  <Link
                    href="/"
                    className="cover"
                    title={anchor}
                    aria-label={anchor}
                  >
                    <img
                      src={post.image || '/images/blog/default-cover.webp'}
                      alt={imageAlt(anchor, post.title)}
                      loading="lazy"
                      width={1200}
                      height={630}
                    />
                  </Link>
                  <div className="body">
                    <span className="tag">{post.category}</span>
                    <h3>
                      <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
                    </h3>
                    <p className="excerpt">{post.description}</p>
                    <div className="blog-meta">
                      <span>{post.readingTime}</span>
                      <span>·</span>
                      <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
