# Operação editorial e publicação

## Antes de uma implantação

A versão desta revisão está no diretório de trabalho; não foi enviada ao GitHub nem publicada em produção. A base foi sincronizada com `3089658`, preservando os oito artigos novos recebidos durante a revisão. Os ajustes permanecem sem commit para inspeção. Há uma cópia anterior dos ajustes no stash com a descrição `codex-seo-ajustes-antes-sincronizacao-2026-09-07`.

Execute `npm run build`, `npm run seo:check` e `npm run test:editorial`. A pasta de saída é `out`. A geração responsiva acontece em `prebuild`; não é necessário versionar as variantes.

A implantação pelo Cloudflare Pages deve incluir a pasta `functions` do repositório e o `_routes.json` da saída. A função está limitada às três URLs explícitas de erro (`/404`, `/404/`, `/404.html`); o restante permanece estático. Depois da implantação, conferir o status HTTP real dessas URLs e de uma URL aleatória inexistente. O teste local da função não substitui a verificação na hospedagem.

## Domínio preferido

Adicionar a regra de `config/cloudflare-www-redirect.json` ao conjunto existente de Single Redirects da zona. Não substituir regras existentes nem criar outro conjunto sem consultar a configuração atual. O hostname www precisa estar com proxy Cloudflare ativo. Testar, por exemplo, uma página do blog com parâmetros para confirmar que caminho e consulta foram preservados.

A regra está preparada, mas não foi aplicada à conta. Os canonicals já apontam ao domínio sem www. Referência: https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-api/

## Medição

Configurar o ID real da propriedade em `NEXT_PUBLIC_GA4_ID` no ambiente de build e gerar nova implantação. A variável está vazia nesta revisão. O Google Ads existente foi preservado com carregamento condicionado ao aceite de cookies. O evento `affiliate_click` mede saída para a Amazon; ele não comprova compra ou receita.

A aceitação, a recusa e a revogação foram testadas com requisições do Google interceptadas. Os testes não enviaram conversões reais. Depois da implantação, validar a propriedade correta e o evento na ferramenta de depuração da conta.

## Novos artigos e revisões

Todos os geradores escrevem em `src/content/drafts`. A rotina agendada mantém a preparação de rascunhos; ela não publica nem reescreve automaticamente o acervo. A alteração na rotina só entra em vigor no GitHub depois que o workflow revisado for enviado ao repositório.

Antes de aprovar, conferir fatos nas fontes primárias, diferenças entre versões, adequação à pergunta, links, imagens e alegações de testes. Um link de suporte não comprova todas as afirmações de um texto.

No frontmatter do rascunho, informar `status: approved`, `reviewer`, `reviewed` em ISO e `sources` com URLs HTTPS consultadas e citadas no corpo. Validar com `npm run blog:publish -- --slug nome --check`. Publicar localmente sem `--check`; para substituir uma página existente, usar também `--replace`. A data original é preservada. O comando não faz push ou implantação.

O catálogo central fica em `src/content/products-data.json`. Comparativos documentais usam `{% catalog grupo %}` para obter as mesmas capacidades e referências da home. Manter o código completo, a fonte e a data da consulta ao atualizar cada produto; não reutilizar ASIN como MPN nem introduzir notas sem registros de teste.

## Acompanhamento após publicar

No Search Console, reenviar o sitemap e acompanhar cobertura, URLs escolhidas como canônicas, consultas e páginas. Os grupos Midea de uso/slim, Hisense 11 kg e calibração Samsung continuam candidatos à análise de sobreposição. Escolher uma URL para consolidação exige conferir modelo, intenção e desempenho. Esta revisão não aplicou redirecionamentos em massa a esses grupos.

Conferir os cabeçalhos reais dos arquivos com hash e das imagens. Regras externas da conta podem prevalecer sobre a intenção do arquivo `_headers`. Medir Core Web Vitals em campo e laboratório com quota disponível; o relatório local não é uma nota Lighthouse nem um resultado CrUX.
