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

        <p>A caixa de entrada do Melhor Lava e Seca é cuidada por pessoas de verdade, não por robôs nem por software de atendimento.</p>
        <p>Toda mensagem é lida. Toda dúvida legítima recebe resposta. Nada cai no vazio nem some numa fila de tickets que ninguém olha.</p>
        <p>De segunda a sexta, a primeira tarefa do dia é abrir os emails e responder um por um — no máximo em 48 horas úteis.</p>
        <p>Pode escrever sem cerimônia, como se estivesse mandando mensagem para um amigo que entende do assunto. A gente responde no mesmo tom.</p>

        <h2>Quando vale a pena mandar mensagem</h2>
        <ul>
          <li>Você está entre dois ou três modelos de lava e seca e não consegue decidir qual faz mais sentido para a sua casa</li>
          <li>Encontrou uma informação desatualizada, um erro técnico ou um dado que não confere em algum artigo</li>
          <li>Quer sugerir um modelo de lavadora e secadora que ainda não está no nosso comparativo</li>
          <li>Tem uma proposta de parceria institucional ou acadêmica (universidades, veículos de imprensa, centros de pesquisa)</li>
          <li>O site apresentou algum problema técnico — página quebrada, link que não funciona, lentidão no carregamento</li>
        </ul>

        <h2>O que a gente não consegue resolver</h2>

        <p><strong>Assistência técnica.</strong></p>
        <p>Defeito no produto, acionamento de garantia, instalação e reparo são resolvidos diretamente com o fabricante. Não temos estrutura nem autorização para intermediar esse tipo de atendimento.</p>

        <p><strong>Venda direta.</strong></p>
        <p>
          A gente não vende lava e seca. Todo o processo de compra acontece de forma segura na{' '}
          <a
            href={`https://www.amazon.com.br/?tag=${site.amazonPartnerTag}`}
            target="_blank"
            rel="sponsored nofollow noopener"
          >Amazon</a>, com a proteção ao consumidor que a plataforma oferece.
        </p>

        <p><strong>Review patrocinado.</strong></p>
        <p>Se você representa uma marca e quer que a gente publique conteúdo favorável em troca de pagamento, a resposta é não. Essa política é definitiva e está detalhada na nossa página de afiliados.</p>

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
            <strong>Tempo médio de resposta:</strong> 24 a 48 horas em dias úteis. Durante a Black Friday, pode levar até 72 horas — o volume de mensagens triplica nessa época.
          </p>
        </div>

        <p>Se você está em dúvida sobre qual lavadora e secadora comprar, inclua estas informações no email — isso nos ajuda a dar uma resposta muito mais certeira:</p>
        <ol>
          <li>Quantas pessoas moram na sua casa (para dimensionarmos a capacidade ideal)</li>
          <li>Qual o valor máximo que você pode investir</li>
          <li>Sua cidade (para verificarmos a cobertura de assistência técnica na sua região)</li>
          <li>Algum recurso indispensável para você (conexão Wi-Fi, função vapor, capacidade mínima de 13 kg, lava edredom)</li>
        </ol>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
