# Ajustes de SEO — Melhor Lava e Seca

Concluído localmente em 8 de setembro de 2026. Este documento complementa a [auditoria original](RELATORIO-SEO.md), realizada em 5 de setembro.

## Resultado e alcance

Foram aplicadas correções de conteúdo, SEO técnico, navegação, imagens, dados estruturados, transparência editorial e controle de publicação. A versão final incorpora os oito artigos recebidos durante a sincronização com a base `3089658`.

O site exportado contém 119 artigos e 136 páginas indexáveis. Todas as páginas exportadas passaram pela verificação técnica automatizada. Foram reescritos integralmente 46 artigos prioritários, além de ajustes pontuais no restante do acervo e nos templates compartilhados. A relação está em [artigos-reescritos.json](artigos-reescritos.json). Isso não equivale a uma certificação factual de cada afirmação dos outros 73 artigos.

**Os ajustes estão no diretório local, sem commit, push ou publicação em produção.** O comportamento observado no site público na auditoria original só será alterado após a implantação. A cópia de segurança anterior à sincronização foi preservada no stash `codex-seo-ajustes-antes-sincronizacao-2026-09-07`.

## Principais correções

A página inicial passou a apresentar dez modelos com critérios documentais e capacidades de lavagem e secagem individualizadas. Foram retiradas notas, contagens de avaliações, relatos de testes e preços sem comprovação. O catálogo central reúne as referências utilizadas e alimenta também os comparativos de artigos, reduzindo divergências entre páginas. Imagens identificadas como incompatíveis com o modelo foram retiradas.

Os artigos prioritários foram ajustados à pergunta de busca. Entre os erros corrigidos estão a confusão do código OE Samsung com drenagem, o tratamento de E21 Midea como modelo de produto, a capacidade do Samsung WD13T, a apresentação da Electrolux LST12 como lava e seca, a promessa de dobrar roupas e o ranking sem comprovação de preços até R$ 2.500. Guias técnicos receberam ressalvas específicas sobre modelo e manual, removendo procedimentos universais sem base documental. O artigo incoerente sobre “prensado” foi retirado da publicação, mantendo seu arquivo de origem.

O blog ganhou paginação com 18 artigos por página, três categorias e recomendações relacionadas. Todos os 119 artigos recebem pelo menos dois links de outros artigos por meio do bloco de relacionados. As capas agora abrem os artigos, as tabelas podem ser percorridas horizontalmente no celular e o menu possui controles acessíveis.

A automação passou a gerar rascunhos. A publicação local exige aprovação editorial registrada, identificação do revisor, data válida e fontes HTTPS citadas no texto. A substituição de um artigo existente exige uma opção explícita e preserva sua data original. Essas barreiras verificam requisitos editoriais; não substituem a leitura e a conferência factual por quem aprova.

## Situação dos 23 achados originais

“Corrigido” nesta tabela significa implementado e verificado localmente, dentro do alcance indicado.

| Nº | Achado | Situação após os ajustes |
| --- | --- | --- |
| 01 | Quantidade e alegações de produtos testados | Corrigido: dez modelos, contagem derivada do catálogo e metodologia documental. |
| 02 | Prova social estimada | Corrigido: retiradas contagens e avaliações sem comprovação. |
| 03 | Recursos técnicos atribuídos pela marca | Corrigido no catálogo e comparativos integrados: dados por modelo e fontes. |
| 04 | Definição de OE Samsung | Artigo reescrito, distinguindo transbordamento e códigos de drenagem. |
| 05 | Ranking até R$ 2.500 | Reescrito como guia de verificação de ofertas; sem afirmar preços atuais não comprovados. |
| 06 | Artigo sobre “prensado” | Retirado de rotas, sitemap e links internos; origem preservada como retirada. |
| 07 | Publicação automática sem revisão | Geradores direcionados a rascunhos e publicação condicionada à aprovação. O workflow remoto depende de envio ao GitHub. |
| 08 | Destino incorreto das capas | Corrigido e testado em quatro larguras. |
| 09 | Tabelas cortadas no celular | Corrigido com rolagem horizontal, indicação visual e acesso por teclado. |
| 10 | Imagem padrão inexistente | Corrigido com arquivo existente e validação dos caminhos. |
| 11 | Imagem e identificadores no Product | Removido o Product da home; utilitário ajustado para não confundir ASIN e MPN ou produzir notas fictícias. |
| 12 | Redirecionamentos indiscriminados para a home | Removidos; preservados somente destinos equivalentes identificados. URLs sem substituto devem responder 404. |
| 13 | Página 404 com resposta 200 | Robots corrigidos e função Cloudflare preparada e testada localmente para as três rotas explícitas de erro. Falta confirmar a resposta HTTP na hospedagem após implantar. |
| 14 | Sobreposição de intenção entre artigos | Intenção de vários comparativos diferenciada. Consolidações adicionais dependem de consultas e desempenho no Search Console; permanecem em análise. |
| 15 | Arquitetura de links concentrada | Corrigido com categorias, paginação e relacionados; nenhum artigo sem link de entrada no bloco de relacionados. |
| 16 | Autoria e experiência insuficientemente comprovadas | Página de autor e metodologia editorial criadas; removidas alegações não comprovadas de testes e qualificações. |
| 17 | Privacidade divergente da implementação | Texto atualizado e carregamento do Google condicionado ao consentimento, com recusa e revogação. |
| 18 | Datas inconsistentes | Datas de publicação, atualização e revisão documental diferenciadas; sitemap sem atualização artificial a cada build. |
| 19 | Domínio com www sem consolidação | Regra preparada em `config/cloudflare-www-redirect.json`; ainda não aplicada à conta Cloudflare. |
| 20 | Imagens responsivas e cache | Variantes de 400 e 800 pixels implementadas; cabeçalhos revisados. Efeito do cache e Core Web Vitals em produção ainda precisam de medição. |
| 21 | Expectativa de rich results da home | Schema ajustado ao conteúdo: lista de itens, perguntas e navegação, sem avaliações de produto artificiais. Não há promessa de exibição especial no Google. |
| 22 | Títulos, descrições e hierarquia | Templates corrigidos, metadados revisados e títulos H2 nos cartões. Sem alertas nas regras técnicas executadas. |
| 23 | Medição incompleta | Evento de clique afiliado e suporte a GA4 implementados; ID real do GA4 não configurado. Análise de desempenho e conversões da conta permanece externa. |

## Validação final

| Verificação | Resultado |
| --- | --- |
| Compilação e exportação de produção | Concluídas com sucesso após a sincronização e as reescritas finais. |
| HTML exportado | 138 arquivos: 136 páginas indexáveis e duas saídas de erro. |
| Sitemap | 136 URLs, compatíveis com as páginas indexáveis verificadas. |
| Links internos e imagens | 5.823 links e 502 elementos de imagem verificados; zero erros e zero alertas no verificador de SEO. |
| Controle editorial e rotas de erro | 12 verificações aprovadas. |
| Navegador | 24 combinações de página e largura: 375, 768, 1.280 e 1.920 pixels; zero erros registrados. |
| Navegação e consentimento | Cinco fluxos aprovados, incluindo abertura de artigos pelas capas e consentimento. Requisições do Google interceptadas, sem envio de conversões reais. |
| Links entre artigos | 119 artigos com pelo menos dois links de entrada no bloco de relacionados. |
| Imagens responsivas | 119 capas com variantes; redução de 83% na soma dos bytes das versões de 400 pixels frente aos originais. |
| Integridade das alterações | Sem conflitos de merge pendentes ou erros em `git diff --check`. |

A redução de imagens é uma comparação local de arquivos, não uma redução de 83% no peso total do site. A home exportada tem 131.086 bytes de HTML; uma compressão gzip local resultou em 21.595 bytes. Esses números não são notas Lighthouse nem resultados de Core Web Vitals.

Evidências: [SEO](validacao-apos-ajustes.json), [publicação](validacao-publicacao.json), [navegador](validacao-navegador-apos-ajustes.json), [métricas locais](metricas-locais-apos-ajustes.json) e [sincronização](sincronizacao-remoto.json). Capturas: [home no celular](depois-home-mobile.png), [home no computador](depois-home-desktop.png) e [tabela no celular](depois-tabela-mobile.png).

## Etapas que dependem do ambiente publicado

1. Publicar a versão revisada incluindo as funções do Cloudflare Pages. Conferir os status reais das URLs de erro, os redirecionamentos e os cabeçalhos de cache.
2. Aplicar a regra do hostname www ao conjunto existente na Cloudflare, preservando caminho e parâmetros.
3. Configurar o ID verdadeiro do GA4 e validar os eventos na conta. Clique afiliado representa uma saída para a loja, não uma compra confirmada.
4. Conferir sitemap, indexação, canonicals, consultas e páginas no Search Console. Usar esses dados para decidir sobre consolidações de artigos de uso/slim Midea, Hisense 11 kg e calibração Samsung.
5. Medir velocidade e Core Web Vitals no ambiente público. Não foi obtido um resultado final de campo/CrUX ou Lighthouse para esta versão.
6. Manter revisão factual periódica por modelo, especialmente nos artigos técnicos e nas especificações ainda não reescritas integralmente.

O teste HTTP amostral de fontes externas encontrou bloqueios 403 de fabricantes e um timeout; isso não comprova que tais páginas estejam quebradas. Referências primárias foram consultadas durante as correções, mas não foi possível certificar a disponibilidade de todos os links externos por requisição automatizada.

O procedimento de implantação, configuração e revisão editorial está em [docs/seo-operacao.md](../docs/seo-operacao.md).
