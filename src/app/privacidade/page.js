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

        <p>A sua privacidade importa de verdade — não é frase de efeito para parecer bonito. Esta política explica, em linguagem direta e sem juridiquês, como o <strong>{site.name}</strong> coleta, armazena e protege suas informações.</p>
        <p>Estamos em total conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
        <p>Coletamos apenas o estritamente necessário para que o site funcione e para entendermos quais conteúdos são mais úteis para você. Nada além disso.</p>

        <h2>1. Quem somos</h2>
        <p>Somos um site editorial independente de análises e comparativos de lavadoras e secadoras, mantido por uma pequena equipe de jornalistas especializados. Não fazemos parte de nenhum grupo de mídia, não temos investidores externos e não vendemos dados.</p>
        <p>Para qualquer questão relacionada à sua privacidade, o canal direto é: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>

        <h2>2. Dados coletados automaticamente</h2>
        <ul>
          <li>Endereço IP, tipo de navegador, sistema operacional e resolução de tela — informações técnicas que todo site recebe quando você o visita</li>
          <li>Páginas que você acessou, quanto tempo permaneceu em cada uma e em quais links clicou</li>
          <li>Fonte de origem da visita (se você chegou pelo Google, por uma rede social ou digitou o endereço diretamente)</li>
          <li>Cookies analíticos do Google Analytics — estes só são ativados se você aceitar o banner de cookies na sua primeira visita</li>
          <li>Cookies de afiliação da Amazon — acionados exclusivamente quando você clica em um link que direciona para a loja da Amazon</li>
        </ul>

        <h2>3. Dados que você nos envia voluntariamente</h2>
        <ul>
          <li>Nome (pode ser só o primeiro nome, ou até iniciais se preferir — não exigimos nome completo)</li>
          <li>Endereço de email (indispensável para conseguirmos responder sua mensagem)</li>
          <li>O conteúdo da sua mensagem, incluindo eventuais informações que você decidir compartilhar sobre sua casa, rotina ou orçamento</li>
        </ul>

        <h2>4. Para que usamos esses dados</h2>
        <ul>
          <li>Identificar quais artigos são mais lidos e merecem ser atualizados com mais frequência</li>
          <li>Detectar erros técnicos no site — páginas quebradas, links que não funcionam, lentidão de carregamento</li>
          <li>Receber a comissão de afiliado quando você compra um produto na Amazon após clicar em um link nosso</li>
          <li>Responder seu email de forma personalizada e útil para a sua situação específica</li>
        </ul>

        <h2>5. Cookies</h2>

        <p><strong>Cookies essenciais:</strong> garantem que o site funcione corretamente — lembrar sua preferência de cookies, manter a navegação estável entre páginas. Sem eles, a experiência simplesmente quebra.</p>
        <p><strong>Cookies analíticos:</strong> nos ajudam a entender quantas pessoas visitam cada página, de onde vieram e quanto tempo ficaram. Você pode recusar esses cookies no banner que aparece na primeira visita — o site continua funcionando normalmente.</p>
        <p><strong>Cookies de afiliação:</strong> são ativados quando você clica em um link para a Amazon. Eles permitem que a Amazon saiba que você veio do nosso site e, se você comprar algo em até 24 horas, nos remunere pela indicação. Esses cookies não coletam informações pessoais suas.</p>
        <p>Você pode, a qualquer momento, apagar, bloquear ou gerenciar cookies diretamente nas configurações do seu navegador. Cada navegador tem um caminho diferente para isso, mas todos permitem.</p>

        <h2>6. Com quem compartilhamos</h2>
        <p>Não vendemos, alugamos, emprestamos ou trocamos seus dados com terceiros. Ponto final. Os únicos serviços que recebem alguma informação são:</p>
        <ul>
          <li>Provedores de hospedagem e infraestrutura (Vercel) — necessários para o site existir no ar</li>
          <li>Google Analytics — recebe dados anônimos e agregados de navegação para gerar estatísticas de audiência</li>
          <li>Amazon Associados — recebe a informação de que um clique partiu do nosso site, exclusivamente para fins de comissionamento</li>
        </ul>

        <h2>7. Seus direitos (LGPD)</h2>
        <ul>
          <li>Acessar gratuitamente todos os dados pessoais que armazenamos sobre você</li>
          <li>Solicitar correção de dados incompletos, inexatos ou desatualizados</li>
          <li>Pedir a exclusão definitiva dos seus dados dos nossos registros</li>
          <li>Solicitar a portabilidade dos seus dados para outro serviço</li>
          <li>Registrar reclamação junto à Autoridade Nacional de Proteção de Dados (ANPD), se entender que algum direito foi violado</li>
        </ul>
        <p>
          Para exercer qualquer um desses direitos, envie um email para{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a> com o assunto "LGPD - [seu pedido]". Respondemos em até 15 dias, conforme determina a lei.
        </p>

        <h2>8. Tempo de armazenamento</h2>
        <p>Dados anônimos de navegação coletados pelo Google Analytics: 26 meses (configuração padrão da plataforma). Após esse período, são automaticamente excluídos.</p>
        <p>Emails e mensagens recebidas: armazenamos por até 24 meses ou até você solicitar a exclusão — o que ocorrer primeiro.</p>

        <h2>9. Segurança</h2>
        <p>Conexão HTTPS com certificado SSL em absolutamente todas as páginas do site — o cadeado verde no navegador garante que a comunicação é criptografada.</p>
        <p>Hospedagem em infraestrutura de ponta com backups automáticos diários e redundância geográfica.</p>
        <p>Acesso administrativo protegido por autenticação de dois fatores e senhas de alta complexidade — ninguém acessa o painel do site sem uma segunda camada de verificação.</p>
        <p>Sejamos honestos: nenhum sistema digital é 100% inviolável. Mas tomamos todas as precauções técnicas ao nosso alcance para proteger seus dados contra acessos não autorizados, vazamentos e incidentes de segurança.</p>

        <h2>10. Alterações nesta política</h2>
        <p>Esta política pode ser atualizada quando houver mudanças significativas na legislação brasileira ou nas práticas operacionais do site.</p>
        <p>A data exibida no topo da página indica qual versão está atualmente em vigor. Se você quiser consultar versões anteriores, é só pedir por email.</p>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
