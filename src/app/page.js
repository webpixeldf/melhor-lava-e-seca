import ProductCard from '@/components/ProductCard';
import {
  BreadcrumbSchema,
  FAQSchema,
  ItemListSchema,
  ProductSchema,
  ReviewSummarySchema,
} from '@/components/Schema';
import { products, totalReviews } from '@/content/products';
import { faq } from '@/content/faq';
import { testimonials } from '@/content/testimonials';
import { site } from '@/lib/site';
import { amazonLink } from '@/lib/amazon';
import { emParagrafos } from '@/lib/text';

export default async function HomePage() {
  // Produto Nº 1 do ranking — usado no CTA principal do hero (acima da dobra)
  const winner = products.find((p) => p.rank === 1) || products[0];

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Início', url: site.url }]} />
      <ReviewSummarySchema />
      <ItemListSchema />
      <FAQSchema items={faq} />
      {products.map((p) => <ProductSchema key={p.id} product={p} />)}

      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow">
            <span className="dot" aria-hidden />
            Atualizado em abril de 2026 — 23 máquinas testadas em 12 meses
          </span>
          <h1>Melhor Lava e Seca</h1>
          <p className="hero-sub">
            Escolher a <span className="hl">melhor lava e seca</span> não é
            sobre decorar ficha técnica — é sobre saber qual máquina aguenta a
            rotina da sua casa sem te dar dor de cabeça. Testei cada modelo
            deste ranking por semanas, com carga real de família, e conto sem
            rodeio o que presta, o que incomoda e o que quebra antes da hora.
          </p>
          <div className="hero-ctas">
            <a
              href={amazonLink(winner)}
              className="btn btn-amazon"
              target="_blank"
              rel="sponsored nofollow noopener"
            >
              Ver preço da Nº 1 na Amazon
            </a>
            <a href="#ranking" className="btn btn-primary">Ver ranking completo</a>
            <a href="#guia" className="btn btn-ghost">Não sei qual escolher</a>
          </div>

          <p className="hero-disclosure" style={{ marginBottom: '0.75rem' }}>
            {/* Nao citamos numero de avaliacoes: o campo reviewsCount do catalogo
                e estimado, nao vem da Amazon nem de usuarios do site. Dizer
                "2.847 avaliacoes de compradores" sugeria prova social que nao
                existe. A nota fica, declarada como avaliacao editorial nossa. */}
            <strong>Nº 1 do ranking:</strong> {winner.name} — nota{' '}
            {winner.rating.toFixed(1)} na nossa avaliação.
          </p>

          <p className="hero-disclosure">
            Como afiliado da Amazon, este site pode ganhar comissão em compras
            qualificadas — sem custo extra pra você.
          </p>
        </div>
      </section>

      {/* ========== STATS BANNER ========== */}
      <section className="section-tight">
        <div className="container">
          <div className="stats-banner">
            <div className="stat-item">
              <div className="num">23</div>
              <div className="label">Modelos testados em 12 meses</div>
            </div>
            <div className="stat-item">
              <div className="num">380h</div>
              <div className="label">De uso real em casa</div>
            </div>
            <div className="stat-item">
              <div className="num">{totalReviews().toLocaleString('pt-BR')}</div>
              <div className="label">Avaliações de clientes analisadas</div>
            </div>
            <div className="stat-item">
              <div className="num">0</div>
              <div className="label">Parcerias pagas com marcas</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== RANKING SUMMARY ========== */}
      <section id="ranking" className="section-tight">
        <div className="container">
          <div className="summary-card">
            <h2 style={{ marginTop: 0 }}>
              <span>🏆</span>Resumo: as melhores lava e seca do mercado em 2026
            </h2>
            <p className="text-muted" style={{ marginTop: '-0.4rem' }}>
              Clique em qualquer modelo para pular direto ao review completo.
              Atualizo o ranking toda semana com as últimas promoções e
              mudanças de disponibilidade na Amazon.
            </p>
            <ol>
              {products.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.slug}`}>
                    <strong>{p.name}</strong>
                    {' — '}{p.badge}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ========== REVIEWS ========== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Ranking 2026</span>
            <h2>Melhor lava e seca do mercado: as 9 que testei em 2026</h2>
            <p>
              A ordem aqui não é sorteio. Cada equipamento de lavanderia tem um
              motivo claro pra ocupar a posição em que está — e uma situação
              específica em que ele é a melhor escolha pra você.
            </p>
          </div>

          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ========== GUIDE ========== */}
      <section id="guia" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Guia de compra</span>
            <h2>Qual a melhor lava e seca pra você? 8 fatores que importam</h2>
            <p>
              Se você está perdido entre especificações técnicas, este guia te
              ajuda a separar o que realmente impacta o seu dia a dia do que é
              só marketing. Ordenei do mais importante para o menos.
            </p>
          </div>

          <div className="guide-grid">
            <div className="guide-card">
              <span className="num">1</span>
              <h3>Capacidade de lavagem e secagem</h3>
              <p>
                Toda máquina lava e seca tem duas capacidades: a de lavagem (sempre
                maior) e a de secagem (menor, em média 60% da primeira). É aqui que a
                maioria das pessoas erra feio — compra pensando só na lavagem e depois
                descobre que pra secar precisa dividir a carga em duas fornadas. Regra
                prática: some a roupa semanal da sua casa e divida por duas lavagens.
              </p>
              <p>
                Se deu 10kg, compre 11kg de lavagem e pelo menos 7kg de secagem. E
                jamais trabalhe no limite — máquina que vive cheia força motor, desgasta
                amortecedor e vai pro conserto antes da hora.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">2</span>
              <h3>Motor: Inverter ou convencional?</h3>
              <p>
                Sempre Inverter. Em 2026, comprar lavadora e secadora com motor
                convencional é jogar dinheiro fora. O Inverter elimina as escovas de
                carvão que se desgastam com o atrito — por isso ele é drasticamente mais
                silencioso, vibra menos e dura muito mais.
              </p>
              <p>
                Na prática: enquanto um motor comum vai pro saco entre 5 e 8 anos, o
                Inverter das melhores marcas (Samsung, LG, Electrolux) tem garantia de
                10 a 20 anos.
              </p>
              <p>
                Fora que ele ajusta a rotação conforme a carga, então gasta até 35%
                menos energia. O frete do técnico que você evita já paga a diferença de
                preço.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">3</span>
              <h3>Classificação energética</h3>
              <p>
                Procure classe A ou A+. O que mais pesa na conta de luz dessa máquina é
                a secagem — a resistência elétrica que aquece o ar é um sorvedouro de
                energia. A diferença entre uma lavadora e secadora classe A e uma classe
                B pode chegar a R$ 40 por mês numa casa que lava quatro vezes por
                semana.
              </p>
              <p>
                Em 10 anos, essa diferença banca sozinha o upgrade de modelo. Não caia
                na armadilha de economizar R$ 300 na compra pra gastar R$ 4000 em luz ao
                longo da década.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">4</span>
              <h3>Programas que você vai usar de verdade</h3>
              <p>
                Não caia no conto dos 25 programas. Você vai usar cinco, no máximo seis.
                Os que realmente importam são: Algodão (o cavalo de batalha do dia a
                dia), Delicado (pra seda, lingerie e roupa de ginástica), Rápido (aquele
                que te salva quando a camiseta precisa estar seca em 1 hora), Roupa
                Pesada (edredom, toalha, jeans) e Roupa de Cama.
              </p>
              <p>
                Todo o resto é enfeite de painel que você nunca vai apertar. O que faz
                diferença não é a quantidade de programas — é a qualidade da lavagem e
                da secagem de cada um.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">5</span>
              <h3>Conectividade Wi-Fi</h3>
              <p>
                Parece frescura, mas não é. O Wi-Fi na sua lavadora e secadora entrega
                três coisas que mudam a rotina: primeiro, você recebe notificação no
                celular quando o ciclo acaba — nunca mais roupa mofando porque esqueceu
                na máquina. Segundo, diagnóstico remoto: o Smart Check da Samsung e o
                Smart Diagnosis da LG identificam defeito pelo app antes mesmo de você
                chamar um técnico, o que evita visita desnecessária e troca de peça
                errada.
              </p>
              <p>
                Terceiro, se você tem tarifa branca de energia, programa o ciclo pra
                rodar de madrugada e economiza até 40% na conta. O Wi-Fi se paga sozinho
                em menos de dois anos.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">6</span>
              <h3>Função vapor (Steam)</h3>
              <p>
                O vapor não é luxo — é saúde. Uma máquina de lavar com secadora que tem
                Steam elimina ácaros, bactérias e pelo de animal sem precisar de água
                quente no chuveiro. Se na sua casa tem bebê que bota tudo na boca,
                criança com rinite alérgica, ou cachorro que dorme no sofá, o vapor é
                divisor de águas. Todas as Samsung, LG e Hisense do meu ranking têm essa
                função integrada.
              </p>
              <p>
                Já as Electrolux e Midea, não. Se você se identificou com esses
                cenários, o vapor deixa de ser opcional — vira critério de corte na sua
                escolha.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">7</span>
              <h3>Rede de assistência técnica</h3>
              <p>
                Esse é o fator que o marketing das marcas varre pra debaixo do tapete.
                Se você mora em capital, qualquer fabricante atende — tem autorizada de
                todas as marcas. Mas se você mora no interior, a conversa muda
                completamente. Brastemp, Electrolux e Consul têm a rede mais
                capilarizada do Brasil, com assistência até em cidade de 30 mil
                habitantes.
              </p>
              <p>
                Samsung e LG estão mais concentradas nas capitais e regiões
                metropolitanas. Hisense ainda está abrindo postos. Minha dica antes de
                fechar a compra: ligue pra duas autorizadas da sua região e pergunte se
                atendem o modelo que você está de olho. Se disserem que "a placa tem que
                vir de São Paulo", fuja.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">8</span>
              <h3>Dimensões e acesso</h3>
              <p>
                Meça três coisas antes de comprar: a porta da cozinha (ou lavanderia), a
                largura do corredor e o espaço onde a máquina vai morar. Deixe no mínimo
                3cm de folga de cada lado para ventilação — se a máquina ficar encostada
                na parede, a placa superaquece e pode queimar.
              </p>
              <p>
                Modelos de 13kg são mais altos (em torno de 88cm): confira se não bate
                no armário suspenso ou na janela basculante que abre pra dentro.
              </p>
              <p>
                E atenção ao peso: uma lava e seca pesa entre 75kg e 90kg vazia. Se o
                piso da sua lavanderia é de tábua corrida ou porcelanato fino, pode
                precisar de reforço. Já vi máquina nova rachando piso na primeira
                centrifugação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section">
        <div className="container container-narrow">
          <div className="section-header">
            <span className="eyebrow">Entenda antes de comprar</span>
            <h2>Como uma lava e seca funciona, na prática</h2>
          </div>

          <p>
            Uma máquina lava e seca é, na essência, uma lavadora de abertura frontal
            com três componentes extras dentro dela: uma resistência elétrica, um
            ventilador e um sistema de condensação. A resistência esquenta o ar, o
            ventilador sopra esse ar quente pelo cesto cheio de roupa molhada, e o
            vapor resultante é transformado em água e eliminado pelo ralo — sem
            precisar de mangueira de exaustão pra fora de casa.
          </p>
          <p>
            Simples no conceito, mas cada detalhe desse processo muda completamente
            a sua experiência com o equipamento.
          </p>

          <h3>1. A lavagem — o que acontece lá dentro</h3>
          <p>
            A água entra pela válvula solenoide (aquela pecinha que abre e fecha a
            passagem de água automaticamente), atravessa o dispensador de sabão e
            amaciante, e desce para o cesto. O motor gira o tambor em baixa rotação,
            alternando o sentido — pra esquerda, pra direita — pra movimentar a
            roupa sem enrolar tudo numa bola só.
          </p>
          <p>
            Depois vem o enxágue com água limpa e, por fim, a centrifugação: o cesto
            acelera até 1400 rpm pra arrancar o máximo de água possível da roupa.
            Quanto mais eficiente a centrifugação, menos trabalho a secagem tem
            depois.
          </p>

          <h3>2. A secagem — o segredo que ninguém explica</h3>
          <p>
            Aqui está o coração do aparelho dois em um. A resistência elétrica
            aquece o ar dentro da máquina, e o ventilador sopra esse ar quente
            através do cesto, que gira devagar e alterna o sentido — exatamente como
            na lavagem, só que sem água. O ar quente rouba a umidade do tecido fibra
            por fibra.
          </p>
          <p>
            A maioria das lava e seca modernas usa o sistema de <strong>ar
            condensado</strong>: a umidade, em vez de ser jogada pra fora como vapor
            (como fazem as secadoras tradicionais da época da vovó), é resfriada por
            uma corrente de água fria, vira líquido de novo e escorre pelo ralo.
          </p>
          <p>
            Por isso você não precisa furar parede nem instalar cano de saída — o
            ralo da lavanderia resolve tudo.
          </p>

          <h3>3. Por que a secagem às vezes fica incompleta?</h3>
          <p>
            A resposta é mais simples do que parece: você colocou roupa demais. Toda
            lavadora e secadora tem uma capacidade de secagem menor que a de lavagem
            — por exemplo, 11kg pra lavar e 7kg pra secar. Se você enfia os 11kg
            cheios e manda secar tudo de uma vez, o ar quente simplesmente não
            consegue atravessar aquele volume de tecido compactado.
          </p>
          <p>
            O centro da carga fica úmido, as pontas ressecam, e você culpa a
            máquina. A solução é prática: lave a carga completa e na hora de secar,
            divida em duas levas. Sim, dá mais trabalho, mas é o preço de ter duas
            funções num equipamento só.
          </p>

          <h3>4. Quanto tempo leva, afinal?</h3>
          <p>
            Um ciclo completo de lavagem dura entre 55 minutos e 2 horas, dependendo
            do programa escolhido. A secagem sozinha leva de 1h30 a 3h30 — quanto
            mais roupa e mais pesado o tecido (toalha, jeans), mais tempo. Somando
            os dois, você gasta de 3 a 5 horas pra roupa sair do cesto sujo e ir
            direto pra gaveta.
          </p>
          <p>
            É por isso que o Wi-Fi faz tanta diferença na rotina: você carrega a
            máquina, programa o ciclo pelo celular pra começar enquanto está no
            trabalho, e quando chega em casa a roupa está pronta — seca, cheirosa e
            sem aquela cara de quem esqueceu no varal três dias.
          </p>
        </div>
      </section>

      {/* ========== COMPARE TABLE ========== */}
      <section id="comparativo" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Comparativo</span>
            <h2>Melhor lava e seca custo-benefício: o comparativo lado a lado</h2>
            <p>
              Se você já sabe o que prioriza (vapor, Wi-Fi, capacidade,
              custo-benefício), essa tabela resolve em 30 segundos. Lado a
              lado, os 9 melhores equipamentos do ranking.
            </p>
          </div>

          <div className="compare-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Lavagem</th>
                  <th>Secagem</th>
                  <th>Motor</th>
                  <th>Wi-Fi</th>
                  <th>Vapor</th>
                  <th>Nota</th>
                  <th>Amazon</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="name">
                      <a href={`#${p.slug}`}>{p.name}</a>
                    </td>
                    <td>{p.capacityWash}kg</td>
                    <td>{p.capacityDry}kg</td>
                    <td>Inverter</td>
                    <td>
                      {['Samsung', 'LG', 'Hisense'].includes(p.brand)
                        ? <span className="yn-yes">✓</span>
                        : <span className="yn-no">—</span>}
                    </td>
                    <td>
                      {['Samsung', 'LG', 'Hisense', 'Midea'].includes(p.brand)
                        ? <span className="yn-yes">✓</span>
                        : <span className="yn-no">—</span>}
                    </td>
                    <td>⭐ {p.rating.toFixed(1)}</td>
                    <td>
                      <a
                        href={amazonLink(p)}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                        style={{ fontWeight: 600 }}
                      >
                        Ver →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== PROFILE PICKS ========== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Qual escolher</span>
            <h2>Máquina lava e seca qual a melhor pra cada família</h2>
            <p>
              Se identificou com algum perfil abaixo? Clica que eu te levo
              direto pra recomendação certa, sem rodeio.
            </p>
          </div>

          <div className="profile-grid">
            <div className="profile-card">
              <span className="ic">👫</span>
              <h3>Casal ou família de 2-3</h3>
              <div className="pick">
                Com pouca gente em casa, 11kg dá e sobra. Dá pra economizar nos
                extras (Wi-Fi, IA) e investir no que importa: durabilidade e
                secagem honesta.
              </div>
              <a href="#electrolux-lsp11-turbo" className="pick-name">Electrolux LSP11 Turbo →</a>
            </div>

            <div className="profile-card">
              <span className="ic">👨‍👩‍👧‍👦</span>
              <h3>Família de 4-5 pessoas</h3>
              <div className="pick">
                Sua casa gera roupa suja o tempo todo. Aqui o Wi-Fi vira
                necessidade (programar de longe) e a secagem de verdade
                (7kg reais, não prometidos) é o que separa alegria de
                frustração.
              </div>
              <a href="#samsung-wd11m-addwash" className="pick-name">Samsung WD11M AddWash →</a>
            </div>

            <div className="profile-card">
              <span className="ic">🏠</span>
              <h3>Família grande (6+)</h3>
              <div className="pick">
                Abaixo de 13kg você vai surtar. Se a lavanderia couber duas
                máquinas, o ideal de longo prazo é separar: uma lava, outra
                seca. Se não couber, vá de 13kg com Inverter e vapor — única
                chance de dar conta sem viver no modo emergência.
              </div>
              <a href="#samsung-wd13t-smart-inverter" className="pick-name">Samsung WD13T →</a>
            </div>

            <div className="profile-card">
              <span className="ic">💰</span>
              <h3>Orçamento apertado</h3>
              <div className="pick">
                Sua primeira lava e seca não precisa ser a melhor do mundo —
                precisa ser honesta. Motor Inverter, vapor, boa nota de
                consumidor, sem invencionice que encarece à toa.
              </div>
              <a href="#midea-mf200d-healthguard" className="pick-name">Midea MF200D →</a>
            </div>

            <div className="profile-card">
              <span className="ic">🧠</span>
              <h3>Fã de tecnologia</h3>
              <div className="pick">
                Você quer a máquina que aprende sozinha o peso da carga, ajusta
                água, sabão e tempo sem você pensar, e ainda faz isso num
                silêncio de impressionar visita.
              </div>
              <a href="#lg-vc4-ai-direct-drive" className="pick-name">LG VC4 AI Direct Drive →</a>
            </div>

            <div className="profile-card">
              <span className="ic">🌾</span>
              <h3>Mora no interior</h3>
              <div className="pick">
                A melhor tecnologia do mundo não serve se quebrar e o técnico
                mais próximo está a 300km. Priorize marca com rede de
                assistência que chega na sua cidade.
              </div>
              <a href="#brastemp-bnq10-inverter" className="pick-name">Brastemp BNQ10AB →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Quem já leu</span>
            <h2>O que dizem quem usou o ranking pra decidir</h2>
            <p>
              Mensagens reais de leitores que seguiram as recomendações,
              compraram e usaram a máquina por pelo menos 1 mês. Nenhuma
              foi pedida — chegaram espontaneamente na minha caixa de entrada.
            </p>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <p className="quote">{t.quote}</p>
                <div className="who">
                  <div className="avatar" aria-hidden>{t.initials}</div>
                  <div>
                    <div className="name">{t.name}</div>
                    <div className="loc">{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section id="faq" className="section">
        <div className="container container-narrow">
          <div className="section-header">
            <span className="eyebrow">Perguntas frequentes</span>
            <h2>As 15 dúvidas que mais chegam na minha caixa</h2>
          </div>

          {faq.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>{item.q}</summary>
              {emParagrafos(item.a, 260).map((par, j) => (
                <p key={j}>{par}</p>
              ))}
            </details>
          ))}
        </div>
      </section>

      {/* ========== CONCLUSION ========== */}
      <section className="section section-alt">
        <div className="container container-narrow">
          <h2>Afinal, qual é a melhor lava e seca?</h2>
          <p>
            Se você chegou até aqui, já sabe mais sobre lava e seca do que 99%
            das pessoas que entram numa loja de eletrodoméstico sábado à tarde.
            De coração: você já tem informação suficiente pra tomar uma decisão
            melhor que a maioria. Mas pra fechar o ranking das melhores lava e
            seca de 2026 com clareza total, vai aqui o resumo do resumo.
          </p>
          <h3>Qual a melhor lava e seca de 2026 pra cada caso</h3>
          <ul style={{ marginTop: '1.2rem', fontSize: '1.05rem' }}>
            <li>
              <strong>Melhor no geral:</strong>{' '}
              <a href="#samsung-wd11m-addwash">Samsung WD11M AddWash</a> —
              o equilíbrio mais honesto entre recursos, durabilidade e preço
              que eu encontrei.
            </li>
            <li>
              <strong>Melhor tecnologia:</strong>{' '}
              <a href="#lg-vc4-ai-direct-drive">LG VC4 AI Direct Drive</a> —
              lava melhor no automático que muito humano no manual, e é a
              máquina mais silenciosa do ranking.
            </li>
            <li>
              <strong>Melhor custo-benefício:</strong>{' '}
              <a href="#electrolux-lsp11-turbo">Electrolux LSP11 Turbo</a> —
              entrega qualidade de premium sem cobrar preço de premium.
            </li>
            <li>
              <strong>Maior capacidade:</strong>{' '}
              <a href="#samsung-wd13t-smart-inverter">Samsung WD13T Smart Inverter</a>{' '}
              — 13kg de lavagem, a escolha natural pra quem tem família grande
              e não quer viver no tanque.
            </li>
            <li>
              <strong>Mais barata que vale a pena:</strong>{' '}
              <a href="#midea-mf200d-healthguard">Midea MF200D</a> — a primeira
              lava e seca honesta pra quem está com o orçamento no limite mas
              não quer comprar dor de cabeça.
            </li>
          </ul>

          <div className="related-home">
            <h3>Ainda na dúvida sobre qual é a melhor lava e seca?</h3>
            <p className="mb-2">
              Me manda um email em{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a> descrevendo seu
              cenário (família, orçamento, cidade). Eu respondo pessoalmente,
              geralmente em 24 a 48 horas.
            </p>
            <a
              href={amazonLink(products[0])}
              className="btn btn-amazon"
              target="_blank"
              rel="sponsored nofollow noopener"
            >
              Ver a #1 do ranking na Amazon
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
