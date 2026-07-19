#!/usr/bin/env node
/**
 * Gera artigos a partir da fila do cronograma editorial.
 *
 * Substitui o antigo blog-from-rss.mjs. Diferencas centrais:
 *   - a pauta vem da planilha (keyword, volume, tamanho), nao de RSS;
 *   - o artigo e gerado POR SECOES: o limite de 4096 tokens por chamada nao
 *     comporta 3.500 palavras de uma vez, e texto longo numa tacada so incha
 *     e se repete;
 *   - o frontmatter e montado AQUI, nao pedido ao modelo. Titulo, slug e
 *     keywords ja sao conhecidos, entao nao ha por que arriscar YAML quebrado;
 *   - links internos sao injetados por pos-processamento (ver interlink.mjs);
 *   - existe portao de qualidade: artigo que nao passa NAO e publicado.
 *
 * Uso:
 *   node scripts/blog-from-cronograma.mjs              # 1 artigo
 *   node scripts/blog-from-cronograma.mjs --count 3    # 3 artigos
 *   node scripts/blog-from-cronograma.mjs --dry-run    # nao grava nada
 *   node scripts/blog-from-cronograma.mjs --slug X     # forca uma pauta
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { loadQueue, saveQueue, nextPending, markStatus, buildOutline } from './lib/cronograma.mjs';
import { addInternalLinks, buildLeiaTambem, linkBackToNewPost } from './lib/interlink.mjs';
import { fetchBlogCover } from './lib/unsplash.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'blog');

const KEY = process.env.DEEPSEEK_API_KEY;
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i > -1 ? argv[i + 1] : d; };
const DRY = has('--dry-run');
const COUNT = parseInt(val('--count', '1'), 10);
const ONLY = val('--slug', null);

if (!KEY) { console.error('DEEPSEEK_API_KEY nao definida em .env.local'); process.exit(1); }

// ----------------------------------------------------------------- prompts

const VOICE = `Voce e um redator brasileiro que trabalha com eletrodomestico ha anos e escreve pro blog do melhorlavaeseca.com.

COMO VOCE ESCREVE:
- Portugues brasileiro com acentuacao completa e correta. Isso e inegociavel.
- Primeira pessoa, tom de conversa, como quem explica pra um amigo. Pode usar expressao coloquial brasileira sem exagero.
- Frases de tamanho variado. Alterne periodo curto e longo: texto com todas as frases do mesmo tamanho soa robotico.
- PARAGRAFO CURTO, regra critica: 2 ou 3 frases, entre 180 e 320 caracteres.
  NUNCA passe de 420 caracteres. A maioria le no celular, e bloco grande de
  texto faz o leitor desistir. Na duvida, quebre em dois. Paragrafo de uma
  frase so, isolado, tambem funciona bem e cria respiro.
- Concreto sempre: numero, exemplo, situacao real. "Economiza energia" e vago; "gasta cerca de 0,27 kWh por ciclo em agua fria" e util.

O QUE VOCE NUNCA FAZ:
- Nunca copie nem parafraseie texto de outro site. Escreva do zero, com seu proprio angulo.
- Nunca repita a palavra-chave de forma mecanica. Ela deve aparecer naturalmente; se a frase ficar estranha, use sinonimo ou pronome.
- Nunca use enchimento: "vale ressaltar que", "e importante destacar", "em um mundo cada vez mais", "sem duvida alguma".
- Nunca abra secao com definicao de dicionario.
- Nunca escreva conclusao generica tipo "espero ter ajudado" ou "em suma".
- Nunca cite preco em reais. Diga para consultar o preco atualizado.
- Nunca invente link, URL ou marcacao de link. Escreva so o texto corrido: os links sao inseridos depois.

REGRA DE PRODUTOS (a mais importante de todas):
Voce NUNCA inventa nome de modelo, codigo de produto ou especificacao tecnica.
Num site de afiliados, mandar o leitor procurar um produto que nao existe
destroi a credibilidade. Se voce nao recebeu o modelo numa lista explicita,
escreva sem citar modelo: fale de criterios, faixas de capacidade, tipos de
motor e o que observar. E melhor um texto sem nome de modelo do que um texto
com modelo inventado.`;

/**
 * Catalogo real, lido de products.js. E a UNICA fonte de modelo que o modelo
 * pode citar: sem isso ele alucina ("Samsung WD5000", "WD9000") — foi o que
 * aconteceu no primeiro teste.
 */
function catalogBlock() {
  const file = path.join(ROOT, 'src', 'content', 'products.js');
  if (!fs.existsSync(file)) return '';
  const src = fs.readFileSync(file, 'utf8');
  const re = /name:\s*'([^']+)'[\s\S]{0,900}?capacityWash:\s*([\d.]+)[\s\S]{0,200}?capacityDry:\s*([\d.]+)/g;
  const lines = [];
  let m;
  while ((m = re.exec(src))) lines.push(`- ${m[1]} (lava ${m[2]}kg / seca ${m[3]}kg)`);
  if (!lines.length) return '';
  return `\n\nMODELOS QUE VOCE PODE CITAR (os unicos — nao invente outros):\n${lines.join('\n')}\n\nSe a pauta for de uma marca que nao esta nessa lista, NAO cite modelo nenhum dessa marca: fale de criterios e do que observar na hora de escolher.`;
}

/**
 * As "palavras-chave secundarias" da planilha sao geradas por template e
 * saem como "lava e seca samsung silenciosa", "lava e seca samsung economica".
 * Mandar o modelo USAR essas frases produz texto grudento: no teste ele colou
 * 18 delas literalmente. Entao viram TEMAS, e colar literal e proibido.
 */
function themesFrom(pauta) {
  const kwWords = new Set(pauta.keyword.toLowerCase().split(/\s+/));
  const themes = pauta.secondaryKeywords
    .map((s) => s.toLowerCase().split(/\s+/).filter((w) => !kwWords.has(w)).join(' ').trim())
    .filter(Boolean);
  return [...new Set(themes)].slice(0, 8).join(', ');
}

// Intencoes que citam modelo especifico e portanto precisam do catalogo real.
const NEEDS_CATALOG = new Set(['ranking', 'review', 'comparativo']);

function sectionPrompt(pauta, section, index, total, written) {
  const secundarias = themesFrom(pauta);
  const catalogo = NEEDS_CATALOG.has(pauta.intent) ? catalogBlock() : '';
  return `ARTIGO: "${pauta.title}"${catalogo}
PALAVRA-CHAVE PRINCIPAL: "${pauta.keyword}"
TEMAS A COBRIR AO LONGO DO ARTIGO (aborde os que fizerem sentido nesta secao): ${secundarias}

IMPORTANTE SOBRE OS TEMAS: eles sao ASSUNTOS, nao frases prontas. Escreva com
suas proprias palavras. NUNCA cole o tema literalmente numa frase (fica
artificial, tipo "a lava e seca economica leva vantagem"). Fale do assunto
naturalmente: "gasta menos energia", "faz menos barulho", "compensa o preco".

Voce esta escrevendo a secao ${index + 1} de ${total}.

TITULO DA SECAO (use exatamente este, como H2):
## ${section.h2}

O QUE ESTA SECAO DEVE COBRIR:
${section.guide}

TAMANHO: entre ${Math.round(section.words * 0.85)} e ${section.words} palavras. Nao ultrapasse o limite superior — texto inflado para bater tamanho fica repetitivo e o leitor abandona.

${written.length ? `SECOES JA ESCRITAS (NAO repita esse conteudo, nao reintroduza o assunto):
${written.map((w) => '- ' + w).join('\n')}` : 'Esta e a primeira secao do corpo.'}

REGRAS DESTA SECAO:
- REPETICAO DA PALAVRA-CHAVE: a expressao exata "${pauta.keyword}" deve
  aparecer 1 ou 2 vezes nesta secao (contando o subtitulo) — nem menos, nem
  mais. Menos que isso e o Google nao entende o tema; mais que isso vira
  stuffing. No resto do texto use
  sinonimo ("a maquina", "o aparelho", "ela", "esse tipo de lavadora") ou
  simplesmente omita — o leitor ja sabe do que voce esta falando. Repetir a
  expressao inteira toda hora e o erro que mais denuncia texto feito por IA.
- Comece direto pelo H2 acima. Nao escreva introducao do artigo nem frontmatter.
- Use H3 (###) para subdividir quando fizer sentido. Nunca use H4 ou menor.
- Pelo menos um subtitulo desta secao deve conter a palavra-chave principal ou uma secundaria, desde que fique natural.
- Nao escreva conclusao geral do artigo: esta e so uma secao.
- Responda SOMENTE com o markdown da secao.`;
}

function introPrompt(pauta) {
  return `ARTIGO: "${pauta.title}"
PALAVRA-CHAVE PRINCIPAL: "${pauta.keyword}"

Escreva APENAS a introducao do artigo, entre 120 e 180 palavras.

REGRAS:
- Comece com uma situacao concreta ou uma pergunta real de quem pesquisa esse termo. Nunca com definicao.
- A palavra-chave "${pauta.keyword}" deve aparecer no primeiro paragrafo, de forma natural.
- Ja adiante o que o leitor vai encontrar no texto, respondendo rapidamente a intencao da busca.
- Sem H1, sem H2, sem frontmatter, sem lista. Apenas 2 ou 3 paragrafos corridos.
- Responda SOMENTE com o texto da introducao.`;
}

// ------------------------------------------------------------------- api

async function ask(messages, maxTokens = 4096) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: MODEL, temperature: 0.9, max_tokens: maxTokens, messages }),
      });
      if (!r.ok) throw new Error(`DeepSeek ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const data = await r.json();
      const c = data.choices?.[0]?.message?.content?.trim();
      if (!c) throw new Error('resposta vazia');
      return c;
    } catch (err) {
      if (attempt === 3) throw err;
      console.log(`      tentativa ${attempt} falhou (${err.message}), repetindo...`);
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
}

function clean(md) {
  return md
    .replace(/^```(?:markdown|md)?\s*\n/i, '')
    .replace(/\n```\s*$/i, '')
    .replace(/^#\s+.*\n/, '')      // H1 solto: o H1 e o title do frontmatter
    .trim();
}

/**
 * O DeepSeek as vezes deixa escapar palavra sem acento mesmo com a regra no
 * prompt. Corrige as reincidentes sem tocar em nada mais.
 */
const ACENTOS = [
  [/\bmaquina(s)?\b/g, 'máquina$1'], [/\bvoce\b/g, 'você'],
  [/\bagua\b/g, 'água'], [/\btambem\b/g, 'também'],
  [/\bproprio(s|a|as)?\b/g, 'próprio$1'], [/\bpossivel(is)?\b/g, 'possível$1'],
  [/\bfacil(is)?\b/g, 'fácil$1'], [/\brapido(s|a|as)?\b/g, 'rápido$1'],
  [/\bbasico(s|a|as)?\b/g, 'básico$1'], [/\btecnico(s|a|as)?\b/g, 'técnico$1'],
  [/\bperiodo(s)?\b/g, 'período$1'], [/\bautomatico(s|a|as)?\b/g, 'automático$1'],
  [/\bumido(s|a|as)?\b/g, 'úmido$1'], [/\bminimo(s|a|as)?\b/g, 'mínimo$1'],
  [/\bmaximo(s|a|as)?\b/g, 'máximo$1'], [/\beletrico(s|a|as)?\b/g, 'elétrico$1'],
  [/\benergetico(s|a|as)?\b/g, 'energético$1'], [/\bconteudo(s)?\b/g, 'conteúdo$1'],
];

function fixAccents(md) {
  let out = md;
  for (const [re, to] of ACENTOS) out = out.replace(re, to);
  return out;
}

/**
 * Quebra paragrafo longo em dois, cortando no fim de frase mais proximo do
 * meio. Instrucao no prompt ajuda mas nao garante: o modelo escapa. Como a
 * maioria le no celular, bloco grande e o que mais faz abandonar a pagina.
 */
const PARA_MAX = 420;

function splitLongParagraphs(md) {
  const out = [];
  let inCode = false;

  for (const bloco of md.split('\n\n')) {
    const t = bloco.trim();
    if (t.startsWith('```')) inCode = !inCode;
    // Nao mexe em heading, tabela, lista, citacao nem bloco de codigo.
    if (inCode || !t || t.length <= PARA_MAX || /^[#|>\-*\d`]/.test(t)) {
      out.push(bloco);
      continue;
    }

    const frases = t.match(/[^.!?]+[.!?]+[\s]*/g);
    if (!frases || frases.length < 2) { out.push(bloco); continue; }

    // Acumula ate passar da metade: o corte fica equilibrado.
    const meio = t.length / 2;
    let buf = '', corte = 0;
    for (let i = 0; i < frases.length - 1; i++) {
      buf += frases[i];
      if (buf.length >= meio) { corte = i + 1; break; }
    }
    if (!corte) { out.push(bloco); continue; }

    out.push(frases.slice(0, corte).join('').trim());
    out.push(frases.slice(corte).join('').trim());
  }
  return out.join('\n\n');
}

/** Secao cortada no meio da frase = estouro de token. Precisa refazer. */
function looksTruncated(md) {
  const last = md.trimEnd().split('\n').filter(Boolean).pop() || '';
  if (/^[#|>-]/.test(last.trim())) return false;      // heading, tabela, lista
  return !/[.!?:)”"']\s*$/.test(last.trim());
}

// -------------------------------------------------------------- qualidade

const countWords = (s) => s.replace(/[#*_`>[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;

/**
 * Portao de qualidade. O cliente pediu "somente conteudo rico, nada
 * artificial": e melhor pular a pauta e registrar o motivo do que publicar
 * texto fraco — foi exatamente isso que gerou a limpeza dos 93 artigos.
 */
function validate(body, pauta, linkReport, corpusSize = 0) {
  const problems = [];
  const words = countWords(body);
  const kw = pauta.keyword.toLowerCase();

  if (words < pauta.targetWords * 0.75) {
    problems.push(`curto demais: ${words} palavras, alvo ${pauta.targetWords}`);
  }
  if (words > pauta.targetWords * 1.35) {
    problems.push(`inflado: ${words} palavras, alvo ${pauta.targetWords}`);
  }

  // Secundaria colada literal e o defeito classico: a planilha entrega frases
  // mecanicas ("lava e seca samsung silenciosa") e o modelo repete como estao.
  //
  // So vale checar as secundarias ARTIFICIAIS — as que contem a palavra-chave
  // inteira dentro delas. Termo natural do assunto ("centrifugacao", "sabao
  // liquido") aparece varias vezes num texto bom e nao e stuffing.
  for (const sec of pauta.secondaryKeywords) {
    const artificial = sec.toLowerCase().includes(kw) && sec.toLowerCase() !== kw;
    if (!artificial) continue;
    const n = (body.toLowerCase().match(new RegExp(sec.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (n >= 3) problems.push(`secundaria colada literalmente ${n}x: "${sec}"`);
  }

  const occurrences = (body.toLowerCase().match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const density = (occurrences * kw.split(/\s+/).length) / words * 100;
  // Faixa saudavel: 0,8% a 1,5%. Acima vira stuffing; muito abaixo, o Google
  // pode nao entender sobre o que a pagina e.
  if (density > 2.5) problems.push(`keyword stuffing: densidade ${density.toFixed(2)}%`);
  if (density < 0.45) problems.push(`palavra-chave sub-utilizada: densidade ${density.toFixed(2)}%`);
  if (occurrences === 0) problems.push('palavra-chave nao aparece no texto');

  const headings = body.split('\n').filter((l) => /^#{2,3}\s/.test(l));
  if (headings.length < 4) problems.push(`poucos subtitulos: ${headings.length}`);
  const kwInHeading = headings.some((h) => h.toLowerCase().includes(kw));
  if (!kwInHeading) problems.push('nenhum H2/H3 contem a palavra-chave');

  if (!linkReport.home) problems.push('sem link para a home com ancora da palavra-chave');

  // A meta de 10-15 links so e alcancavel quando ja existe acervo pra apontar.
  // Nos primeiros artigos, exigir isso reprovaria texto bom por falta de destino.
  const linkTarget = Math.min(10, 1 + Math.floor(corpusSize * 0.6));
  if (linkReport.count < linkTarget) {
    problems.push(`links internos insuficientes: ${linkReport.count}, esperado ${linkTarget}`);
  }

  // Paragrafo gigante = leitura ruim no mobile. O divisor automatico mira 420,
  // entao 500 aqui e so rede de seguranca pro que escapou.
  const longP = body.split('\n\n').filter((p) => !/^[#|>\-*`]/.test(p.trim()) && p.length > 500);
  if (longP.length) problems.push(`${longP.length} paragrafo(s) acima de 500 caracteres`);

  // Rede de seguranca: se alguma secao ainda escapou truncada, nao publica.
  for (const bloco of body.split(/\n(?=## )/)) {
    if (looksTruncated(bloco)) {
      problems.push(`secao cortada no meio da frase: "...${bloco.trimEnd().slice(-60)}"`);
      break;
    }
  }

  // Frase repetida literalmente = sinal classico de texto inflado por IA.
  const sentences = body.split(/(?<=[.!?])\s+/).map((s) => s.trim().toLowerCase()).filter((s) => s.length > 60);
  const dupes = sentences.length - new Set(sentences).size;
  if (dupes > 2) problems.push(`${dupes} frases repetidas literalmente`);

  return { ok: problems.length === 0, problems, words, density, occurrences, headings: headings.length };
}

// ------------------------------------------------------------ frontmatter

function metaDescription(pauta, intro) {
  // 140-160 chars, com a palavra-chave. Parte da intro e aparada na frase.
  const base = intro.replace(/\s+/g, ' ').replace(/[#*_]/g, '').trim();
  let d = base.slice(0, 200);
  const cut = d.lastIndexOf('. ');
  if (cut > 120) d = d.slice(0, cut + 1);
  if (d.length > 160) d = d.slice(0, 157).replace(/\s+\S*$/, '') + '...';
  if (!d.toLowerCase().includes(pauta.keyword.toLowerCase())) {
    const prefix = `${pauta.keyword}: `;
    d = (prefix + d).slice(0, 157).replace(/\s+\S*$/, '') + '...';
  }
  return d.replace(/"/g, "'");
}

const CATEGORY = { review: 'Review', ranking: 'Comparativo', comparativo: 'Comparativo', guia: 'Manutenção', informativo: 'Guia' };

function buildFrontmatter(pauta, description, image, iso) {
  const kws = [pauta.keyword, ...pauta.secondaryKeywords.slice(0, 5)];
  const q = (s) => `"${String(s).replace(/"/g, "'")}"`;
  return [
    '---',
    `title: ${q(pauta.title)}`,
    `description: ${q(description)}`,
    `date: ${q(iso)}`,
    `category: ${q(CATEGORY[pauta.intent] || 'Guia')}`,
    `tags: [${kws.slice(0, 4).map(q).join(', ')}]`,
    `author: "Equipe Melhor Lava e Seca"`,
    `keywords: [${kws.map(q).join(', ')}]`,
    `image: ${q(image)}`,
    '---',
  ].join('\n');
}

// -------------------------------------------------------------- pipeline

function readCorpus() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
      const title = raw.match(/title:\s*"([^"]+)"/)?.[1] || f;
      const kws = raw.match(/keywords:\s*\[([^\]]*)\]/)?.[1] || '';
      const keyword = kws.split(',')[0]?.replace(/["']/g, '').trim() || '';
      const date = raw.match(/date:\s*"([^"]+)"/)?.[1] || '';
      return { slug: f.replace(/\.md$/, ''), title, keyword, date, file: path.join(BLOG_DIR, f) };
    })
    .filter((c) => c.keyword);
}

async function generate(pauta, corpus) {
  const outline = buildOutline(pauta);
  console.log(`\n  "${pauta.title}"`);
  console.log(`   /blog/${pauta.slug}/ | ${pauta.intent} | alvo ${pauta.targetWords}p | ${outline.length} secoes`);

  console.log('   intro...');
  const intro = clean(await ask([
    { role: 'system', content: VOICE },
    { role: 'user', content: introPrompt(pauta) },
  ], 700));

  const parts = [intro];
  const written = [];
  for (let i = 0; i < outline.length; i++) {
    const s = outline[i];
    process.stdout.write(`   secao ${i + 1}/${outline.length}: ${s.h2.slice(0, 42)}... `);

    // Portugues gasta ~2 tokens por palavra e o modelo costuma passar do alvo.
    // Com orcamento apertado a secao sai cortada no meio da frase — ja
    // aconteceu. Folga generosa e piso de 900 tokens resolvem.
    const budget = Math.min(4096, Math.max(900, Math.round(s.words * 4)));
    let md = clean(await ask([
      { role: 'system', content: VOICE },
      { role: 'user', content: sectionPrompt(pauta, s, i, outline.length, written) },
    ], budget));

    if (looksTruncated(md)) {
      process.stdout.write('(truncou, refazendo) ');
      md = clean(await ask([
        { role: 'system', content: VOICE },
        { role: 'user', content: sectionPrompt(pauta, s, i, outline.length, written) },
      ], 4096));
    }

    parts.push(md);
    written.push(s.h2);
    console.log(`${countWords(md)}p`);
  }

  let body = splitLongParagraphs(fixAccents(parts.join('\n\n')));

  const { body: linked, report } = addInternalLinks(body, pauta, corpus);
  body = linked + '\n\n' + buildLeiaTambem(pauta, corpus);

  const check = validate(body, pauta, report, corpus.length);
  console.log(`   -> ${check.words} palavras | densidade ${check.density.toFixed(2)}% | ${report.count} links | ${check.headings} subtitulos`);

  return { body, intro, check, report };
}

async function main() {
  const queue = loadQueue();
  const pautas = ONLY
    ? queue.items.filter((i) => i.slug === ONLY)
    : nextPending(queue, COUNT);

  if (!pautas.length) { console.log('Nada pendente na fila.'); return; }
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  let published = 0, skipped = 0;

  for (const pauta of pautas) {
    const corpus = readCorpus();
    try {
      const { body, intro, check } = await generate(pauta, corpus);

      if (!check.ok) {
        console.log(`   REPROVADO: ${check.problems.join('; ')}`);
        if (!DRY) { markStatus(queue, pauta.slug, 'reprovado', { problems: check.problems }); saveQueue(queue); }
        skipped++;
        continue;
      }

      const iso = new Date().toISOString().replace(/\.\d{3}Z$/, '-03:00');
      const imgWeb = `/images/blog/${pauta.slug}.webp`;
      if (!DRY) {
        try {
          await fetchBlogCover(pauta.keyword, path.join(IMG_DIR, `${pauta.slug}.webp`));
        } catch { console.log('   (capa nao baixada, seguindo sem imagem nova)'); }
      }

      const md = buildFrontmatter(pauta, metaDescription(pauta, intro), imgWeb, iso) + '\n\n' + body + '\n';

      if (DRY) {
        console.log('   [dry-run] nao gravado');
      } else {
        fs.writeFileSync(path.join(BLOG_DIR, `${pauta.slug}.md`), md, 'utf8');
        const touched = linkBackToNewPost(corpus.map((c) => c.file), pauta, fs);
        console.log(`   PUBLICADO | linkagem retroativa em ${touched.length} artigo(s)`);
        markStatus(queue, pauta.slug, 'publicado', { publishedAt: iso });
        saveQueue(queue);
      }
      published++;
    } catch (err) {
      console.log(`   ERRO: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nPublicados: ${published} | Pulados: ${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
