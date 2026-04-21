import Link from 'next/link';
import { site } from '@/lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand-name">{site.name}</span>
            <p>Reviews honestos, em primeira pessoa.</p>
            <p>Todos os links Amazon são de afiliado.</p>
            <p>Comprar por eles ajuda o site sem custo extra pra você.</p>
          </div>

          <div className="footer-col">
            <span className="col-title">Navegar</span>
            <ul>
              <li><Link href="/">Melhor Lava e Seca</Link></li>
              <li><Link href="/#ranking">Ranking 2026</Link></li>
              <li><Link href="/#guia">Guia de compra</Link></li>
              <li><Link href="/#comparativo">Comparativo</Link></li>
              <li><Link href="/blog/">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <span className="col-title">Institucional</span>
            <ul>
              {site.footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <span className="col-title">Contato</span>
            <ul>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a href={site.social.instagram} rel="noopener" target="_blank">Instagram</a></li>
              <li><a href={site.social.youtube} rel="noopener" target="_blank">YouTube</a></li>
            </ul>
          </div>
        </div>

        <p className="disclaimer">
          <strong>Aviso legal:</strong> como associado da Amazon, recebemos comissão
          por compras qualificadas feitas a partir deste site. Isso não influencia as
          recomendações. Preços, estoque e disponibilidade podem mudar na Amazon.
        </p>

        <div className="footer-bottom">
          <span>© {year} {site.name}. Todos os direitos reservados.</span>
          <span>CNPJ, razão social e endereço comercial podem ser incluídos aqui.</span>
        </div>
      </div>
    </footer>
  );
}
