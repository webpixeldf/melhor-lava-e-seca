import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Sobre o Melhor Lava e Seca',
  description:
    'Conheça quem está por trás dos reviews do Melhor Lava e Seca: metodologia de teste, relação com fabricantes e como o site se mantém no ar.',
  path: '/sobre/',
});

export default function SobrePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Sobre', url: `${site.url}/sobre/` },
        ]}
      />

      <section className="section container-narrow">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li>Sobre</li>
          </ol>
        </nav>

        <h1>Sobre o Melhor Lava e Seca</h1>

        <p>
          O <strong>Melhor Lava e Seca</strong> não surgiu de plano de negócio
          nem de pesquisa de mercado. Surgiu de uma tarde perdida numa loja de
          eletrodomésticos em 2023. Eu estava parado diante de oito lavadoras e
          secadoras, com o vendedor repetindo que "todas são boas", tentando
          descobrir sozinho se a diferença de R$ 2.000 entre o modelo mais barato
          e o mais caro se justificava em algo além da cor do painel. Puxei o
          celular, digitei o nome de cada uma no Google, e cada site que eu abria
          dizia exatamente a mesma coisa: "design moderno", "tecnologia exclusiva",
          "eficiência energética". Nenhum mencionava que o tambor de aço inox risca
          com zíper. Nenhum contava que o filtro entope a cada três lavagens. Nenhum
          admitia que o aplicativo do celular desconecta sozinho. Saí da loja de
          mãos vazias e com uma certeza: alguém precisava escrever sobre esses
          equipamentos com honestidade brutal. Foi assim que o projeto nasceu.
        </p>

        <h2>Por que a gente leva isso tão a sério</h2>
        <p>
          Dedicar horas do dia a lavadoras e secadoras parece estranho até você
          colocar na ponta do lápis. É um eletrodoméstico que vai ocupar sua
          lavanderia por 8, 10, às vezes 15 anos. Representa um investimento que
          varia de R$ 2.000 a R$ 6.000 — frequentemente o equivalente a um salário
          mínimo ou mais. Consome água, energia e sabão toda semana, interferindo
          diretamente na rotina da casa. Uma escolha malfeita significa barulho
          excessivo durante a centrifugação, roupas que saem úmidas do ciclo de
          secagem, painel que pifa logo após o fim da garantia. Acertar na compra
          é um alívio que dura uma década. Errar é uma dor de cabeça que se repete
          a cada lavagem. Nosso objetivo é simples: que você acerte de primeira.
        </p>

        <h2>Como a gente avalia cada lavadora e secadora</h2>
        <p>
          Nenhuma máquina aparece no nosso{' '}
          <Link href="/">guia principal</Link>{' '}
          sem ter passado por pelo menos um destes três processos de avaliação.
          Não publicamos review de equipamento que nunca vimos de perto.
        </p>
        <ol>
          <li>
            <strong>Teste residencial prolongado:</strong> a lava e seca entra na
            casa de um editor e enfrenta a rotina real de uma família por três a
            seis semanas. São no mínimo 15 ciclos completos, com cargas variadas:
            roupa de cama de casal, toalhas pesadas, roupas delicadas, edredons.
            Medimos consumo de energia com wattímetro, nível de ruído em decibéis
            durante a centrifugação, umidade residual da roupa ao final da secagem,
            e anotamos cada detalhe — do cheiro do tambor novo ao comportamento do
            dispenser de sabão depois de um mês de uso. Sem prazo editorial, sem
            roteiro de marketing, sem pressa.
          </li>
          <li>
            <strong>Inspeção presencial em loja:</strong> visitamos pontos de venda
            físicos para examinar acabamento, abertura de porta, ergonomia do painel
            e qualidade dos materiais. Rodamos os programas disponíveis no modo
            demonstração e comparamos o que a máquina promete com o que entrega.
          </li>
          <li>
            <strong>Entrevistas com proprietários reais:</strong> conversamos longamente
            com pelo menos cinco donos que convivem com o mesmo modelo há mais de doze
            meses. Perguntamos sobre manutenção, defeitos crônicos, peças que quebraram,
            como o equipamento envelheceu. É nessas conversas que descobrimos o que
            review nenhuma conta: que a borracha da porta cria mofo em cidade úmida,
            que o pé regulável solta sozinho, que a assistência técnica da marca X
            demora 45 dias para atender. Sem esse tipo de informação, falar em
            durabilidade é desonesto.
          </li>
        </ol>

        <h2>Como o site paga as contas</h2>
        <p>
          Somos <strong>associados Amazon</strong>. Quando você clica em "Ver
          preço na Amazon" e realiza qualquer compra — não precisa ser o modelo
          que indicamos — a Amazon nos paga uma comissão que varia entre 2% e 4%
          do valor do produto. Você não paga nada adicional por isso. O preço é
          rigorosamente o mesmo, com ou sem o nosso link. Essa comissão é igual
          para todos os fabricantes: Samsung, LG, Midea, Electrolux e Bosch pagam
          exatamente o mesmo percentual. Não existe incentivo financeiro para
          favorecer marca A em detrimento da marca B. Também não aceitamos
          pagamento de fabricante, produto de cortesia em troca de cobertura
          favorável, publieditorial ou banner publicitário. Se aceitássemos,
          toda lava e seca estaria em primeiro lugar e você não teria motivo
          para confiar na gente. A explicação detalhada está na{' '}
          <Link href="/afiliados/">política de afiliados</Link>.
        </p>

        <h2>Quem faz o site acontecer</h2>
        <p>
          Somos uma equipe enxuta: dois jornalistas com formação em engenharia
          e mais de dez anos de experiência cobrindo o mercado de eletrodomésticos.
          Não temos redação em São Paulo, não respondemos a grupo de mídia, não
          recebemos pauta de agência. Cada artigo publicado aqui foi escrito,
          revisado e atualizado por gente que realmente já desmontou um filtro
          de lava e seca numa tarde de domingo para entender por que ele entope.
          Se você está em dúvida sobre qual equipamento comprar para a sua
          realidade — tamanho de família, orçamento disponível, espaço na
          lavanderia — escreva para{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>{' '}
          que a gente lê e responde pessoalmente.
        </p>

        <h2>A gente erra — e prefere consertar</h2>
        <p>
          Especificação muda sem aviso, modelo sai de linha de um mês para o outro,
          fabricante atualiza o software do painel via atualização remota. A gente
          revisa cada página a cada três meses, mas num mercado que lança dezenas
          de SKUs por ano, algum detalhe pode escapar. Se você notou uma informação
          desatualizada, imprecisa ou simplesmente errada, mande um email. Corrigimos
          em até 48 horas, publicamos a errata e agradecemos nominalmente. Preferimos
          admitir o erro a manter o leitor mal informado. É o mínimo que você merece.
        </p>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
