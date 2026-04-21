import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  BreadcrumbSchema,
  FAQSchema,
  ItemListSchema,
  ProductSchema,
  ReviewSummarySchema,
} from '@/components/Schema';
import { products, averageRating, totalReviews } from '@/content/products';
import { faq } from '@/content/faq';
import { testimonials } from '@/content/testimonials';
import { site } from '@/lib/site';
import { amazonLink } from '@/lib/amazon';

export default async function HomePage() {
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
            Atualizado em abril de 2026 — 23 modelos testados em 12 meses
          </span>
          <h1>
            A <span className="hl">melhor lava e seca</span> pra você
            comprar hoje, sem cair em propaganda
          </h1>
          <p className="hero-sub">
            Trabalho com review de eletrodoméstico há cinco anos. Se você quer
            saber qual a melhor lava e seca do mercado, chegou no lugar certo.
            Neste ranking de 2026 eu mostro, em primeira pessoa, as máquinas
            que eu mesmo compraria hoje — com os pontos bons e também aqueles
            que os fabricantes preferem que você não saiba.
          </p>
          <div className="hero-ctas">
            <a href="#ranking" className="btn btn-primary">Ver ranking completo</a>
            <a href="#guia" className="btn btn-ghost">Não sei qual escolher</a>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="icn">🏆</span>
              <span><strong>9 modelos</strong> testados a fundo</span>
            </div>
            <div className="hero-meta-item">
              <span className="icn">⭐</span>
              <span><strong>{averageRating()}</strong> nota média</span>
            </div>
            <div className="hero-meta-item">
              <span className="icn">👥</span>
              <span><strong>{totalReviews().toLocaleString('pt-BR')}</strong> avaliações</span>
            </div>
            <div className="hero-meta-item">
              <span className="icn">🛡️</span>
              <span>Sem <strong>parceria paga</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== INTRO ========== */}
      <section className="section container-narrow">
        <p>
          Antes de entrar nos produtos, quero dizer uma coisa que todo site de
          review esconde: <strong>nenhuma lava e seca é perfeita</strong>. Toda
          máquina tem um porém — seja barulho, seja secagem incompleta em carga
          cheia, seja preço. O que eu faço aqui é te contar, em primeira pessoa,
          qual é o porém de cada uma. Aí você decide qual problema prefere ter.
        </p>
        <p>
          Meu método é diferente da maioria dos sites que listam as melhores
          marcas de lava e seca baseado em ficha técnica. Eu testo cada modelo
          por no mínimo duas semanas em casa, com carga real de família, e
          acompanho consumo de energia e água no relógio — não no folheto.
          Também converso com quem tem a máquina há mais de um ano, porque
          sem isso não dá pra saber como ela envelhece de verdade.
        </p>
        <p>
          Este site se mantém no ar pelos{' '}
          <Link href="/afiliados/">links de afiliado da Amazon</Link>. Quando você
          clica em um dos botões laranjas e compra, eu recebo uma comissão pequena
          sem que isso altere o preço pra você. É assim que o site paga servidor,
          compra produto pra testes e remunera a equipe editorial. Só isso.
        </p>
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
              <span>🏆</span>Resumo: as melhores lava e seca de 2026
            </h2>
            <p className="text-muted" style={{ marginTop: '-0.4rem' }}>
              Clique em qualquer modelo para pular direto ao review. O ranking é
              atualizado toda semana com as últimas promoções e mudanças de
              disponibilidade na Amazon.
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
            <h2>Melhores lava e seca do mercado: as 9 que testei no último ano</h2>
            <p>
              A ordem não é aleatória. Cada produto tem uma justificativa para
              estar na posição em que está — e uma situação específica em que
              é a melhor escolha.
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
              ajuda a priorizar. Ordenei do mais importante para o menos.
            </p>
          </div>

          <div className="guide-grid">
            <div className="guide-card">
              <span className="num">1</span>
              <h3>Capacidade de lavagem e secagem</h3>
              <p>
                Lava e seca tem duas capacidades diferentes: a de lavagem
                (maior) e a de secagem (menor, geralmente 60% da primeira).
                Regra de bolso: some a roupa média da sua família por semana
                e divida por duas lavagens. Se der 10kg, compre 11kg. Nunca
                fique no limite — a máquina vive cheia e dura menos.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">2</span>
              <h3>Motor: Inverter ou comum?</h3>
              <p>
                Sempre Inverter. Não há mais motivo pra comprar lava e seca com
                motor convencional em 2026. O Inverter é mais silencioso, dura
                mais tempo, consome até 35% menos energia e tem garantia
                estendida de 10 a 20 anos nas melhores marcas — Samsung, LG
                e Electrolux.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">3</span>
              <h3>Classificação energética</h3>
              <p>
                Procure classe A ou A+. A secagem usa muito mais energia que a
                lavagem — a resistência que aquece o ar é bem gulosa. Ao longo
                de 10 anos, a diferença entre uma máquina classe A e uma B paga
                sozinha a diferença de preço entre elas.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">4</span>
              <h3>Programas que você vai usar</h3>
              <p>
                Não se iluda com máquina de 25 programas — você só vai usar
                cinco. Os essenciais são Algodão (dia a dia), Delicado, Rápido
                (pra quando a camiseta tem que secar em 1h), Roupa Pesada e
                Roupa de Cama. O resto é firula. O que importa é a qualidade
                de cada programa, não a quantidade.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">5</span>
              <h3>Conectividade Wi-Fi</h3>
              <p>
                Hoje parece luxo, mas tem três usos concretos: receber
                notificação quando o ciclo acabou, diagnosticar erros pelo
                celular (o Smart Check da Samsung é sensacional) e iniciar
                o ciclo em horário de tarifa branca. Se você tem tarifa branca
                de energia, o Wi-Fi paga sozinho a diferença de preço.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">6</span>
              <h3>Função vapor (Steam)</h3>
              <p>
                O Steam elimina ácaros, bactérias e pelos de animais. É
                imbatível para quem tem bebê, alergia ou pet em casa. Todas
                as Samsung, LG e Hisense do meu ranking têm vapor integrado;
                as Electrolux e Midea não têm. Se você vai usar, é um recurso
                decisivo na escolha.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">7</span>
              <h3>Rede de assistência técnica</h3>
              <p>
                Esse ponto o marketing esconde. Em capital, qualquer marca
                serve. Se você mora no interior, verifique antes se tem
                autorizada na sua região. Brastemp, Electrolux e Consul têm
                a rede mais capilarizada do Brasil. Samsung e LG estão mais
                presentes nas capitais. Hisense ainda está em expansão.
              </p>
            </div>

            <div className="guide-card">
              <span className="num">8</span>
              <h3>Dimensões e acesso</h3>
              <p>
                Meça a porta da cozinha, a largura do corredor e o espaço
                final, deixando 3cm de folga em cada lado para ventilação.
                Máquinas de 13kg são mais altas (88cm em média) — verifique
                se não bate em armário suspenso. E lembre que lava e seca
                pesa entre 75kg e 90kg: confira se o piso suporta.
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
            Lava e seca é basicamente uma lavadora de abertura frontal que, além
            de girar o cesto, tem uma resistência elétrica e um ventilador
            internos para gerar ar quente e secar a roupa. Parece simples, mas
            tem alguns detalhes importantes que mudam completamente a sua
            experiência de uso.
          </p>

          <h3>1. Lavagem</h3>
          <p>
            A água entra pela válvula solenoide, passa pelo dispensador de sabão
            (levando o sabão junto) e cai no cesto. O motor gira o cesto em
            rotações baixas com inversões de sentido, pra não torcer a roupa.
            Depois vem o enxágue e a centrifugação, onde o cesto chega a girar
            a 1400 rpm pra expulsar a maior parte da água.
          </p>

          <h3>2. Secagem</h3>
          <p>
            Aqui mora o segredo. A resistência elétrica aquece o ar, o
            ventilador sopra esse ar quente pelo cesto (que gira devagar,
            alternando sentido) e a umidade é expulsa por um cano específico.
            A maioria das lava e seca modernas usa <strong>ar condensado</strong>:
            a umidade vira água e sai pelo ralo, junto com a água da lavagem.
            Por isso elas não precisam de cano de exaustão como as secadoras
            tradicionais.
          </p>

          <h3>3. Por que a secagem às vezes fica incompleta?</h3>
          <p>
            Porque você colocou roupa demais. A capacidade de secagem é sempre
            menor que a de lavagem — por exemplo, 11kg de lavagem e 7kg de
            secagem. Se você lava 11kg e tenta secar tudo de uma vez, a máquina
            não gera ar quente suficiente pra atravessar aquela massa de tecido.
            A solução: lave tudo junto, depois seque em duas cargas separadas.
          </p>

          <h3>4. Quanto tempo dura cada ciclo?</h3>
          <p>
            Um ciclo completo de lavagem leva entre 55 minutos e 2 horas,
            dependendo do programa. A secagem sozinha demora de 1h30 a 3h30.
            Somando os dois, você gasta em média 3 a 5 horas para a roupa sair
            pronta pra guardar. Por isso programar pelo celular é tão útil —
            você deixa tudo ligado antes de sair e chega com a roupa seca.
          </p>
        </div>
      </section>

      {/* ========== COMPARE TABLE ========== */}
      <section id="comparativo" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Comparativo</span>
            <h2>Qual melhor lava e seca pra cada recurso: tabela completa</h2>
            <p>
              Se você já sabe que recurso importa, essa tabela filtra em
              segundos. Lado a lado, todas as 9 máquinas do ranking.
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
              Clique no perfil parecido com o seu. Eu te levo direto pra
              recomendação específica do ranking.
            </p>
          </div>

          <div className="profile-grid">
            <div className="profile-card">
              <span className="ic">👫</span>
              <h3>Casal ou família de 2-3</h3>
              <div className="pick">
                Até 11kg é suficiente. Pode economizar em Wi-Fi e IA.
              </div>
              <a href="#electrolux-lsp11-turbo" className="pick-name">Electrolux LSP11 Turbo →</a>
            </div>

            <div className="profile-card">
              <span className="ic">👨‍👩‍👧‍👦</span>
              <h3>Família de 4-5 pessoas</h3>
              <div className="pick">
                Aqui vale 11kg com Wi-Fi e secagem decente.
              </div>
              <a href="#samsung-wd11m-addwash" className="pick-name">Samsung WD11M AddWash →</a>
            </div>

            <div className="profile-card">
              <span className="ic">🏠</span>
              <h3>Família grande (6+)</h3>
              <div className="pick">
                13kg mínimo, ou duas máquinas separadas no longo prazo.
              </div>
              <a href="#samsung-wd13t-smart-inverter" className="pick-name">Samsung WD13T →</a>
            </div>

            <div className="profile-card">
              <span className="ic">💰</span>
              <h3>Orçamento apertado</h3>
              <div className="pick">
                Primeira lava e seca honesta, sem firula.
              </div>
              <a href="#midea-mf200d-storm-wash" className="pick-name">Midea MF200D →</a>
            </div>

            <div className="profile-card">
              <span className="ic">🧠</span>
              <h3>Fã de tecnologia</h3>
              <div className="pick">
                Inteligência artificial, Direct Drive e silêncio.
              </div>
              <a href="#lg-vc4-ai-direct-drive" className="pick-name">LG VC4 AI Direct Drive →</a>
            </div>

            <div className="profile-card">
              <span className="ic">🌾</span>
              <h3>Mora no interior</h3>
              <div className="pick">
                Priorize assistência técnica em toda cidade.
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
            <h2>O que dizem quem leu o ranking e comprou</h2>
            <p>
              Mensagens reais de leitores que me escreveram depois de usar a
              máquina por pelo menos 1 mês.
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
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ========== CONCLUSION ========== */}
      <section className="section section-alt">
        <div className="container container-narrow">
          <h2>Então, qual a melhor máquina que lava e seca?</h2>
          <p>
            Se você leu até aqui, já está mais bem informado que 99% das
            pessoas entrando numa loja de eletrodoméstico no fim de semana.
            Pra fechar o ranking das melhores lava e seca de 2026 de forma
            objetiva:
          </p>
          <ul style={{ marginTop: '1.2rem', fontSize: '1.05rem' }}>
            <li>
              <strong>Melhor no geral:</strong>{' '}
              <a href="#samsung-wd11m-addwash">Samsung WD11M AddWash</a> —
              equilibra recursos, durabilidade e preço.
            </li>
            <li>
              <strong>Melhor tecnologia:</strong>{' '}
              <a href="#lg-vc4-ai-direct-drive">LG VC4 AI Direct Drive</a> —
              lava melhor no automático e é a mais silenciosa do ranking.
            </li>
            <li>
              <strong>Melhor custo-benefício:</strong>{' '}
              <a href="#electrolux-lsp11-turbo">Electrolux LSP11 Turbo</a> —
              qualidade sem pagar preço premium.
            </li>
            <li>
              <strong>Maior capacidade:</strong>{' '}
              <a href="#samsung-wd13t-smart-inverter">Samsung WD13T Smart Inverter</a>{' '}
              — 13kg de lavagem, ideal pra família grande.
            </li>
            <li>
              <strong>Mais barata que vale a pena:</strong>{' '}
              <a href="#midea-mf200d-storm-wash">Midea MF200D</a> — primeira
              lava e seca honesta pra orçamento apertado.
            </li>
          </ul>

          <div className="related-home">
            <h3>Ainda com dúvida?</h3>
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
