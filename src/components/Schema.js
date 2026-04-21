import { site } from '@/lib/site';
import { products as allProducts, averageRating, totalReviews } from '@/content/products';
import { amazonLink } from '@/lib/amazon';

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
  // priceValidUntil: validade do preço estimado (30 dias à frente)
  const now = new Date();
  const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const priceValidUntil = validUntil.toISOString().split('T')[0];

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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
      bestRating: 5,
      worstRating: 1,
    },
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
    offers: {
      '@type': 'Offer',
      url: amazonLink(product),
      priceCurrency: 'BRL',
      price: product.priceFrom || 0,
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Amazon Brasil',
      },
      // Frete (Amazon Prime — entrega Brasil)
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'BRL',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      // Política de devolução Amazon (30 dias, grátis via A-Z)
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
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

export function ReviewSummarySchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Ranking Melhores Lava e Seca 2026',
    description: 'Review e comparativo das melhores lava e seca do mercado brasileiro em 2026.',
    image: `${site.url}/og/og-default.png`,
    brand: { '@type': 'Brand', name: site.name },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating(),
      reviewCount: totalReviews(),
      bestRating: 5,
      worstRating: 1,
    },
  };
  return <JsonLd data={data} />;
}

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
