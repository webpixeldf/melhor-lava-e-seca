import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Contato',
  description:
    'Fale conosco: sugestões de review, correções, parcerias institucionais e dúvidas sobre lava e seca.',
  path: '/contato/',
});

export default function ContatoPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Contato', url: `${site.url}/contato/` },
        ]}
      />

      <section className="section container-narrow">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li>Contato</li>
          </ol>
        </nav>

        <h1>Fale com a gente</h1>

        <p>A gente lê todos os emails e responde pessoalmente.</p>
        <p>Não tem chatbot, não tem formulário caindo num deserto.</p>
        <p>Todo dia de manhã a caixa é aberta.</p>
        <p>Manda sua dúvida que eu te respondo.</p>

        <h2>Para que serve este canal</h2>
        <ul>
          <li>Dúvida sobre qual lava e seca comprar no seu caso</li>
          <li>Correção de alguma informação errada no site</li>
          <li>Sugestão de modelo para adicionar ao ranking</li>
          <li>Proposta de parceria institucional</li>
          <li>Problema técnico com o site</li>
        </ul>

        <h2>O que a gente não faz</h2>

        <p><strong>Assistência técnica.</strong></p>
        <p>Isso você resolve direto com a fabricante.</p>

        <p><strong>Venda direta.</strong></p>
        <p>
          Todas as compras são feitas na{' '}
          <a
            href={`https://www.amazon.com.br/?tag=${site.amazonPartnerTag}`}
            target="_blank"
            rel="sponsored nofollow noopener"
          >Amazon</a>.
        </p>

        <p><strong>Review patrocinado.</strong></p>
        <p>Se você é fabricante e quer que a gente "promova" — a resposta é não.</p>

        <h2>Canais</h2>
        <div className="summary-card">
          <p style={{ margin: 0 }}>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <p>
            <strong>Instagram:</strong>{' '}
            <a href={site.social.instagram} target="_blank" rel="noopener">@melhorlavaeseca</a>
          </p>
          <p>
            <strong>YouTube:</strong>{' '}
            <a href={site.social.youtube} target="_blank" rel="noopener">@melhorlavaeseca</a>
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Tempo médio de resposta:</strong> 24 a 48 horas úteis.
          </p>
        </div>

        <p>Dúvida de qual máquina comprar? Conta no email:</p>
        <ol>
          <li>Quantas pessoas moram na sua casa</li>
          <li>Quanto você pode investir</li>
          <li>Cidade (pra checarmos assistência)</li>
          <li>Algum recurso essencial (Wi-Fi, vapor, 13kg...)</li>
        </ol>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
