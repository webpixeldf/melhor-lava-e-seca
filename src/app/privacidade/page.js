import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Política de Privacidade',
  description:
    'Como o Melhor Lava e Seca coleta, usa e protege seus dados de navegação. Transparência total em conformidade com a LGPD.',
  path: '/privacidade/',
});

export default function PrivacidadePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Privacidade', url: `${site.url}/privacidade/` },
        ]}
      />

      <section className="section container-narrow">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li>Política de Privacidade</li>
          </ol>
        </nav>

        <h1>Política de Privacidade</h1>
        <p className="text-muted">Última atualização: janeiro de 2026</p>

        <p>Esta política explica como o <strong>{site.name}</strong> trata seus dados.</p>
        <p>Seguimos a Lei Geral de Proteção de Dados (LGPD).</p>
        <p>Coletamos só o mínimo necessário para o site funcionar.</p>

        <h2>1. Quem somos</h2>
        <p>Site de reviews mantido por equipe editorial independente.</p>
        <p>Contato: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>

        <h2>2. Dados coletados automaticamente</h2>
        <ul>
          <li>Endereço IP, navegador, sistema operacional</li>
          <li>Páginas visitadas e duração da visita</li>
          <li>Fonte de referência (de onde você veio)</li>
          <li>Cookies analíticos do Google Analytics (se aceitos)</li>
          <li>Cookies da Amazon (quando clica em link de afiliado)</li>
        </ul>

        <h2>3. Dados que você nos envia voluntariamente</h2>
        <ul>
          <li>Seu nome (ou apenas iniciais, se preferir)</li>
          <li>Seu email</li>
          <li>O conteúdo da mensagem</li>
        </ul>

        <h2>4. Para que usamos esses dados</h2>
        <ul>
          <li>Entender qual conteúdo é mais lido</li>
          <li>Detectar falhas e bugs</li>
          <li>Receber comissão quando você compra via link nosso</li>
          <li>Responder sua mensagem</li>
        </ul>

        <h2>5. Cookies</h2>

        <p><strong>Essenciais:</strong> fazem o site funcionar.</p>
        <p><strong>Analíticos:</strong> medem audiência (você pode recusar).</p>
        <p><strong>De afiliação Amazon:</strong> acionados ao clicar em link para a Amazon.</p>
        <p>Você pode apagar ou bloquear cookies no seu navegador.</p>

        <h2>6. Com quem compartilhamos</h2>
        <p>Não vendemos seus dados.</p>
        <ul>
          <li>Provedores de hospedagem (Vercel, Netlify)</li>
          <li>Google Analytics (dados anônimos)</li>
          <li>Amazon Associados (quando você clica e compra)</li>
        </ul>

        <h2>7. Seus direitos (LGPD)</h2>
        <ul>
          <li>Acesso aos dados que temos sobre você</li>
          <li>Correção ou exclusão</li>
          <li>Revogação de consentimento</li>
          <li>Portabilidade</li>
          <li>Reclamação à ANPD</li>
        </ul>
        <p>
          Para exercer, envie um email para{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a> com assunto "LGPD".
        </p>

        <h2>8. Tempo de armazenamento</h2>
        <p>Dados anônimos de navegação: 26 meses (padrão Google Analytics).</p>
        <p>Emails recebidos: até 24 meses ou até você pedir exclusão.</p>

        <h2>9. Segurança</h2>
        <p>HTTPS em todo o site.</p>
        <p>Hospedagem com backup automático.</p>
        <p>Acesso restrito com autenticação de dois fatores.</p>
        <p>Nenhum sistema é 100% seguro, mas minimizamos o máximo possível.</p>

        <h2>10. Alterações nesta política</h2>
        <p>Podemos atualizar quando a legislação mudar.</p>
        <p>A data no topo indica a versão vigente.</p>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
