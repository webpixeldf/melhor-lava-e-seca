import './globals.css';
import { Lexend } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { OrganizationSchema, WebSiteSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = buildMetadata({
  title: 'Melhor Lava e Seca 2026: Ranking Honesto em Primeira Pessoa',
  description:
    'Review completo das 9 melhores lava e seca de 2026. Testei Samsung, LG, Electrolux, Midea, Brastemp e mais — com pros, contras e qual comprar para cada tipo de familia.',
  path: '/',
  keywords: [
    'melhor lava e seca',
    'melhor lava e seca 2026',
    'lava e seca Samsung',
    'lava e seca LG',
    'lava e seca Electrolux',
    'lava e seca 11kg',
    'qual lava e seca comprar',
    'lava e seca barata',
    'lava e seca economica',
    'review lava e seca',
    'ranking lava e seca',
    'comparativo lava e seca',
  ],
});

export const viewport = {
  themeColor: '#0B5FFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={lexend.variable}>
      <head>
        <link rel="preconnect" href="https://images-na.ssl-images-amazon.com" />
        <link rel="preconnect" href="https://m.media-amazon.com" />
        <link rel="dns-prefetch" href="https://www.amazon.com.br" />
        <meta name="format-detection" content="telephone=no" />
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body>
        <a href="#conteudo" className="sr-only">Ir para o conteudo principal</a>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
