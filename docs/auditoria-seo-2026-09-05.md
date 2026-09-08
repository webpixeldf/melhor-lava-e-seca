# Auditoria de SEO — Melhor Lava e Seca

Data: 05/09/2026. Domínio: https://melhorlavaeseca.com/.

**Diagnóstico:** a estrutura permite rastrear o site, mas a confiabilidade editorial, a consistência do catálogo e alguns erros de navegação prejudicam a qualidade das páginas. Corrigir esses pontos merece prioridade sobre publicar mais artigos ou aumentar a repetição de palavras-chave.

Esta auditoria não encontrou evidência de bloqueio geral de indexação. Também não comprova penalização, perda de posições ou tráfego: essas conclusões exigem dados do Google Search Console.

## Escopo e método

- Inspeção dos templates, componentes, catálogo, metadados, sitemap, robots.txt, regras de hospedagem, scripts editoriais e fluxo de publicação.
- Varredura automatizada de 119 páginas locais de conteúdo e duas representações da página de erro.
- Rastreamento das **120 URLs do sitemap publicado: 113 artigos e 7 páginas principais/institucionais**. Todas responderam HTTP 200. O site publicado tinha um artigo a mais que a cópia local: `/blog/como-instalar-lava-e-seca-em-apartamento/`.
- Verificação de títulos, descrições, canonical, H1, imagens, links internos, âncoras e JSON-LD de todo esse universo.
- Inspeção do conteúdo de todos os artigos por extração e análise automatizada; leitura editorial aprofundada de páginas e trechos selecionados. Não se trata de certificação factual de todas as afirmações dos 113 artigos.
- Navegador real de teste em 390 e 1440 pixels, na home, índice do blog, artigo de erro OE e artigo de modelos cinza; teste do menu móvel e inspeção adicional da tabela cortada.
- Conferência de orientações com documentação do Google e exemplos técnicos com fontes dos fabricantes.
- Consultas extras de redirecionamentos, recursos, domínio com www e páginas de erro.

A publicação automática continuou durante a coleta. O relatório é um retrato da janela da auditoria, e não uma afirmação de que o site ficará com a mesma contagem. Nenhum arquivo de produção foi alterado; apenas os artefatos desta auditoria foram criados.

## Resultados gerais

| Verificação | Resultado |
|---|---|
| URLs no sitemap publicado | 120 |
| Artigos publicados | 113 |
| Respostas das URLs do sitemap | 120 × HTTP 200 |
| Título, descrição, canonical e H1 | Presentes nas páginas de conteúdo analisadas |
| Títulos e descrições exatamente duplicados | Não encontrados entre as páginas de conteúdo |
| H1 por página de conteúdo | 1 |
| Profundidade pelo índice do blog | Artigos acessíveis em 2 cliques a partir da home |
| Links internos para páginas ausentes | Nenhum encontrado no universo analisado |
| Âncoras quebradas no HTML local | Nenhuma encontrada |
| Artigos sem links externos no corpo | 113 de 113 |
| Artigos sem link recebido do corpo de outro artigo, incluindo listas de relacionados | 32 no publicado; 31 na cópia local |
| Imagem inexistente confirmada em produção | `/images/blog/default-cover.jpg`, usada no índice e no artigo de modelos cinza |
| Títulos acima de 60 caracteres | 1; comprimento é triagem, não regra de ranking |
| Artigos locais com tabela | 30 respostas de artigos inspecionadas contêm tabela |
| Capas do índice | Direcionam à home, não ao artigo |
| Google PageSpeed Insights | API recusou mobile e desktop com HTTP 429 por quota |

Os 32 artigos com pouca ligação contextual **não são órfãos do site**: estão no índice do blog. O problema é a ausência de recomendações a partir dos demais artigos.

## Prioridades

P1 = corrigir primeiro, por conteúdo enganoso, informação técnica incorreta ou forte quebra de confiança. P2 = correção técnica/arquitetural importante. P3 = aperfeiçoamento ou investigação dependente de dados adicionais. Não foi identificado um P0 de indisponibilidade geral ou bloqueio total.

| ID | Prioridade | Achado | Alcance |
|---|---|---|---|
| 01 | P1 | Promessa de 9 modelos testados contradiz 10 produtos e avaliação de produto não testado | Home e chamadas globais |
| 02 | P1 | Prova social usa contagens que o próprio código identifica como estimadas | Home |
| 03 | P1 | Tabela atribui recursos pela marca e contradiz os produtos | Home e catálogo usado pelo gerador |
| 04 | P1 | Artigo de erro OE Samsung apresenta definição incorreta/generalizada | Artigo e cluster de reparos |
| 05 | P1 | Ranking até R$ 2.500 não comprova enquadramento dos produtos no orçamento | Artigo comercial |
| 06 | P1 | Pauta sobre “prensado” resulta em conteúdo incoerente | Artigo específico |
| 07 | P1 | Publicação automatizada sem verificação factual comprovável | Pipeline e acervo |
| 08 | P2 | Capas levam ao destino errado | Índice e artigos |
| 09 | P2 | Tabelas de artigos são cortadas no celular | Confirmado em modelos cinza; padrão compartilhado |
| 10 | P2 | Fallback de capa inexistente afeta imagem, OG e Article | Modelos cinza e índice |
| 11 | P2 | Imagem inválida e identificadores inadequados no schema Product | Home |
| 12 | P2 | Redirecionamentos em massa de artigos e imagens para a home | 93 artigos antigos e suas imagens |
| 13 | P2 | Página de erro acessível com HTTP 200 e robots conflitantes | `/404` e `/404/` |
| 14 | P2 | Canibalização potencial entre pautas de mesma intenção | Vários clusters |
| 15 | P2 | Arquitetura concentra links na home e depende de um índice extenso | Blog |
| 16 | P2 | Autoria e alegações de experiência têm comprovação insuficiente nas páginas | Sobre, home e artigos |
| 17 | P2 | Política de privacidade diverge da implementação observada | Privacidade e layout |
| 18 | P3 | Datas visíveis e datas estruturadas comunicam coisas diferentes | Home, artigos e sitemap |
| 19 | P3 | Falta de redirecionamento de www para o domínio preferido | Domínio |
| 20 | P3 | Imagens sem variantes responsivas e cache diferente do pretendido | Templates e hospedagem |
| 21 | P3 | Expectativa inadequada de rich results na home | Product e FAQ |
| 22 | P3 | Descrições pouco informativas, títulos mecânicos e hierarquia H1→H3 | Parte do blog |
| 23 | P3 | Medição de SEO e conversões incompleta na implementação visível | Layout e acompanhamento |

## Evidências e correções recomendadas

### 01 — O ranking se contradiz sobre quantidade e testes

**Evidência:** a metadata da home promete “9 Modelos Testados”; os títulos e chamadas repetem nove. O navegador encontrou **10 cards**, e o `ItemList.numberOfItems` é 10. A Brastemp BNO14AS afirma “Ainda nao testamos esta unidade”, mas recebe nota 4,4 e notas específicas de desempenho, economia e silêncio. A abertura afirma que cada modelo foi testado por semanas.

**Impacto:** confiança no ranking e no método editorial. É uma contradição verificável, independentemente de qualquer análise de algoritmo.

**Correção:** gerar a contagem a partir do catálogo; separar avaliação por uso, inspeção e análise documental; remover notas de testes que não foram feitos ou explicar um método documental verificável, sem apresentar medições de uso. Harmonizar `/sobre/`, cards, título e chamadas nos artigos.

**Arquivos:** `src/app/layout.js:24`, `src/app/page.js:33`, `src/content/products.js:453`, `src/app/blog/[slug]/page.js:104`.

### 02 — A contagem de avaliações ainda aparece como prova social

**Evidência:** o banner exibe **16.767 avaliações de clientes analisadas** por meio de `totalReviews()`. Os comentários do projeto explicam que `reviewsCount` é estimado e que por isso foi removido do `aggregateRating`. A soma continua aparecendo para os leitores. Há ainda alegações de 23 modelos testados e 380 horas de uso, sem registros de teste vinculados às páginas.

**Correção:** remover a contagem estimada ou substituí-la por contagem documentada, com fonte e data. Para as demais alegações, publicar evidências caso existam; caso contrário, ajustar a redação. Os depoimentos também precisam de origem e autorização verificáveis, sem presumir que sejam falsos somente por estarem em um arquivo.

**Arquivos:** `src/app/page.js:85`, `src/content/products.js:513`, `src/content/testimonials.js`.

### 03 — A comparação técnica é construída com regras inadequadas

**Evidência:** `src/app/page.js:429` marca Wi-Fi para toda Samsung, LG e Hisense; o vapor é marcado para marcas inteiras. A Brastemp BNO14AS declara vapor na ficha, mas aparece sem vapor na tabela. A seção do guia diz que Midea não tem vapor, enquanto a tabela sinaliza que tem. O nome da Samsung WD13FG convive com texto e slug de WD13T. A LG tem capacidades 14/8 no cadastro, mas mantém descrição de 11/7 em `features` e comentário de secagem de 7 kg.

**Impacto:** uma única inconsistência do catálogo se espalha para ranking, schema e artigos gerados. A decisão de compra pode ser baseada em um recurso que o SKU não oferece.

**Correção:** cadastrar Wi-Fi, vapor, motor, modelo completo, capacidades, tensão e fontes por SKU; gerar tabela e textos a partir desses campos. Fazer conferência manual dos dez ASINs e dos links de compra com fichas oficiais. Não transferir características entre variantes porque compartilham o prefixo WD11M, por exemplo.

A família WD11M tem variantes; a pesquisa encontrou modelos oficiais de 11/6 e 11/7 kg. Isso reforça a necessidade de identificar o código completo e impede declarar errada uma capacidade só pelo prefixo. Consulte o [suporte oficial do WD11M4473PW](https://www.samsung.com/br/support/model/WD11M4473PW/AZ/).

### 04 — O diagnóstico de OE Samsung precisa ser refeito

**Página:** `/blog/erro-oe-lava-e-seca-samsung/`.

**Evidência:** o artigo define OE como falha de drenagem e organiza todo o diagnóstico com essa premissa. A documentação da Samsung identifica **OC/OE/OF como erro de transbordamento/excesso de água**. Problemas de drenagem podem se relacionar ao sintoma, mas não tornam as definições equivalentes. A definição e o procedimento precisam ser específicos ao modelo. [Códigos de erro da Samsung](https://www.samsung.com/uk/support/home-appliances/what-do-the-codes-on-my-washing-machine-mean/).

**Correção:** reescrever a resposta inicial e o diagnóstico com referência ao manual correto; separar OE Samsung de OE LG; revisar os demais artigos de códigos e combinações de botões, especialmente calibração, reset e destravamento. Definir quando interromper a tentativa doméstica e procurar assistência, conforme o fabricante.

**Arquivo:** `src/content/blog/erro-oe-lava-e-seca-samsung.md:18`.

### 05 — O ranking até R$ 2.500 não entrega comprovação da promessa

**Página:** `/blog/melhor-lava-e-seca-de-ate-r-2-500/`.

**Evidência:** apresenta modelos como opções dentro da faixa e diz ter cruzado mais de uma dezena de produtos. Não mostra ofertas, vendedor, data ou condições. O próprio catálogo local tem valores de referência de R$ 4.599, R$ 5.999 e R$ 7.999 para os três primeiros modelos. Esses valores locais não são usados aqui como preço atual; mostram que nem a fonte interna sustenta o teto declarado.

**Correção:** só recomendar dentro do teto quando houver oferta verificada com data e condições. Se não houver opções adequadas, responder isso diretamente e distinguir máquina nova, usada, lavadora sem secagem e orçamento necessário. Não usar o mesmo ranking geral para qualquer orçamento.

### 06 — A pauta sobre “prensado” falhou semanticamente

**Página:** `/blog/como-lavar-o-prensado-e-secar-rapido/`.

**Evidência:** começa com um “tijolo escuro”, cheiro forte e tentativa de ocultar rastros; depois passa a instruções de roupa, edredom, dispenser e painel da lava e seca. Não identifica de forma coerente o objeto da instrução nem a relação com a proposta do site.

**Correção:** retirar essa pauta do fluxo automático para revisão editorial. Se não houver conteúdo pertinente a recuperar, excluir a URL com 404/410; se houver substituto equivalente, usar 301 para ele. Não redirecionar automaticamente para a home. Examinar também pautas ambíguas como “lava seca e dobra” e “mini lava e seca”, sem presumir erro antes da revisão.

### 07 — O controle de qualidade mede forma, mas não comprova fatos

**Evidência:** o fluxo publica e reescreve artigos automaticamente, valida o build e envia alterações. O validador mede palavras, densidade da palavra-chave, quantidade de links, cabeçalhos, clichês e comprimento de parágrafos. Isso é útil para problemas formais, mas não valida a definição de OE, o preço ou a existência de recursos do modelo. O prompt proíbe inventar links e a renderização acrescenta links internos; **nenhum dos 113 artigos tem links externos no corpo**.

**Correção:** exigir fontes e campos técnicos por pauta antes da redação; conferir se o texto sustenta a promessa do título; adicionar revisão humana para compra, falhas técnicas e instalação. O build deve continuar, acompanhado de verificações de conteúdo e ativos. Densidade de palavra-chave e uma cota fixa de links não devem decidir sozinhas se um artigo é bom.

IA não constitui infração por si. O risco está em publicar volume com pouco valor e informações incorretas; não há evidência aqui de ação manual. [Políticas de spam do Google](https://developers.google.com/search/docs/essentials/spam-policies), [conteúdo útil e confiável](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

**Arquivos:** `.github/workflows/blog-daily.yml`, `scripts/blog-from-cronograma.mjs:504`, `scripts/lib/interlink.mjs`.

### 08 — Clicar na capa não abre o artigo

**Evidência:** a capa de cada card do blog usa `href="/"`; o título do mesmo card abre o artigo. A imagem principal dos artigos também aponta à home e recebe texto alternativo montado com palavras-chave. Confirmado no navegador.

**Correção:** no índice, fazer imagem e título abrirem o mesmo artigo. No artigo, remover o link da imagem quando não houver função útil ou permitir ampliação. Usar descrição visual no `alt`, sem adicionar uma palavra-chave aleatória como “lava e seca barata”.

**Arquivos:** `src/app/blog/page.js:74`, `src/app/blog/[slug]/page.js:82`, `src/lib/keywords.js`.

### 09 — Parte da tabela desaparece no celular

**Evidência:** no artigo de modelos cinza, a tabela mede **472 px** em uma área de texto de **350 px**. Os ancestrais não oferecem rolagem horizontal, enquanto `body` e `html` escondem overflow. A última coluna fica cortada. A largura total da página parecer correta não detecta esse defeito.

**Correção:** envolver as tabelas do Markdown em contêiner com `overflow-x:auto`, ou oferecer uma apresentação por produto no celular. Testar as 30 páginas com tabela. A tabela da home já tem contêiner de rolagem; não é o mesmo defeito.

**Evidência visual:** `tabela-cinza-mobile.png`. **Arquivos:** `src/lib/blog.js`, `src/app/globals.css:78`, `src/app/globals.css:1662`.

### 10 — A imagem padrão não existe

**Evidência:** `/images/blog/default-cover.jpg` retorna HTTP 404 e aparece quebrada no artigo de modelos cinza. O fallback também vai para o índice, Open Graph e schema Article. O novo artigo de instalação tem imagem publicada válida, embora não exista na cópia local — não foi contabilizada como imagem quebrada.

**Correção:** fornecer um ativo real, unificar o fallback entre JPG/WebP e validar existência no build. Preferir capa pertinente e conferir a descrição do artigo cinza, que termina abruptamente em “não existe.”.

**Arquivos:** `src/lib/blog.js:48`, `src/app/blog/page.js`, `src/content/blog/melhor-maquina-lava-e-seca-cinza.md`.

### 11 — O JSON-LD contém imagem inválida e confunde identificadores

**Evidência:** o décimo produto tem `image:null`. `ProductSchema` e `ItemListSchema` concatenam esse valor e publicam **`https://melhorlavaeseca.comnull`**. Além disso, todos os `mpn` recebem o ASIN, que identifica o catálogo Amazon e não é automaticamente o código de peça/modelo do fabricante.

**Correção:** não emitir URL de imagem sem ativo válido; preencher código de fabricante em campo próprio, quando conhecido; não inventar GTIN/MPN. Validar URLs de imagem, correspondência entre produto e conteúdo e o JSON-LD renderizado. Adicionar `author.url` nos artigos para um perfil real ajuda a identificar o autor. [Orientação de autoria do Google](https://developers.google.com/search/docs/appearance/structured-data/article).

**Arquivo:** `src/components/Schema.js:68`.

### 12 — 93 artigos antigos e 93 imagens redirecionam à home

**Evidência:** há **279 regras**: duas formas de URL para cada um dos 93 artigos e uma para cada imagem. A URL antiga de lavar edredom devolve 301 para `/`. A confirmação de execução em produção foi por amostra; o alcance completo vem da configuração.

**Impacto:** o destino pode não satisfazer a intenção original. Redirecionar uma imagem para uma página HTML também não substitui o recurso visual esperado. O Google alerta que redirecionar muitas URLs para uma home irrelevante pode ser interpretado como soft 404. [Orientação sobre mudanças de URL](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

**Correção:** mapear cada artigo com tráfego/backlinks para um substituto equivalente. Usar 404/410 quando não houver substituto; para imagens, redirecionar somente para imagem equivalente. Conferir os links internos após a mudança.

**Arquivo:** `public/_redirects`.

### 13 — A página de erro responde 200 e tem robots conflitantes

**Evidência:** `/404` e `/404/` devolvem HTTP 200 com conteúdo de erro. O HTML tem tanto `noindex` quanto `index, follow`. A URL inexistente aleatória, por outro lado, devolveu corretamente HTTP 404.

**Correção:** configurar o comportamento da rota explícita de erro e evitar indexação por metadata herdada. Manter 404 real para páginas ausentes e emitir diretivas consistentes. O Google aplica a instrução mais restritiva quando há conflito; portanto, **não é correto afirmar que a página de erro está indexável só porque também contém “index”**. [Regras de robots do Google](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

**Arquivos:** `src/app/not-found.js`, `src/lib/seo.js`. **Evidência:** `http-checks.json`.

### 14 — Há pautas que provavelmente disputam a mesma intenção

São candidatos à revisão; sem consultas e posições do Search Console, não se pode afirmar canibalização efetiva ou escolher automaticamente a URL vencedora.

| Grupo | URLs/temas que devem ser comparados | Decisão sugerida |
|---|---|---|
| Uso Midea | `como-usar-a-lava-e-seca-midea` / `lava-e-seca-midea-como-usar` | Consolidar se ensinarem o mesmo procedimento; separar só por modelos com diferenças reais |
| Calibração Samsung | `como-calibrar-a-lava-e-seca-samsung` / `como-calibrar-lava-e-seca-samsung-ecobubble` / `como-calibrar-lava-e-seca-samsung-wd11t` | Guia geral com instruções por modelo; manter específicas se realmente distintas |
| Hisense 11 kg | `hisense-lava-e-seca-11kg` / `lava-e-seca-hisense-11-kg` | Comparar SKU, intenção e dados de busca |
| Equipamentos separados | `lava-e-seca-separadas` / `lava-e-seca-separada-e-melhor` | Um comparativo principal e conteúdo complementar somente se necessário |
| Midea slim branca | `lava-e-seca-11kg-branca-slim-healthguard-conectada-midea` / `lava-e-seca-11kg-branca-slim-conectada-midea-branco` | Identificar código completo antes de consolidar |
| Samsung por marca | `melhor-lava-e-seca-samsung` / `melhor-lava-e-seca-samsung-11kg-e-13kg` / `melhor-lava-e-seca-eco-bubble` | Diferenciar marca, capacidade e tecnologia sem repetir ranking genérico |
| Modelos similares | Artigos com apenas cor/capacidade alteradas | Exigir seleção e comparação próprias da restrição |

A análise não encontrou títulos/descrições literalmente duplicados nas páginas de conteúdo. Semelhança de intenção e duplicação literal são problemas diferentes.

### 15 — O blog depende demais da listagem e da home

**Evidência:** todos os 113 artigos ficam em uma única listagem; categorias aparecem como etiquetas, sem páginas de navegação correspondentes. Há 32 artigos sem links recebidos do corpo de outros artigos, incluindo os blocos de relacionados. A navegação geral permite chegar a todos em dois cliques, portanto não há falha de descoberta universal.

**Correção:** organizar hubs de compra, marcas, instalação, manutenção e códigos de erro. Conectar tutoriais aos reviews corretos, sem enviar toda consulta para o mesmo ranking. Adicionar paginação com URLs rastreáveis e categorias úteis à medida que o acervo cresce; o objetivo é facilitar escolha e manutenção, não reduzir links por uma suposta cota do Google.

### 16 — Autoria e experiência precisam de identificação verificável

**Evidência:** artigos assinados por Marcelo França, mas sem perfil vinculado; `/sobre/` menciona dois jornalistas formados em engenharia sem identificá-los. A mesma página promete revisão humana e experiência presencial, enquanto há publicação e reescrita automatizadas. Isso pede explicação do processo real, não permite concluir que todas as alegações são falsas.

**Correção:** perfil de autor com experiência comprovável, responsáveis pela revisão, política editorial, fontes, registro dos testes e fotos próprias quando disponíveis. Distinguir teste físico de pesquisa documental e entrevista. Informar de modo fiel como a automação participa da produção.

**Arquivos:** `src/app/sobre/page.js`, `src/app/blog/[slug]/page.js`, `src/components/Schema.js`.

### 17 — A política de privacidade não descreve o que foi observado

**Evidência:** diz que cookies analíticos só são ativados após aceitar um banner. Não foi encontrado componente de banner no código inspecionado, nem na navegação testada. O layout inclui uma tag `AW-...` do Google Ads e conversões de cliques; não foi encontrada configuração explícita de GA4 `G-...`.

**Correção:** alinhar texto, ferramentas utilizadas e comportamento efetivo do site; verificar o vínculo remoto da tag no painel antes de afirmar que GA4 está ausente em definitivo. Validar preferências e consentimento conforme a política adotada. Este é um achado de consistência e transparência, não uma conclusão jurídica de infração.

**Arquivos:** `src/app/privacidade/page.js:47`, `src/app/layout.js:64`.

### 18 — Separar atualização técnica de revisão factual

**Evidência:** a home anuncia atualização em abril e revisão semanal; o sitemap marca as páginas estáticas com o horário de cada build. Artigos mostram apenas a data de publicação, embora o schema exponha a atualização. Na coleta, 108 artigos compartilhavam o horário 05/09 às 09:12:11. O histórico mostra que isso veio de redistribuição de links, não prova falsificação da data.

**Correção:** usar a última alteração relevante nas páginas estáticas; exibir data da revisão editorial quando houver checagem de fatos; distinguir no processo revisão factual e mudança de links. Não apagar automaticamente datas em lote: o Google reconhece que alterações relevantes em links também podem justificar `lastmod`. [Documentação do sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

**Arquivos:** `src/app/sitemap.js:6`, `src/app/page.js:33`, `src/app/blog/[slug]/page.js:67`.

### 19 — Consolidar o domínio com e sem www

**Evidência:** HTTP redireciona corretamente para HTTPS. Porém, `https://www.melhorlavaeseca.com/` responde 200 sem redirecionamento. O canonical aponta corretamente para a versão sem www, mitigando a duplicidade.

**Correção:** adotar 301/308 de www para o domínio preferido preservando caminho e consulta. Verificar também os subcaminhos após a regra. Não é um bloqueio de ranking nem evidência de penalização.

### 20 — Desempenho: melhorias concretas e limites da medição

**Observado:** imagens têm dimensões e a maioria dos ativos editoriais usa WebP. Não foi encontrado `srcset` nas páginas inspecionadas; o export estático usa imagens sem otimização automática. O índice carrega capas de 1200 px para cards menores. O HTML da home tem cerca de 342 kB sem compressão, mas foi transferido no navegador com cerca de **42 kB comprimidos**; o índice teve cerca de **24 kB comprimidos**. Não se deve chamar esse HTML de problema grave só pelo tamanho descomprimido.

Na sessão de navegador, os scripts próprios somaram aproximadamente 103 KiB comprimidos por página. As medições de recursos não incluem necessariamente bytes de terceiros sem permissão de timing, e páginas posteriores reutilizaram cache. Os tempos coletados não representam celular real, CrUX ou nota Lighthouse.

O HTML publicado respondeu `cf-cache-status:DYNAMIC`. Imagens e chunks responderam HIT, mas com `max-age=14400`, diferente dos sete dias/um ano descritos em `_headers`. Isso mostra divergência entre intenção e resposta efetiva, não prova que o cache seja o principal gargalo. Investigar regras da Cloudflare e sobreposição de cabeçalhos antes de alterar.

**Correção:** gerar tamanhos responsivos no build; oferecer miniaturas no índice; manter imagem principal sem lazy load quando for candidata a LCP; priorizar a imagem certa, não todas; conferir cache de assets com hash; avaliar carregamento e prefetch após medição. Manter o modelo de export estático se atender ao projeto.

A API PageSpeed retornou 429 em mobile e desktop. Não foi possível confirmar LCP, INP e CLS de campo. Solicitar/verificar o relatório de Core Web Vitals no Search Console e medir laboratório em execução autorizada com quota disponível.

### 21 — Schema deve acompanhar o tipo de página

**Evidência:** a home tem ItemList, FAQ e dez Product/Review. O Google restringe product snippets a páginas focadas em um produto ou suas variantes; uma listagem de modelos diferentes não deve ser tratada como garantia de estrelas. Os artigos individuais usam Article, sem Review específico.

**Correção:** priorizar review individual substancial e verificável para cada modelo importante; adicionar Product/Review e prós/contras quando elegíveis e coerentes com conteúdo visível. Não duplicar páginas só para adicionar schema. FAQ pode continuar como conteúdo útil; para este site não deve ser vendido como promessa de rich result. [Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [limitações de FAQ](https://developers.google.com/search/blog/2023/08/howto-faq-changes).

Foi positivo retirar ofertas e avaliações agregadas sem comprovação. A ausência desses campos não precisa ser “corrigida” com dados inventados.

### 22 — Melhorar snippets e cabeçalhos com foco na pergunta real

**Evidência:** a descrição de modelos cinza termina em uma frase incompleta. A de uso do app Midea diz apenas que instalar o aplicativo é o começo. O título de Midea Master Clean embute um código extenso e pouco legível. O índice pula de H1 para H3. O acervo repete “Guia Completo 2026”, “Por que isso acontece” e estruturas de tutorial em temas comerciais.

**Correção:** responder a intenção com precisão no título, descrição e primeiros parágrafos; retirar ano quando não acrescenta informação; usar subtítulos específicos. No índice, promover títulos dos cards a H2 ou introduzir seções H2. Descrições curtas em contato/termos não são erro automático; revisar se cumprem sua função. Comprimento e quantidade de palavras não garantem ranking.

### 23 — Medir para escolher o próximo investimento

**Evidência:** a implementação visível registra conversão de clique em link patrocinado no Google Ads com valor fixo. Não foi encontrado GA4 explícito no código. Não houve acesso a Search Console, Analytics ou painéis de afiliados. Meta de verificação do Google vazia não comprova falta de verificação: ela pode ser por DNS.

**Correção:** confirmar Search Console de domínio, envio do sitemap, páginas excluídas e canonical escolhido pelo Google. Separar cliques afiliados de vendas e receita real. Registrar página/modelo/loja no evento e acompanhar sessões orgânicas, CTR, consultas e conversão. Validar configuração remota antes de adicionar tags que possam duplicar eventos.

## Plano de ação

### Primeira etapa — precisão e confiança

1. Revisar catálogo dos dez produtos por SKU e fonte oficial; corrigir a tabela por modelo.
2. Corrigir quantidade, alegações de testes, notas não fundamentadas e contagens estimadas.
3. Reescrever OE Samsung, revisar o ranking de R$ 2.500 e resolver a pauta incoerente sobre prensado.
4. Inserir revisão factual no fluxo antes de continuar ampliando o acervo com o mesmo método.

### Segunda etapa — correções técnicas simples

1. Ajustar destinos das capas e fallback de imagem.
2. Corrigir tabela móvel e testar os artigos com tabelas.
3. Remover a URL de imagem inválida do schema e corrigir MPN.
4. Alinhar o comportamento de `/404`, robots e redirecionamento de www.
5. Revisar os redirecionamentos antigos por equivalência de assunto, incluindo imagens.

### Terceira etapa — reorganização editorial e crescimento

1. Usar dados do Search Console para decidir consolidações e prioridades.
2. Criar hubs temáticos e reforçar links para os 32 artigos com baixa ligação contextual.
3. Publicar perfil de autor, revisão editorial e evidências de testes.
4. Revisar comparativos por restrição real: preço, modelo, dimensões, consumo e capacidade de secagem.
5. Acrescentar fontes, tabelas verificáveis e recursos próprios úteis; avaliar desempenho com dados de campo e laboratório.

## O que preservar

HTML estático com conteúdo acessível sem depender da execução do JavaScript; canonical por página; robots sem bloqueio de conteúdo; sitemap cobrindo o site publicado; títulos e descrições distintos; um H1 por página; breadcrumbs e Article presentes; dimensões nas imagens; links comerciais da home marcados como sponsored; menu móvel funcional; resposta 404 correta para URL aleatória inexistente.

## Limitações e entregáveis

Não foram auditados backlinks por índice especializado, consultas/posições reais, conversões do painel ou métricas CrUX. Não houve validação formal pelo Rich Results Test; o JSON-LD foi lido no HTML e conferido no DOM de páginas representativas. As especificações e procedimentos dos 113 artigos não foram todos confrontados individualmente com manuais. A auditoria evidencia os principais erros e o risco sistêmico para orientar essa revisão.

- `inventario-publicado-120-paginas.csv`: todas as páginas publicadas, metadados e pontos de revisão.
- `inventario-paginas.csv`: inventário da cópia local; não confundir com a contagem publicada.
- `live-crawl.json` e `http-checks.json`: respostas e cabeçalhos coletados.
- `content-analysis.json`: fontes externas, links no corpo e padrões de conteúdo.
- `browser.json` e `extra-browser.json`: inspeção do navegador.
- `tabela-cinza-mobile.png`, `blog-390.png` e demais capturas: evidências visuais.
- `mobile.json` e `desktop.json`: respostas de quota do PageSpeed, sem nota de desempenho.

O principal ganho esperado vem de corrigir informação e entregar uma resposta específica e verificável para cada intenção de busca. Não é possível quantificar aumento de tráfego sem a linha de base e acompanhamento posterior.
