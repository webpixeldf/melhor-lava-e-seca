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

        <p>Ao acessar e navegar pelo <strong>{site.name}</strong>, você concorda automaticamente com as regras descritas nesta página.</p>
        <p>Escrevemos tudo em português claro, sem letra miúda nem armadilha jurídica. Se algo aqui não fizer sentido para você, mande um email que a gente explica com outras palavras.</p>

        <h2>1. Finalidade do site</h2>
        <p>O {site.name} é um veículo editorial independente dedicado a análises, comparativos e recomendações de lavadoras e secadoras de roupas.</p>
        <p>Todo o conteúdo publicado aqui tem caráter <strong>informativo e opinativo</strong>. Nossas análises refletem a experiência real de uso dos equipamentos e a pesquisa criteriosa da nossa equipe editorial.</p>
        <p>As informações que oferecemos não substituem o manual do fabricante, a avaliação de um técnico especializado ou o seu próprio julgamento na hora de decidir a compra.</p>

        <h2>2. Precisão das informações</h2>
        <p>Fazemos um esforço genuíno para manter cada página atualizada com as especificações mais recentes de cada modelo. Revisamos os artigos a cada três meses.</p>
        <p>Ainda assim, preços, disponibilidade de estoque e condições de frete na Amazon mudam constantemente — às vezes mais de uma vez por dia.</p>
        <p>Antes de finalizar qualquer compra, confira sempre as informações diretamente na página do produto no site do vendedor. O dado mais atualizado é o que aparece lá no momento do clique.</p>

        <h2>3. Links de afiliado</h2>
        <p>Todos os links que direcionam você para a Amazon neste site fazem parte do programa de Associados.</p>
        <p>Isso significa que podemos receber uma comissão sobre as compras realizadas a partir desses cliques.</p>
        <p>Você não paga absolutamente nada adicional por isso. O preço do produto é rigorosamente o mesmo, com ou sem o nosso link.</p>
        <p>
          A explicação completa sobre como funciona o programa, por que ele não influencia nossas avaliações e quanto recebemos está na{' '}
          <Link href="/afiliados/">nossa política de afiliados</Link>.
        </p>

        <h2>4. Propriedade intelectual</h2>
        <p>Os textos, a identidade visual, a estrutura dos comparativos, as tabelas e as imagens originais produzidas pela nossa equipe são de nossa propriedade intelectual. Investimos tempo e recursos para produzi-los.</p>

        <p><strong>Você pode:</strong></p>
        <ul>
          <li>Citar trechos dos nossos artigos, desde que inclua o crédito adequado e um link direto para a página original</li>
          <li>Compartilhar nossos conteúdos nas redes sociais, de preferência marcando nosso perfil</li>
        </ul>

        <p><strong>Você não pode:</strong></p>
        <ul>
          <li>Reproduzir artigos completos em outros sites, blogs ou fóruns, mesmo que com crédito — isso configura concorrência desleal e violação de direitos autorais</li>
          <li>Traduzir nossos conteúdos para outros idiomas e publicá-los como se fossem originais</li>
          <li>Utilizar nossas imagens, tabelas comparativas ou gráficos em campanhas publicitárias, posts patrocinados ou materiais comerciais sem autorização prévia por escrito</li>
        </ul>

        <h2>5. Imagens de produtos</h2>
        <p>As imagens dos eletrodomésticos exibidas no site são provenientes de três fontes: bancos oficiais dos fabricantes, catálogo da Amazon ou produção fotográfica própria.</p>
        <p>Todas as marcas, logotipos e nomes de produtos mencionados pertencem exclusivamente aos seus respectivos titulares. A citação dessas marcas tem finalidade unicamente editorial e informativa, sem qualquer reivindicação de propriedade ou associação comercial.</p>

        <h2>6. Limitação de responsabilidade</h2>
        <p>O {site.name} não pode ser responsabilizado por:</p>
        <ul>
          <li>Decisões de compra tomadas com base no conteúdo do site — a escolha final é sempre sua, e recomendamos que você considere múltiplas fontes de informação</li>
          <li>Defeitos de fabricação, vícios ocultos ou necessidade de assistência técnica dos produtos que analisamos e recomendamos</li>
          <li>Divergências entre as especificações descritas em nossos artigos e o produto físico que você encontrou na loja ou recebeu em casa</li>
          <li>Interrupções temporárias no funcionamento do site, da plataforma Amazon ou de quaisquer serviços de terceiros que estejam além do nosso controle</li>
        </ul>

        <h2>7. Uso indevido</h2>
        <p>É expressamente proibido utilizar este site para:</p>
        <ul>
          <li>Ataques cibernéticos, uso de bots automatizados para extração em massa de conteúdo (scraping), ou qualquer atividade que degrade o desempenho do servidor ou comprometa a experiência de outros visitantes</li>
          <li>Cópia sistemática do conteúdo com finalidade comercial, criação de sites espelho ou republicação em plataformas de terceiros</li>
          <li>Qualquer atividade que viole a legislação brasileira vigente, incluindo mas não se limitando a disseminação de malware, tentativas de phishing e invasão de sistemas</li>
        </ul>

        <h2>8. Alterações nestes termos</h2>
        <p>Estes Termos de Uso podem ser atualizados a qualquer momento, sem aviso prévio individual, para refletir mudanças nas práticas do site ou na legislação aplicável.</p>
        <p>A data de atualização indicada no topo da página sinaliza a versão atualmente em vigor.</p>
        <p>Alterações significativas que afetem diretamente seus direitos como usuário serão comunicadas com destaque na página inicial durante pelo menos sete dias.</p>

        <h2>9. Lei aplicável</h2>
        <p>Estes Termos de Uso são integralmente regidos pela legislação da República Federativa do Brasil, incluindo o Código de Defesa do Consumidor (Lei nº 8.078/1990), o Marco Civil da Internet (Lei nº 12.965/2014) e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
        <p>Fica eleito o foro da comarca de residência do responsável editorial para dirimir quaisquer questões decorrentes da interpretação ou aplicação destes termos.</p>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
