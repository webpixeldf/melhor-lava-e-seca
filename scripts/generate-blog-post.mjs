#!/usr/bin/env node
/**
 * Gera um artigo de blog via DeepSeek + capa via Unsplash.
 *
 * Uso:
 *   node scripts/generate-blog-post.mjs                               # topico aleatorio
 *   node scripts/generate-blog-post.mjs "como escolher capacidade"    # topico definido
 *   node scripts/generate-blog-post.mjs "titulo" "query unsplash"     # topico + query imagem
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { fetchBlogCover } from './lib/unsplash.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'blog');

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const AMZ_TAG = process.env.AMAZON_PARTNER_TAG || 'melhorlavaeseca-20';

if (!DEEPSEEK_KEY) {
  console.error('❌ Falta DEEPSEEK_API_KEY no .env.local');
  process.exit(1);
}

const TOPICS = [
  { title: 'como escolher a capacidade ideal de lava e seca pela família', query: 'laundry family' },
  { title: 'diferença entre lavadora, secadora e lava e seca', query: 'washing machine' },
  { title: 'lava e seca frontal vs superior: qual a melhor', query: 'front load washer' },
  { title: 'como remover mancha de vinho na lava e seca', query: 'wine stain laundry' },
  { title: 'por que minha lava e seca não está secando a roupa direito', query: 'dryer laundry' },
  { title: 'tempo ideal de ciclo para cada tipo de tecido', query: 'laundry care' },
  { title: 'lava e seca com vapor vale a pena', query: 'steam laundry' },
  { title: 'posso lavar tênis na lava e seca', query: 'sneakers laundry' },
  { title: 'qual o programa certo para lavar jeans', query: 'jeans laundry' },
  { title: 'como economizar água na lava e seca', query: 'water saving laundry' },
  { title: 'lava e seca dando erro de drenagem: o que fazer', query: 'plumbing washing machine' },
  { title: 'como instalar uma lava e seca em apartamento', query: 'apartment laundry' },
  { title: 'melhor horário para usar lava e seca (tarifa branca)', query: 'electricity meter' },
  { title: 'diferença entre motor Inverter e motor comum', query: 'washing machine motor' },
  { title: 'lava e seca com Wi-Fi vale a pena?', query: 'smart home appliance' },
  { title: 'como lavar travesseiro em lava e seca', query: 'pillow laundry' },
  { title: 'cuidados com a lava e seca em dias muito frios', query: 'winter laundry' },
  { title: 'lava e seca e sabão líquido: qual usar', query: 'detergent laundry' },
  { title: 'lava e seca com cheiro de mofo: como resolver', query: 'laundry cleaning' },
  { title: 'por que a lava e seca está dando choque', query: 'electrical appliance' },
  { title: 'como lavar roupa de bebê na lava e seca', query: 'baby laundry' },
  { title: 'lava e seca durando pouco: sinais de que vai quebrar', query: 'broken washing machine' },
  { title: 'toalha saindo áspera da lava e seca: o que fazer', query: 'towel laundry' },
  { title: 'quantidade certa de sabão para cada tipo de carga', query: 'laundry detergent' },
  { title: 'como remover pelo de pet das roupas na lava e seca', query: 'pet dog laundry' },
];

const PICK = process.argv[2];
const PICK_QUERY = process.argv[3];
let topic;
if (PICK) {
  topic = { title: PICK, query: PICK_QUERY || PICK };
} else {
  topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

const SYSTEM = `Voce e um redator brasileiro experiente em eletrodomestico, escrevendo para o blog da melhorlavaeseca.com. Seu tom e em primeira pessoa, natural, conversacional, com giria brasileira ocasional. Voce tem historias pessoais reais para contar.

REGRAS RIGIDAS (nao quebre nenhuma):

1. PORTUGUES BRASILEIRO COM ACENTUACAO COMPLETA. Use acao (nao "acao"), voce, nao (nao "nao"), familia, maquina, mae, economico, porem, energetico, vapor, util — escreva com acentos corretos sempre.

2. TAMANHO: 1200 a 1800 palavras.

3. PARAGRAFOS COM 300 A 500 CARACTERES CADA. Nunca paragrafos de 1 linha so, nunca paragrafos acima de 800 caracteres. Entre 2 e 4 frases por paragrafo, dando ritmo. Nao transforme cada frase em um paragrafo isolado — isso vira superficial.

4. FORMATO MARKDOWN com frontmatter YAML. H1 apenas no frontmatter "title". No corpo use somente H2 (##) e H3 (###). JAMAIS H4/H5/H6.

5. PALAVRA-CHAVE principal: aparece no H1 (frontmatter title), no primeiro paragrafo, em pelo menos um H2, em pelo menos um H3. Maximo 1% de densidade total.

6. LINKS INTERNOS: EXATAMENTE UM (1) unico link para "/" no artigo inteiro, apenas na ultima secao, com anchor text contendo "lava e seca" + adjetivo. JAMAIS use /#ancora-de-produto. Zero links para outras paginas internas.

7. LINKS AMAZON: voce pode citar ate 2 produtos especificos no artigo, linkando com a estrutura https://www.amazon.com.br/dp/<ASIN>?tag=${AMZ_TAG}. Use um desses ASINs reais:
   - Samsung WD11M AddWash: B0B625GC45
   - LG VC4 AI Direct Drive: B0D2Y5X13C
   - Samsung WD13T Smart Inverter: B0FWMTC71W
   - Electrolux LSP11 Turbo: B084RVVF5S
   - Samsung Ecobubble Digital Inverter: B0CB51NXF2
   - Midea MF200D Storm Wash: B0C6B5WHS1
   - Hisense WD3S11 Smart: B08DMTGN38
   - Brastemp BNQ10AB Inverter: B0FW15RTK6

8. CITACAO DE PRECOS: NAO mencione valores em reais (R$). Diga "consulte o preco na Amazon" ou similar.

9. ABERTURA: comece com uma historia pessoal ou caso real. NUNCA com uma definicao ou "segundo especialistas".

10. ENCERRAMENTO: util, direto. Sem "espero ter ajudado" ou "em conclusao".

11. VOZ: primeira pessoa consistente. Use "eu", "a gente", "voce", "minha familia". Sem jargao corporativo.

12. Formato do frontmatter:

---
title: "titulo natural, sem clickbait"
description: "descricao meta ate 160 caracteres"
date: "ISO 8601 completa com horario"
category: "Tutorial" | "Manutencao" | "Comparativo" | "Guia" | "Economia" | "Opiniao"
tags: [3 a 5 tags em portugues]
author: "Equipe Melhor Lava e Seca"
keywords: [4 a 6 palavras-chave SEO]
---`;

const USER = `Escreva um artigo completo sobre: "${topic.title}"

Regras criticas:
- Acentuacao portuguesa completa
- Paragrafos de 300 a 500 caracteres (nao curtos demais, nao longos demais)
- Exatamente 1 link para "/" no artigo inteiro (na ultima secao)
- Pode citar ate 2 produtos via link /dp/ASIN com tag ${AMZ_TAG}
- Comece com historia pessoal
- 1200 a 1800 palavras`;

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function extractFrontmatterField(content, field) {
  const re = new RegExp(`^${field}:\\s*"?([^"\\n]+)"?`, 'im');
  const m = content.match(re);
  return m ? m[1].trim().replace(/^"|"$/g, '') : null;
}

async function main() {
  console.log(`🤖 Topico: "${topic.title}"`);
  console.log(`🔎 Query Unsplash: "${topic.query}"`);

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
        { role: 'system', content: SYSTEM },
        { role: 'user', content: USER },
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

  const title = extractFrontmatterField(content, 'title') || topic.title;
  const slug = slugify(title);

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const imgPath = path.join(IMG_DIR, `${slug}.webp`);
  const imgWebPath = `/images/blog/${slug}.webp`;

  console.log(`🖼️  Baixando capa do Unsplash...`);
  let cover;
  try {
    cover = await fetchBlogCover(topic.query, imgPath, {
      fallbackQueries: ['washing machine', 'laundry room', 'home appliance'],
    });
    console.log(`   ✅ ${path.basename(imgPath)} — foto de ${cover.photographer}`);
  } catch (err) {
    console.warn(`   ⚠️  Unsplash falhou: ${err.message}. Artigo salvo sem capa.`);
  }

  let finalContent = content;
  if (/^---/.test(finalContent)) {
    if (/^image:/im.test(finalContent)) {
      finalContent = finalContent.replace(/^image:.*$/im, `image: "${imgWebPath}"`);
    } else {
      finalContent = finalContent.replace(
        /^---\s*\n/,
        `---\nimage: "${imgWebPath}"\n`
      );
    }
  } else {
    finalContent = `---\nimage: "${imgWebPath}"\n---\n${finalContent}`;
  }

  if (fs.existsSync(mdPath)) {
    console.log(`⚠️  Ja existe ${slug}.md — adicionando timestamp`);
    const newName = `${slug}-${Date.now()}.md`;
    fs.writeFileSync(path.join(BLOG_DIR, newName), finalContent);
  } else {
    fs.writeFileSync(mdPath, finalContent);
  }

  console.log(`✅ Artigo salvo: src/content/blog/${slug}.md`);
  console.log(`   Titulo: ${title}`);
  console.log(`   ${content.length} caracteres, ~${Math.round(content.split(/\s+/).length)} palavras`);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
