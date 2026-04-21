import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Termos de Uso',
  description:
    'Regras de uso do site Melhor Lava e Seca: o que você pode esperar, nossas responsabilidades e as suas.',
  path: '/termos/',
});

export default function TermosPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Termos', url: `${site.url}/termos/` },
        ]}
      />

      <section className="section container-narrow">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li>Termos de Uso</li>
          </ol>
        </nav>

        <h1>Termos de Uso</h1>
        <p className="text-muted">Última atualização: janeiro de 2026</p>

        <p>Ao usar o <strong>{site.name}</strong>, você concorda com estes termos.</p>
        <p>Leia com calma. Está tudo em português simples.</p>

        <h2>1. Finalidade do site</h2>
        <p>{site.name} é um site editorial de reviews de lava e seca.</p>
        <p>O conteúdo é <strong>informativo e opinativo</strong>.</p>
        <p>Não substitui manual do fabricante nem assistência técnica.</p>

        <h2>2. Precisão das informações</h2>
        <p>A gente faz o máximo para manter dados atualizados.</p>
        <p>Mesmo assim, preço e estoque mudam na Amazon a toda hora.</p>
        <p>Sempre confira no site do vendedor antes de fechar a compra.</p>

        <h2>3. Links de afiliado</h2>
        <p>Todos os links que levam à Amazon são de afiliado.</p>
        <p>Recebemos comissão sobre compras feitas a partir deles.</p>
        <p>O preço pra você é exatamente o mesmo.</p>
        <p>
          Detalhes em{' '}
          <Link href="/afiliados/">nossa política de afiliados</Link>.
        </p>

        <h2>4. Propriedade intelectual</h2>
        <p>Texto, logo, layout e imagens originais são nossos.</p>

        <p><strong>Você pode:</strong></p>
        <ul>
          <li>Citar trechos desde que credite e linke a fonte</li>
          <li>Compartilhar os artigos nas redes sociais</li>
        </ul>

        <p><strong>Você não pode:</strong></p>
        <ul>
          <li>Copiar páginas inteiras para outros sites</li>
          <li>Traduzir e publicar como se fosse seu</li>
          <li>Usar nossas imagens em publicidade paga sem autorização</li>
        </ul>

        <h2>5. Imagens de produtos</h2>
        <p>Imagens vêm do fabricante, da Amazon ou são produzidas por nós.</p>
        <p>Marcas e modelos citados pertencem aos seus respectivos donos.</p>

        <h2>6. Limitação de responsabilidade</h2>
        <p>O {site.name} não se responsabiliza por:</p>
        <ul>
          <li>Decisões de compra baseadas no conteúdo</li>
          <li>Defeitos ou assistência técnica dos produtos</li>
          <li>Divergências entre o que lemos e o que você viu na loja</li>
          <li>Interrupções técnicas do site ou da Amazon</li>
        </ul>

        <h2>7. Uso indevido</h2>
        <p>É proibido usar o site para:</p>
        <ul>
          <li>Ataques, bots abusivos, scraping em massa</li>
          <li>Cópia comercial do conteúdo</li>
          <li>Qualquer atividade ilegal</li>
        </ul>

        <h2>8. Alterações nestes termos</h2>
        <p>Podemos atualizar a qualquer momento.</p>
        <p>A data no topo indica a versão em vigor.</p>
        <p>Mudanças grandes são avisadas na página inicial.</p>

        <h2>9. Lei aplicável</h2>
        <p>Estes termos são regidos pelas leis brasileiras.</p>
        <p>Foro: cidade sede do responsável editorial.</p>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
