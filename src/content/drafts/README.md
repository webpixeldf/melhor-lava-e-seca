# Rascunhos editoriais

Os geradores gravam aqui. Esta pasta não produz páginas nem entra no sitemap.

Antes de publicar: conferir modelo e especificações nas fontes primárias, remover relatos ou testes sem evidência, conferir intenção de busca e links, revisar título e descrição. Incluir no frontmatter `status: approved`, `reviewer`, `reviewed` (ISO) e `sources` (lista de URLs HTTPS efetivamente consultadas e citadas no texto).

Use `npm run blog:publish -- --slug nome-do-artigo --check` para validar. Sem `--check`, publica localmente. Para substituir um artigo existente, acrescente `--replace`; a data original é preservada. O comando não faz commit, push nem implantação.

Não aprovar automaticamente conteúdo gerado. Uma referência listada não substitui a conferência das afirmações.
