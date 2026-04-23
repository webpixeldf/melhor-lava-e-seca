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
  return `Você é um redator brasileiro experiente em eletrodoméstico, escrevendo para o blog da melhorlavaeseca.com. Seu tom é em primeira pessoa, natural, conversacional, com gíria brasileira ocasional. Você tem histórias pessoais reais para contar.

REGRAS RÍGIDAS (não quebre nenhuma):

1. IDIOMA: PORTUGUÊS BRASILEIRO COM ACENTUAÇÃO CORRETA E COMPLETA. Escreva sempre com acentos: ação, você, não, família, máquina, mãe, econômico, porém, energético, útil, também, após, única, ótima, três, história, pessoa, específico, técnico, conteúdo, eletrônica, água, pública, contrário, período, orçamento, já, só, até, às, é, à, público, fácil, frequência, prévio, próprio, série, sério, possível, relevância, experiência, convicções. NUNCA produza texto sem acentos — isso é a regra mais importante de todas.

2. INSPIRAÇÃO vs TRADUÇÃO: você vai receber um TÓPICO INSPIRADOR em inglês ou português como seed. Você NÃO TRADUZ, NÃO COPIA frases, NÃO parafraseia. Você escreve um artigo COMPLETAMENTE ORIGINAL sobre o tema geral, com seu próprio ângulo, suas próprias histórias pessoais, seus próprios exemplos brasileiros. O seed é apenas combustível de ideia.

3. TAMANHO: 1200 a 1800 palavras.

4. PARÁGRAFOS CURTOS — regra CRÍTICA. Cada parágrafo tem entre 300 e 500 caracteres (≈ 50-80 palavras, 2-3 frases). Mais de 500 caracteres = parágrafo ruim = quebrar em dois. JAMAIS parágrafo com mais de 600 caracteres. Antes de enviar cada parágrafo, mentalmente conte os caracteres — se passou de 500, divide em dois. Isso melhora leitura em mobile e SEO.

EXEMPLOS de parágrafos com tamanho bom (430-480 chars):

"Passei a manhã inteira tentando entender por que a minha lava e seca estava deixando as toalhas com cheiro estranho. Depois de várias lavagens e três ciclos de limpeza do tambor, descobri que o problema era o filtro da bomba — entupido com pelo de cachorro e fiapo de tecido. É mais comum do que parece."

"O segredo da durabilidade de uma lava e seca está em três coisas: não sobrecarregar, limpar o filtro toda semana e deixar a porta aberta depois do ciclo. Parece bobagem, mas já salvei duas máquinas antigas aqui em casa seguindo essa rotina. E nenhum manual fala disso com tanta clareza — você só aprende errando."

5. FORMATO MARKDOWN com frontmatter YAML. H1 apenas no frontmatter "title". No corpo use somente H2 (##) e H3 (###). JAMAIS H4/H5/H6.

6. PALAVRA-CHAVE: aparece no H1 (frontmatter title), no primeiro parágrafo, em pelo menos um H2, em pelo menos um H3. Máximo 1% de densidade.

7. LINKS INTERNOS: EXATAMENTE UM (1) único link para "/" no artigo inteiro, na última seção, com anchor text contendo "lava e seca" + adjetivo.

8. LINKS AMAZON (opcional, até 2): use estrutura markdown [nome do produto](https://www.amazon.com.br/dp/<ASIN>?tag=${AMZ_TAG}). ASINs reais:
   - Samsung WD11M AddWash: B0B625GC45
   - LG VC4 AI Direct Drive: B0D2Y5X13C
   - Samsung WD13T Smart Inverter: B0FWMTC71W
   - Electrolux LSP11 Turbo: B084RVVF5S
   - Samsung Ecobubble Digital Inverter: B0CB51NXF2
   - Midea MF200D Storm Wash: B0C6B5WHS1
   - Hisense WD3S11 Smart: B08DMTGN38
   - Brastemp BNQ10AB Inverter: B0FW15RTK6

9. NÃO cite valores em reais (R$) — diga "consulte o preço na Amazon".

10. ABERTURA: história pessoal ou caso real. NUNCA com definição.

11. ENCERRAMENTO: útil, direto. Sem "espero ter ajudado" ou "em conclusão".

12. CONTEXTO BRASILEIRO: se o tema for global (ex: marca americana), traga ângulo brasileiro — disponibilidade, preço relativo, assistência técnica no Brasil.

13. NÃO invente a data. O campo date do frontmatter deve ser a data de HOJE.

14. Formato do frontmatter (sempre com acentos):

---
title: "título natural, sem clickbait, com acentos corretos"
description: "descrição meta até 160 caracteres, com acentos"
date: "2026-04-21T10:30:00-03:00"
category: "Tutorial" | "Manutenção" | "Comparativo" | "Guia" | "Economia" | "Opinião"
tags: [3 a 5 tags em português]
author: "Equipe Melhor Lava e Seca"
keywords: [4 a 6 palavras-chave SEO em português]
---

EXEMPLO de parágrafo com acentuação correta que deve servir de referência:

"Passei a manhã inteira tentando entender por que a minha lava e seca estava deixando as toalhas com cheiro estranho. Depois de várias lavagens e três ciclos de limpeza do tambor, descobri que o problema era o filtro da bomba — entupido com pelo de cachorro e fiapo de tecido. Você também pode estar passando por isso. É mais comum do que parece."

Note os acentos: manhã, está, várias, três, ciclos, limpeza, tambor, descobri, problema, bomba, pelo, tecido, você, também, pode, passando, comum, parece.`;
}

function buildUserPrompt(topic) {
  const hojeISO = new Date().toISOString().replace(/\.\d{3}Z$/, '-03:00');
  return `TÓPICO INSPIRADOR (use apenas como seed de ideia — NÃO traduza, NÃO copie, NÃO parafraseie):

Título original: "${topic.title}"
Fonte: ${topic.source} (${topic.locale})
${topic.description ? `Contexto: ${topic.description.slice(0, 400)}` : ''}

Agora escreva um artigo ORIGINAL em português brasileiro, em primeira pessoa, sobre o tema GERAL desse tópico aplicado ao contexto brasileiro de lava e seca. Comece com uma história pessoal. Mínimo 1200 palavras. Use acentos corretos em todas as palavras. 1 único link para "/" na última seção.

A data do frontmatter deve ser exatamente: "${hojeISO}"`;
}

/**
 * Pós-processa o markdown e divide parágrafos grandes (>550 chars)
 * em dois, cortando no final de frase mais próximo do meio.
 */
function splitLongParagraphs(md) {
  const LIMIT = 550;

  const lines = md.split(/\n/);
  const out = [];
  let buf = [];

  const flush = () => {
    if (buf.length === 0) return;
    const para = buf.join(' ').trim();
    buf = [];
    if (para.length <= LIMIT || para.startsWith('#') || para.startsWith('```') || para.startsWith('>')) {
      out.push(para);
      return;
    }
    // divide em frases
    const sentences = para.match(/[^.!?]+[.!?]+(\s|$)/g) || [para];
    let current = '';
    for (const s of sentences) {
      if ((current + s).length > LIMIT && current.length > 0) {
        out.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) out.push(current.trim());
  };

  for (const line of lines) {
    if (line.trim() === '') {
      flush();
      out.push('');
    } else if (/^(#{1,3}\s|```|>|\-\s|\d+\.\s|---)/.test(line.trim())) {
      // cabeçalhos, blocos, listas, separadores — não agrupa
      flush();
      out.push(line);
    } else {
      buf.push(line);
    }
  }
  flush();

  // Garante parágrafos separados por linha em branco
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

/**
 * Conserta frontmatter quando o DeepSeek devolve tudo numa linha só
 * (sem newlines entre as chaves) — caso real que quebra o YAML parser.
 *
 * Detecta padrão tipo:
 *   title: "..." description: "..." date: "..."
 * E injeta \n entre as chaves conhecidas.
 */
function normalizeFrontmatter(md) {
  const FM_RE = /^---\n([\s\S]+?)\n---/;
  const m = md.match(FM_RE);
  if (!m) return md;

  let fm = m[1];
  // Lista de chaves esperadas no frontmatter (ordem não importa)
  const KEYS = ['title', 'description', 'date', 'updated', 'category', 'tags', 'author', 'keywords', 'image'];

  // Se aparece "key1: ...value... key2:" na MESMA linha, quebra
  for (const key of KEYS) {
    // padrão: " <key>:" precedido por algo que não é \n
    const re = new RegExp(`([^\\n])\\s+(${key}:)`, 'g');
    fm = fm.replace(re, '$1\n$2');
  }

  return md.replace(FM_RE, `---\n${fm}\n---`);
}

/**
 * Valida o YAML do frontmatter. Retorna true se parser aceita.
 */
async function isValidFrontmatter(md) {
  try {
    const matter = (await import('gray-matter')).default;
    matter(md);
    return true;
  } catch {
    return false;
  }
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

  // Injeta caminho da imagem e força a data de hoje no frontmatter
  const hojeISO = new Date().toISOString().replace(/\.\d{3}Z$/, '-03:00');

  // ETAPA 1: normaliza frontmatter caso DeepSeek tenha vomitado tudo numa linha só
  let finalContent = normalizeFrontmatter(content);

  // ETAPA 2: divide parágrafos longos
  finalContent = splitLongParagraphs(finalContent);
  if (/^---/.test(finalContent)) {
    if (/^image:/im.test(finalContent)) {
      finalContent = finalContent.replace(/^image:.*$/im, `image: "${webImgPath}"`);
    } else {
      finalContent = finalContent.replace(
        /^---\s*\n/,
        `---\nimage: "${webImgPath}"\n`
      );
    }
    // Força a data de hoje (DeepSeek às vezes inventa uma data)
    if (/^date:/im.test(finalContent)) {
      finalContent = finalContent.replace(/^date:.*$/im, `date: "${hojeISO}"`);
    } else {
      finalContent = finalContent.replace(
        /^(image:.*\n)/m,
        `$1date: "${hojeISO}"\n`
      );
    }
  } else {
    finalContent = `---\nimage: "${webImgPath}"\ndate: "${hojeISO}"\n---\n${finalContent}`;
  }

  // Adiciona referência ao seed como comentário HTML (invisível, só pra auditoria)
  finalContent += `\n\n<!-- seed: ${topic.source} | ${topic.link} -->\n`;

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);

  // ETAPA 3: valida YAML antes de gravar — se quebrar, aborta com erro claro
  const valid = await isValidFrontmatter(finalContent);
  if (!valid) {
    console.error(`❌ Frontmatter inválido após normalização. Não vou salvar pra não quebrar a build.`);
    console.error(`Conteúdo problemático:\n${finalContent.slice(0, 600)}`);
    process.exit(2);
  }

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
