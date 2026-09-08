import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, getPostBySlug, renderMarkdown, getRelatedPosts } from '@/lib/blog';
import { ArticleSchema, BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';
import { imageSources } from '@/lib/images';
import { topicFor, manualsFor } from '@/lib/topics';
import { displayDate, authorPath } from '@/lib/editorial';
import { products } from '@/content/products';

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
    // O gerador ja monta o titulo em 50-60 caracteres, liderado pela keyword.
    // Somar " | Melhor Lava e Seca" jogaria todo artigo pra ~78 e ainda
    // repetiria a keyword, que quase sempre contem "lava e seca".
    appendSiteName: false,
  });
}

export default async function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);
  const related = getRelatedPosts(post);
  const topic = topicFor(post);

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
            <Link className="tag" href={`/blog/categoria/${topic.slug}/`}>{topic.name}</Link>
            <h1>{post.title}</h1>
            <p className="text-muted">Publicado em <time dateTime={post.date}>{displayDate(post.date)}</time> · {post.readingTime} · Por <Link href={authorPath}>{post.author}</Link></p>
            {post.updated !== post.date && <p className="text-muted">Atualizado em <time dateTime={post.updated}>{displayDate(post.updated)}</time></p>}
            {post.reviewed && <p className="text-muted">Revisão documental: <time dateTime={post.reviewed}>{displayDate(post.reviewed)}</time>. <Link href="/sobre/">Conheça o método editorial</Link>.</p>}
          </header>

          {post.image && (
            <div className="container-narrow" style={{ marginBottom: '2rem' }}>
              <figure style={{margin:0}}>
                <img
                  src={post.image}
                  alt={post.imageAlt || ''}
                  srcSet={imageSources(post.image)}
                  sizes="(max-width: 800px) 100vw, 800px"
                  width={1200}
                  height={630}
                  style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }}
                />
              <figcaption className="text-muted">Imagem ilustrativa.</figcaption></figure>
            </div>
          )}

          <p className="container-narrow text-muted affiliate-disclosure">Como associado da Amazon, recebemos comissão por compras qualificadas. <Link href="/afiliados/">Entenda os links de afiliado</Link>.</p>
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <aside className="article-references container-narrow">
            <h2>Manuais e suporte oficial</h2>
            <p>Procure o código completo na etiqueta do aparelho. As instruções podem mudar entre versões; os canais abaixo ajudam a localizar o manual correspondente.</p>
            <ul>{manualsFor(post).map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a></li>)}</ul>
          </aside>
          {related.length>0&&<aside className="container-narrow related-articles"><h2>Continue pelo assunto</h2><ul>{related.map(p=><li key={p.slug}><Link href={`/blog/${p.slug}/`}>{p.title}</Link></li>)}</ul><Link href={`/blog/categoria/${topic.slug}/`}>Todos os artigos de {topic.name.toLowerCase()}</Link></aside>}
          <aside className="related-home container-narrow"><h2>Ainda está escolhendo sua lava e seca?</h2><p>Compare os {products.length} modelos do guia e confira o que muda entre eles.</p><Link href="/" className="btn btn-primary">Ver o comparativo →</Link></aside>
        </div>
      </article>
    </>
  );
}
