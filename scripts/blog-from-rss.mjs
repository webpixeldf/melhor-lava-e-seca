#!/usr/bin/env node
/**
 * Pipeline completo: RSS → tópico → DeepSeek (artigo ORIGINAL em português) → Unsplash → salva .md
 *
 * Importante: NÃO traduzimos e NÃO copiamos o texto do RSS.
 * O RSS só serve como SEED de tópico. O DeepSeek escreve do zero
 * em português brasileiro, na voz do editor, com acentos e formatação.
 *
 * Uso:
 *   node scripts/blog-from-rss.mjs
 *   node scripts/blog-from-rss.mjs --preview     # só lista tópicos novos, não gera
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { collectNewTopics, markUsed, getUsedStats } from './lib/rss.mjs';
import { fetchBlogCover } from './lib/unsplash.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'blog');

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const AMZ_TAG = process.env.AMAZON_PARTNER_TAG || 'melhorlavaeseca-20';

const PREVIEW = process.argv.includes('--preview');

if (!PREVIEW && !DEEPSEEK_KEY) {
  console.error('❌ DEEPSEEK_API_KEY não definida no .env.local');
  process.exit(1);
}

// -------- Prompt DeepSeek (inspirado, não traduzido) --------
function buildSystemPrompt() {
  return `Voce e um redator brasileiro experiente em eletrodomestico, escrevendo para o blog da melhorlavaeseca.com. Seu tom e em primeira pessoa, natural, conversacional, com giria brasileira ocasional. Voce tem historias pessoais reais para contar.

REGRAS RIGIDAS (nao quebre nenhuma):

1. IDIOMA: PORTUGUES BRASILEIRO COM ACENTUACAO COMPLETA. Use acao, voce, nao, familia, maquina, mae, economico, porem, energetico, util com acentos corretos.

2. INSPIRACAO vs TRADUCAO: voce vai receber um TOPICO INSPIRADOR em ingles ou portugues como seed. Voce NAO TRADUZ, NAO COPIA frases, NAO parafraseia. Voce escreve um artigo COMPLETAMENTE ORIGINAL sobre o tema geral, com seu proprio angulo, suas proprias historias pessoais, seus proprios exemplos brasileiros. O seed e apenas combustivel de ideia.

3. TAMANHO: 1200 a 1800 palavras.

4. PARAGRAFOS COM 300 A 500 CARACTERES CADA. Nunca paragrafos de 1 linha so, nunca paragrafos acima de 800 caracteres. Entre 2 e 4 frases por paragrafo, dando ritmo.

5. FORMATO MARKDOWN com frontmatter YAML. H1 apenas no frontmatter "title". No corpo use somente H2 (##) e H3 (###). JAMAIS H4/H5/H6.

6. PALAVRA-CHAVE: aparece no H1 (frontmatter title), no primeiro paragrafo, em pelo menos um H2, em pelo menos um H3. Maximo 1% de densidade.

7. LINKS INTERNOS: EXATAMENTE UM (1) unico link para "/" no artigo inteiro, na ultima secao, com anchor text contendo "lava e seca" + adjetivo.

8. LINKS AMAZON (opcional, ate 2): use estrutura https://www.amazon.com.br/dp/<ASIN>?tag=${AMZ_TAG}. ASINs reais:
   - Samsung WD11M AddWash: B0B625GC45
   - LG VC4 AI Direct Drive: B0D2Y5X13C
   - Samsung WD13T Smart Inverter: B0FWMTC71W
   - Electrolux LSP11 Turbo: B084RVVF5S
   - Samsung Ecobubble Digital Inverter: B0CB51NXF2
   - Midea MF200D Storm Wash: B0C6B5WHS1
   - Hisense WD3S11 Smart: B08DMTGN38
   - Brastemp BNQ10AB Inverter: B0FW15RTK6

9. NAO cite valores em reais (R$) — diga "consulte o preco na Amazon".

10. ABERTURA: historia pessoal ou caso real. NUNCA com definicao.

11. ENCERRAMENTO: util, direto. Sem "espero ter ajudado" ou "em conclusao".

12. CONTEXTO BRASILEIRO: se o tema for global (ex: marca americana), traga angulo brasileiro — disponibilidade, preco relativo, assistencia tecnica no Brasil.

13. Formato do frontmatter:

---
title: "titulo natural, sem clickbait"
description: "descricao meta ate 160 caracteres"
date: "ISO 8601 completa com horario"
category: "Tutorial" | "Manutencao" | "Comparativo" | "Guia" | "Economia" | "Opiniao"
tags: [3 a 5 tags em portugues]
author: "Equipe Melhor Lava e Seca"
keywords: [4 a 6 palavras-chave SEO]
---`;
}

function buildUserPrompt(topic) {
  return `TOPICO INSPIRADOR (use apenas como seed de ideia — NAO traduza, NAO copie, NAO parafraseie):

Titulo original: "${topic.title}"
Fonte: ${topic.source} (${topic.locale})
${topic.description ? `Contexto: ${topic.description.slice(0, 400)}` : ''}

Agora escreva um artigo ORIGINAL em portugues brasileiro, em primeira pessoa, sobre o tema GERAL desse topico aplicado ao contexto brasileiro de lava e seca. Comece com uma historia pessoal. Minimo 1200 palavras. 1 unico link para "/" na ultima secao.`;
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function extractTitle(content) {
  const m = content.match(/^title:\s*"?([^"\n]+)"?/im);
  return m ? m[1].trim().replace(/^"|"$/g, '') : null;
}

async function generateFromTopic(topic) {
  console.log(`\n🤖 Gerando artigo a partir do tópico:`);
  console.log(`   "${topic.title}"`);
  console.log(`   fonte: ${topic.source}`);

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 0.85,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(topic) },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Resposta vazia do DeepSeek');

  const title = extractTitle(content) || topic.title;
  const slug = slugify(title);
  const imgPath = path.join(IMG_DIR, `${slug}.webp`);
  const webImgPath = `/images/blog/${slug}.webp`;

  // Imagem da capa via Unsplash (query baseada no título em inglês ou fallback)
  const unsplashQuery = topic.locale === 'en'
    ? topic.title.split(/\s+/).slice(0, 4).join(' ')
    : 'washing machine home';

  console.log(`🖼️  Buscando capa no Unsplash ("${unsplashQuery}")...`);
  try {
    const cover = await fetchBlogCover(unsplashQuery, imgPath, {
      fallbackQueries: ['washing machine', 'laundry room', 'home appliance'],
    });
    console.log(`   ✅ ${path.basename(imgPath)} — foto de ${cover.photographer}`);
  } catch (err) {
    console.warn(`   ⚠️  Unsplash falhou: ${err.message}`);
  }

  // Injeta caminho da imagem no frontmatter
  let finalContent = content;
  if (/^---/.test(finalContent)) {
    if (/^image:/im.test(finalContent)) {
      finalContent = finalContent.replace(/^image:.*$/im, `image: "${webImgPath}"`);
    } else {
      finalContent = finalContent.replace(
        /^---\s*\n/,
        `---\nimage: "${webImgPath}"\n`
      );
    }
  } else {
    finalContent = `---\nimage: "${webImgPath}"\n---\n${finalContent}`;
  }

  // Adiciona referência ao seed como comentário HTML (invisível, só pra auditoria)
  finalContent += `\n\n<!-- seed: ${topic.source} | ${topic.link} -->\n`;

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);

  if (fs.existsSync(mdPath)) {
    const alt = path.join(BLOG_DIR, `${slug}-${Date.now()}.md`);
    console.log(`⚠️  Slug colidiu, salvando como ${path.basename(alt)}`);
    fs.writeFileSync(alt, finalContent);
  } else {
    fs.writeFileSync(mdPath, finalContent);
  }

  console.log(`✅ Artigo salvo: src/content/blog/${slug}.md`);
  console.log(`   Título: ${title}`);
  console.log(`   ${content.length} caracteres, ~${Math.round(content.split(/\s+/).length)} palavras`);

  return { slug, title };
}

async function main() {
  const stats = getUsedStats();
  console.log(`📚 Histórico: ${stats.urls} URLs já usadas (log em ${path.basename(stats.file)})\n`);

  const topics = await collectNewTopics({ limit: 20 });

  if (topics.length === 0) {
    console.log('\n😴 Nenhum tópico novo encontrado. Todos os RSS atuais já foram usados ou não têm conteúdo relevante.');
    process.exit(0);
  }

  if (PREVIEW) {
    console.log('\n=== PREVIEW (sem gerar) ===\n');
    topics.forEach((t, i) => {
      console.log(`${i + 1}. [${t.source}] ${t.title}`);
      console.log(`   ${t.link}\n`);
    });
    process.exit(0);
  }

  // Pega o primeiro tópico da lista (mais recente dentre os não usados)
  const chosen = topics[0];
  await generateFromTopic(chosen);
  markUsed(chosen);
  console.log(`\n📝 Tópico marcado como usado. Próxima execução pegará outro.`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
