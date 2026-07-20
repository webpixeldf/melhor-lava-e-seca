import { site } from '@/lib/site';
import { products as allProducts } from '@/content/products';

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: `${site.url}/logo.png`,
    sameAs: [site.social.instagram, site.social.youtube].filter(Boolean),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: site.email,
        availableLanguage: ['Portuguese'],
      },
    ],
  };
  return <JsonLd data={data} />;
}

export function WebSiteSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.tagline,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${site.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${site.url}/?s={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return <JsonLd data={data} />;
}

export function BreadcrumbSchema({ items }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLd data={data} />;
}

export function ProductSchema({ product }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [`${site.url}${product.image}`],
    description: product.pitch,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: product.asin,
    mpn: product.asin,
    // aggregateRating REMOVIDO (19/07/2026): afirmava agregar milhares de
    // avaliacoes de terceiros ("reviewCount: 2847"), mas os numeros eram
    // estimados. Dado estruturado inventado e tratado pelo Google como spam
    // e pode gerar acao manual — risco bem maior que perder o snippet.
    //
    // O "review" abaixo continua, e e legitimo: e a avaliacao editorial do
    // proprio site, com autoria declarada. Nao afirma agregar nada de fora.
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: product.rating,
        bestRating: 5,
      },
      author: {
        '@type': 'Organization',
        name: site.name,
      },
      reviewBody: product.pitch,
    },
    // O bloco "offers" foi REMOVIDO de proposito (19/07/2026).
    //
    // Ele declarava ao Google quatro coisas que o site nao tem como verificar:
    // preco fixo vindo de products.js, disponibilidade sempre "InStock",
    // frete gratis e devolucao gratuita em 30 dias. Preco divergente do que
    // a Amazon cobra e motivo de penalizacao do resultado rico, alem de
    // frustrar quem clica esperando aquele valor.
    //
    // Nao da pra manter so o "offers" sem preco: Offer sem price e schema
    // invalido. E o resultado rico continua valendo, porque aggregateRating
    // e review, que o Google aceita como sinal, seguem presentes.
    //
    // Quando a PA-API for liberada (hoje retorna AssociateNotEligible, exige
    // 3 vendas em 180 dias), da pra reintroduzir com preco real e automatico.
  };
  return <JsonLd data={data} />;
}

export function ItemListSchema({ products = allProducts, urlBase = site.url }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${urlBase}/#${p.slug}`,
      image: `${site.url}${p.image}`,
    })),
  };
  return <JsonLd data={data} />;
}

export function FAQSchema({ items }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.a,
      },
    })),
  };
  return <JsonLd data={data} />;
}

export function ArticleSchema({ article }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${site.url}/blog/${article.slug}/`,
    },
    headline: article.title,
    description: article.description,
    image: article.image
      ? [article.image.startsWith('http') ? article.image : `${site.url}${article.image}`]
      : [`${site.url}/og/og-default.png`],
    datePublished: article.date,
    dateModified: article.updated || article.date,
    author: {
      '@type': 'Person',
      name: article.author || site.author,
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: {
        '@type': 'ImageObject',
        url: `${site.url}/logo.png`,
      },
    },
    articleSection: article.category,
    keywords: (article.tags || []).join(', '),
    wordCount: article.wordCount,
  };
  return <JsonLd data={data} />;
}

// ReviewSummarySchema foi DESATIVADO em 19/07/2026.
//
// Ele existia so pra declarar um aggregateRating do ranking inteiro, somando
// as notas e os reviewCount de products.js — numeros que eram estimados, nao
// coletados. Sem esse bloco o componente nao teria proposito: sobraria um
// Product sem oferta, sem review e sem nota, que nao gera resultado algum.
//
// Se um dia houver avaliacao real e agregada de leitores, da pra reativar.
export function ReviewSummarySchema() {
  return null;
}

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
