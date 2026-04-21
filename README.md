# Melhor Lava e Seca — melhorlavaeseca.com

Site estatico em Next.js 14 (App Router) para review/afiliados da Amazon das melhores
lava e seca do Brasil. Arquitetado para ser **export estatico** (output: 'export'),
hospedavel em Vercel, Netlify, S3, CloudFront, Cloudflare Pages ou qualquer CDN.

---

## Comecando

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # gera /out com site estatico
```

Apos o build, sirva o conteudo de `out/` em qualquer CDN.

---

## Estrutura

```
src/
 ├─ app/             # rotas do App Router
 │   ├─ page.js              # homepage — ranking completo + guia + FAQ
 │   ├─ sobre/page.js
 │   ├─ contato/page.js
 │   ├─ privacidade/page.js
 │   ├─ termos/page.js
 │   ├─ afiliados/page.js
 │   ├─ blog/page.js         # lista
 │   ├─ blog/[slug]/page.js  # artigo
 │   ├─ sitemap.js           # sitemap.xml dinamico
 │   └─ robots.js
 ├─ components/      # Header, Footer, ProductCard, Schema
 ├─ content/
 │   ├─ products.js          # 9 produtos do ranking
 │   ├─ faq.js               # FAQ da homepage
 │   └─ blog/*.md            # artigos em markdown + frontmatter
 └─ lib/
     ├─ site.js              # configs globais (tag afiliado, nav etc)
     ├─ amazon.js            # montagem de links afiliado
     ├─ seo.js               # helper metadata centralizado
     └─ blog.js              # leitura de markdown

scripts/                      # automacao
 ├─ amazon-search.mjs         # PA-API v5 (SigV4 manual)
 ├─ download-images.mjs       # baixa imagens da PA-API
 ├─ convert-to-webp.mjs       # converte para webp via sharp
 ├─ generate-blog-post.mjs    # chama DeepSeek e salva md
 ├─ schedule-daily.mjs        # 3 artigos/dia em horarios aleatorios
 └─ build-favicons.mjs        # gera favicons a partir do SVG

public/
 ├─ favicon.svg               # logo-mae (todos os demais sao derivados)
 ├─ favicon.ico               # gerado via build-favicons
 ├─ apple-touch-icon.png      # idem
 ├─ android-chrome-192.png    # idem
 ├─ og/og-default.png         # imagem OpenGraph
 ├─ robots.txt
 └─ images/products/*.webp
```

---

## Variaveis de ambiente (.env.local)

```
AMAZON_ACCESS_KEY=...         # obrigatorio para rodar scripts
AMAZON_SECRET_KEY=...
AMAZON_PARTNER_TAG=melhorlavaeseca-20
AMAZON_HOST=webservices.amazon.com.br
AMAZON_REGION=us-east-1
AMAZON_MARKETPLACE=www.amazon.com.br

DEEPSEEK_API_KEY=...          # obrigatorio para gerar artigos
DEEPSEEK_MODEL=deepseek-chat

SITE_URL=https://melhorlavaeseca.com
```

> **ALERTA:** as chaves que voce compartilhou neste projeto (AKPA… / aGvA…) devem
> ser revogadas no painel do Amazon Associados. Elas ficaram visiveis na thread
> da conversa e no arquivo `.env.local`. Crie chaves novas e coloque aqui.

---

## Scripts disponiveis

| Script                | O que faz                                                             |
| --------------------- | --------------------------------------------------------------------- |
| `npm run dev`         | Dev server em http://localhost:3000                                   |
| `npm run build`       | Build estatico em /out                                                |
| `npm run amazon:search`  | Busca produtos na PA-API e salva em src/content/paapi-results.json |
| `npm run images:download`| Baixa as imagens dos produtos encontrados                          |
| `npm run images:webp`    | Converte as imagens baixadas para webp otimizado                   |
| `npm run blog:generate`  | Gera 1 artigo via DeepSeek                                         |
| `npm run blog:daily`     | Inicia o scheduler: 3 artigos/dia em horarios aleatorios           |
| `npm run icons:build`    | Gera favicons/og a partir do favicon.svg                           |

### Fluxo completo de coleta Amazon

```bash
npm run amazon:search           # baixa JSON da PA-API
npm run images:download         # baixa imagens
npm run images:webp             # converte pra webp
# Agora copie/ajuste ASINs em src/content/products.js com o que veio do JSON
npm run build
```

### Scheduler de blog (deixe rodando em VPS)

```bash
# Processo em primeiro plano (teste):
npm run blog:daily

# Em producao com PM2:
pm2 start scripts/schedule-daily.mjs --name blog-scheduler
pm2 save
pm2 startup
```

Ele gera **3 artigos por dia** com horarios aleatorios (minutos e segundos variados)
nas janelas: manha (07h-11h), tarde (13h-17h), noite (19h-22h).

Cada artigo e escrito pelo DeepSeek seguindo um prompt detalhado em primeira pessoa,
sem parecer IA, com links internos para a homepage.

---

## SEO & Schema.org

- Meta tags completas em todas as paginas (title, description, keywords, canonical, robots, OG, Twitter, icons, manifest)
- Schema.org JSON-LD: `Organization`, `WebSite`, `BreadcrumbList`, `ItemList`, 9x `Product` (com `AggregateRating` e `Offer`), `FAQPage`, `Article`
- `sitemap.xml` dinamico via `app/sitemap.js`
- `robots.txt` estatico + dinamico
- `og/og-default.png` (1200×630) gerado no build-favicons

---

## Decisoes de arquitetura

- **Next.js 14 App Router + export estatico**: gera HTML puro, rapido, sem server runtime.
- **Sem TypeScript** pra manter simples. jsconfig resolve `@/*` para `src/*`.
- **Imagens**: `next/image` com `unoptimized: true` (obrigatorio no export estatico).
- **Markdown no blog**: gray-matter + remark. Artigos recebem slug do nome do arquivo.
- **Sem tags h4/h5/h6**: conforme diretriz, titulos auxiliares usam `<span>` (ver rodape).

---

## Hospedagem

O site e 100% estatico. Para publicar:

1. Rode `npm run build`
2. Faca upload do diretorio `out/` para o seu host
3. Configure o dominio (melhorlavaeseca.com) no provedor
4. Habilite HTTPS

Em Vercel/Netlify o deploy e automatico ao dar push no git.

---

## Proximos passos sugeridos

- [ ] Trocar chaves Amazon por novas (as atuais estao comprometidas)
- [ ] Rodar `npm run amazon:search` e atualizar ASINs reais em products.js
- [ ] Configurar Google Analytics (adicionar script em `app/layout.js`)
- [ ] Configurar Search Console com sitemap.xml
- [ ] Contratar VPS ou cron na Vercel para `blog:daily`
