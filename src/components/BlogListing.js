import Link from 'next/link';
import { imageSources } from '@/lib/images';
import { topics, topicFor } from '@/lib/topics';
import { displayDate } from '@/lib/editorial';
export const pageSize=18;
export default function BlogListing({posts, title='Tudo sobre lava e seca', description='Guias de compra, instalação, uso e manutenção para consultar conforme a sua dúvida.', currentPage=1, totalPages=1, base='/blog/', topic=null}) {
 const pageUrl=n=>n===1?base:`${base}pagina/${n}/`;
 return <section className="section container">
  <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link href="/">Início</Link></li><li><Link href="/blog/">Blog</Link></li>{topic&&<li>{topic.name}</li>}{currentPage>1&&<li>Página {currentPage}</li>}</ol></nav>
  <div className="section-header" style={{textAlign:'left',margin:'1rem 0 2rem'}}><h1>{title}{currentPage>1?` — página ${currentPage}`:''}</h1><p>{description}</p></div>
  <nav className="topic-nav" aria-label="Assuntos do blog"><Link href="/blog/" aria-current={!topic?'page':undefined}>Todos os artigos</Link>{topics.map(t=><Link key={t.slug} href={`/blog/categoria/${t.slug}/`} aria-current={topic?.slug===t.slug?'page':undefined}>{t.name}</Link>)}</nav>
  <div className="blog-grid">{posts.map(post=><article key={post.slug} className="blog-card">
   <Link href={`/blog/${post.slug}/`} className="cover" aria-label={`Ler: ${post.title}`}><img src={post.image} srcSet={imageSources(post.image)} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 400px" alt={post.imageAlt || ''} loading="lazy" width="1200" height="630" /></Link>
   <div className="body"><Link className="tag" href={`/blog/categoria/${topicFor(post).slug}/`}>{topicFor(post).name}</Link><h2><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h2><p className="excerpt">{post.description}</p><div className="blog-meta"><span>{post.readingTime}</span><time dateTime={post.date}>{displayDate(post.date)}</time></div></div>
  </article>)}</div>
  {totalPages>1&&<nav className="pagination" aria-label="Paginação do blog">{currentPage>1&&<Link rel="prev" href={pageUrl(currentPage-1)}>← Anterior</Link>}{Array.from({length:totalPages},(_,i)=>i+1).map(n=><Link key={n} href={pageUrl(n)} aria-current={n===currentPage?'page':undefined}>{n}</Link>)}{currentPage<totalPages&&<Link rel="next" href={pageUrl(currentPage+1)}>Próxima →</Link>}</nav>}
 </section>;
}
