import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/Schema';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = buildMetadata({
  title: 'Política de Afiliados',
  description:
    'Como o Melhor Lava e Seca ganha dinheiro e por que isso não interfere na opinião sobre os produtos.',
  path: '/afiliados/',
});

export default function AfiliadosPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Início', url: site.url },
          { name: 'Política de Afiliados', url: `${site.url}/afiliados/` },
        ]}
      />

      <section className="section container-narrow">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li>Política de Afiliados</li>
          </ol>
        </nav>

        <h1>Política de Afiliados</h1>

        <p>Se tem algo que a gente valoriza mais do que review bem escrita, é honestidade com o leitor. E honestidade inclui abrir a caixa-preta de como o site se financia.</p>
        <p>O Melhor Lava e Seca se mantém no ar exclusivamente através do <strong>Programa de Associados da Amazon Brasil</strong>.</p>
        <p>Nesta página, a gente explica exatamente como funciona — quanto ganhamos, de onde vem o dinheiro e, principalmente, por que esse modelo não corrompe em nada as nossas avaliações. Sem meias-palavras, sem asteriscos escondidos.</p>

        <h2>Como funciona o programa de Associados</h2>
        <p>Imagine que você recomenda uma lava e seca para um amigo. Ele vai até a loja, compra o modelo que você sugeriu — ou qualquer outra coisa — e a loja, agradecida pela indicação, te manda uma pequena recompensa. O programa de Associados da Amazon é essencialmente isso, só que em escala, com regras claras e automatizado.</p>
        <p>Quando você clica em qualquer link nosso que leva para a Amazon, um pequeno marcador digital (um cookie) é ativado no seu navegador. Se, dentro das 24 horas seguintes, você comprar qualquer produto na Amazon — repetindo: qualquer produto, não precisa ser a lava e seca que você viu aqui, pode ser um livro, um fone de ouvido, um pacote de fraldas — a Amazon nos paga uma comissão.</p>
        <p>Já aconteceu de um leitor clicar no link de uma lava e seca Samsung, desistir da compra do eletrodoméstico e, no mesmo dia, comprar um Kindle e uma cafeteira. A comissão veio igual. O sistema da Amazon registra que a sessão de compra começou com o nosso link e nos credita por tudo que for adquirido naquela janela de 24 horas.</p>
        <p><strong>Você não paga um centavo a mais por isso.</strong> O preço do produto na Amazon é rigorosamente idêntico — com ou sem o nosso link. A comissão é paga pela própria Amazon, como parte do orçamento de marketing da empresa. Não existe taxa embutida, acréscimo disfarçado ou valor repassado ao consumidor.</p>
        <p>Na prática, a comissão para a categoria de eletrodomésticos gira em torno de 2% a 4% sobre o valor do produto. Em uma lava e seca de R$ 3.500, isso representa algo entre R$ 70 e R$ 140 para o site. Em um modelo de entrada de R$ 1.800, a comissão fica entre R$ 36 e R$ 72.</p>

        <h2>Por que o dinheiro da Amazon não influencia nossas análises</h2>
        <p>Esta é a pergunta que mais importa nesta página inteira. E a resposta é mais direta do que parece.</p>
        <p>O percentual de comissão da Amazon é definido por categoria de produto, não por marca nem por modelo. Samsung, LG, Midea, Electrolux, Bosch e Panasonic pagam rigorosamente a mesma porcentagem. Não existe "comissão turbinada" para indicar o modelo mais caro, nem "bônus de performance" para favorecer uma marca específica. A Amazon não faz distinção — e nós também não.</p>
        <p>Para o nosso bolso, é financeiramente indiferente recomendar uma lava e seca de R$ 2.000 ou uma de R$ 5.900. O percentual é o mesmo. O que faz diferença real para a sustentabilidade do site a longo prazo é algo muito mais simples: a sua confiança.</p>
        <p>Se a gente começar a recomendar produto ruim por qualquer motivo, você vai perceber — e não volta mais. E aí o site morre. O incentivo econômico real do modelo de afiliados é perfeitamente alinhado com o seu interesse como consumidor: reviews honestas geram confiança, confiança gera retorno, retorno gera novas visitas e novas comissões. É um ciclo virtuoso que só funciona se a gente não mentir.</p>
        <p>Nosso modelo de negócio é baseado em reputação construída ao longo de anos — não em empurrar produto na base do grito. Reputação se constrói gota a gota, com acertos repetidos. E se destrói em cinco minutos, com uma única recomendação desonesta.</p>

        <h2>Como identificar um link de afiliado no site</h2>
        <p>A gente não esconde nada. Todos os elementos clicáveis que direcionam você para a Amazon são links de afiliado, e são facilmente identificáveis:</p>
        <p>Os botões <strong>'Ver preço na Amazon'</strong>, sempre na cor laranja, que aparecem nos cards de produto, nas tabelas comparativas e ao final de cada análise.</p>
        <p>Qualquer link textual que aponte para <code>amazon.com.br</code> carrega nosso código de associado: <code>tag={site.amazonPartnerTag}</code>.</p>

        <h2>O aviso oficial da Amazon</h2>
        <p>Como exige o regulamento do programa de Associados, reproduzimos abaixo o disclaimer padrão exigido contratualmente:</p>
        <blockquote>
          <p>
            Como associado da Amazon, recebemos por compras qualificadas
            feitas através deste site.
          </p>
        </blockquote>

        <h2>O que a gente não faz, em hipótese alguma</h2>
        <ul>
          <li><strong>Review patrocinado.</strong> Não publicamos conteúdo pago por fabricante, distribuidor, agência de marketing ou qualquer intermediário. Se uma lava e seca aparece no site, é porque foi avaliada pela nossa equipe — não porque recebemos depósito bancário para publicar.</li>
          <li><strong>Produto de cortesia.</strong> Não aceitamos equipamento doado por fabricante em troca de cobertura favorável. Se um dia recebermos um produto para teste por cortesia, isso será explicitamente declarado no artigo — e a política editorial será rigorosamente a mesma de sempre.</li>
          <li><strong>Banner publicitário.</strong> Você não vai encontrar anúncios de marcas específicas no site. Não vendemos espaço publicitário para fabricantes de lava e seca. Queremos que o leitor tenha certeza absoluta de que o conteúdo não foi influenciado por pagamento direto de anunciante.</li>
          <li><strong>Conteúdo terceirizado.</strong> Nenhum artigo deste site é escrito por agência externa, freelancer contratado por volume de texto ou inteligência artificial sem supervisão humana. Cada palavra publicada aqui foi produzida, revisada e mantida pela nossa equipe editorial permanente.</li>
        </ul>

        <h2>Para onde vai o dinheiro</h2>
        <p>A comissão média por venda fica entre R$ 30 e R$ 90, considerando o preço atual das lava e seca no mercado brasileiro. É um valor modesto por transação — longe de ser um modelo milionário.</p>
        <p>Em um mês típico, o total arrecadado cobre exatamente os custos operacionais do site: hospedagem e infraestrutura, aquisição dos próprios equipamentos que testamos (sim, compramos as máquinas que avaliamos), ferramentas de medição como wattímetro e decibelímetro, e a remuneração básica da equipe editorial.</p>
        <p>Não estamos construindo patrimônio com isso. Estamos pagando as contas enquanto fazemos um trabalho que acreditamos ser genuinamente útil para quem está prestes a gastar uma quantia significativa num eletrodoméstico. E dormimos tranquilos porque cada centavo que entrou veio de um leitor que, voluntariamente, clicou, gostou do que viu e fez uma compra que atendia às suas necessidades.</p>
        <p>Se um dia esse modelo deixar de ser suficiente para manter o site no ar, seremos os primeiros a comunicar — e a buscar alternativas que não comprometam a independência editorial.</p>

        <h2>Ficou com alguma dúvida?</h2>
        <p>Se depois de ler esta página ainda restou uma pulga atrás da orelha — ou se você simplesmente quer entender melhor como a gente funciona — o canal está permanentemente aberto:</p>
        <p><a href={`mailto:${site.email}`}>{site.email}</a></p>
        <p>A gente responde pessoalmente, com o mesmo nível de transparência que você acabou de ler.</p>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Voltar para a página inicial →</Link>
        </p>
      </section>
    </>
  );
}
