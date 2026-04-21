import { site } from './site';

export function buildMetadata({
  title,
  description,
  path = '/',
  image = '/og/og-default.png',
  type = 'website',
  keywords,
  publishedTime,
  modifiedTime,
  authorName,
  articleSection,
  articleTags,
}) {
  const url = `${site.url}${path}`;
  const fullTitle = title?.endsWith(site.name) ? title : `${title} | ${site.name}`;
  const ogImage = image.startsWith('http') ? image : `${site.url}${image}`;

  const metadata = {
    metadataBase: new URL(site.url),
    title: fullTitle,
    description,
    keywords,
    applicationName: site.name,
    authors: [{ name: authorName || site.author }],
    creator: site.author,
    publisher: site.name,
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: url,
      languages: {
        'pt-BR': url,
        'x-default': url,
      },
    },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: site.name,
      locale: 'pt_BR',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@melhorlavaeseca',
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
      other: [
        { rel: 'mask-icon', url: '/favicon.svg', color: '#0B5FFF' },
      ],
    },
    manifest: '/site.webmanifest',
    other: {
      'theme-color': '#0B5FFF',
      'msapplication-TileColor': '#0B5FFF',
      'google-site-verification': '',
    },
  };

  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [authorName || site.author],
      section: articleSection,
      tags: articleTags,
    };
  }

  return metadata;
}
