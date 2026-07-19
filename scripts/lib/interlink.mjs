/**
 * Linkagem interna automatica.
 *
 * Regra de ouro (definida pelo cliente): a ancora precisa ter relacao
 * semantica real com o destino. Nunca linkar palavra qualquer so pra bater
 * cota. Por isso os links NAO sao pedidos ao modelo (ele inventaria URLs):
 * sao injetados aqui, casando termos que de fato aparecem no texto com
 * destinos que de fato existem.
 *
 * Todo artigo recebe:
 *   1. um link pra home com ancora contendo a palavra-chave principal
 *      ("melhor lava e seca" + adjetivo, ou adjetivo + "melhor lava e seca");
 *   2. pelo menos um link pra pagina/artigo relacionado;
 *   3. de 10 a 15 links internos no total, quando houver destino coerente.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Le slug + nome dos produtos direto do arquivo-fonte.
 *
 * Nao da pra `import` products.js aqui: sem "type": "module" no package.json
 * o Node resolve o .js como CommonJS e o named export falha. Parsear o texto
 * evita duplicar a lista (que sairia do ar assim que os produtos mudassem).
 */
function loadProducts() {
  const file = path.resolve(__dirname, '..', '..', 'src', 'content', 'products.js');
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, 'utf8');
  const out = [];
  const re = /slug:\s*'([^']+)'[\s\S]{0,400}?name:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) out.push({ slug: m[1], name: m[2] });
  return out;
}

const products = loadProducts();

const MAX_LINKS = 15;
const MIN_LINKS = 10;

/** Ancoras naturais pra home. Da mais especifica pra mais generica. */
const HOME_ANCHORS = [
  /\ba melhor lava e seca do mercado\b/i,
  /\bmelhores lava e seca do mercado\b/i,
  /\bmelhor lava e seca do mercado\b/i,
  /\bmelhor lava e seca custo-benefício\b/i,
  /\bmelhor lava e seca para apartamento\b/i,
  /\bmelhor lava e seca econômica\b/i,
  /\bmelhor lava e seca silenciosa\b/i,
  /\bmelhores lava e seca\b/i,
  /\bmelhor lava e seca\b/i,
];

/** Secoes da home, com termos que legitimamente as descrevem. */
const HOME_SECTIONS = [
  { url: '/#ranking', phrases: [/\branking (?:completo|atualizado|de lava e seca)\b/i, /\bnosso ranking\b/i] },
  { url: '/#guia', phrases: [/\bguia de compra\b/i] },
  { url: '/#comparativo', phrases: [/\btabela comparativa\b/i, /\bcomparativo completo\b/i] },
];

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Percorre o markdown linha a linha aplicando `fn` so nas linhas "linkaveis":
 * fora de heading, de bloco de codigo e de frontmatter.
 */
function mapLinkableLines(md, fn) {
  const lines = md.split('\n');
  let inCode = false;
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) { inCode = !inCode; return line; }
      if (inCode) return line;
      if (/^\s*#{1,6}\s/.test(line)) return line;   // heading
      if (/^\s*$/.test(line)) return line;
      return fn(line);
    })
    .join('\n');
}

/** Substitui a 1a ocorrencia de `re` fora de link ja existente. */
function linkFirst(md, re, url, state) {
  if (state.done) return md;
  return mapLinkableLines(md, (line) => {
    if (state.done) return line;
    // Divide a linha em trechos dentro/fora de links markdown, pra nao
    // aninhar link dentro de link.
    const parts = line.split(/(\[[^\]]*\]\([^)]*\))/g);
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) continue;                  // trecho que ja e link
      const m = parts[i].match(re);
      if (!m) continue;
      parts[i] = parts[i].replace(re, `[${m[0]}](${url})`);
      state.done = true;
      break;
    }
    return parts.join('');
  });
}

/**
 * Injeta os links internos no corpo do artigo.
 *
 * @param {string} body      markdown do artigo (sem frontmatter)
 * @param {object} pauta     pauta atual (pra nao auto-linkar)
 * @param {Array}  corpus    [{slug, keyword, title}] dos artigos ja publicados
 */
export function addInternalLinks(body, pauta, corpus = []) {
  let out = body;
  let count = 0;
  const report = { home: false, targets: [] };

  // 1. Home com ancora contendo a palavra-chave principal (obrigatorio).
  for (const re of HOME_ANCHORS) {
    const state = { done: false };
    const next = linkFirst(out, re, '/', state);
    if (state.done) { out = next; count++; report.home = true; break; }
  }

  // Nem todo artigo diz "melhor lava e seca" naturalmente — um texto sobre
  // centrifugacao ou mofo no tambor pode nunca usar a expressao. Nesse caso a
  // ancora entra numa frase de fechamento que faz sentido no contexto, em vez
  // de ser forcada no meio do texto.
  if (!report.home) {
    const fecho = `\n\nAinda está escolhendo qual aparelho levar pra casa? Vale conferir o ranking com [a melhor lava e seca do mercado](/) antes de decidir.`;
    out = out + fecho;
    count++;
    report.home = true;
    report.homeFallback = true;
  }

  // 2. Artigos ja publicados: a ancora e a propria keyword do artigo alvo,
  //    entao a relacao semantica e garantida por construcao.
  const related = corpus
    .filter((c) => c.slug !== pauta.slug)
    .sort((a, b) => b.keyword.length - a.keyword.length); // mais especifico 1o

  for (const art of related) {
    if (count >= MAX_LINKS) break;
    const state = { done: false };
    const re = new RegExp(`\\b${escapeRe(art.keyword)}\\b`, 'i');
    const next = linkFirst(out, re, `/blog/${art.slug}/`, state);
    if (state.done) { out = next; count++; report.targets.push(art.slug); }
  }

  // 3. Modelos citados -> ancora do produto na home.
  for (const p of products) {
    if (count >= MAX_LINKS) break;
    const state = { done: false };
    const re = new RegExp(`\\b${escapeRe(p.name)}\\b`, 'i');
    const next = linkFirst(out, re, `/#${p.slug}`, state);
    if (state.done) { out = next; count++; report.targets.push(p.slug); }
  }

  // 4. Secoes da home, se o texto mencionar naturalmente.
  for (const sec of HOME_SECTIONS) {
    if (count >= MAX_LINKS) break;
    for (const re of sec.phrases) {
      const state = { done: false };
      const next = linkFirst(out, re, sec.url, state);
      if (state.done) { out = next; count++; report.targets.push(sec.url); break; }
    }
  }

  report.count = count;
  report.enough = count >= MIN_LINKS;
  return { body: out, report };
}

/**
 * Secao "Leia tambem" no fim do artigo. So entra destino com relacao real:
 * artigos que compartilham termo com a pauta atual, mais a home.
 */
export function buildLeiaTambem(pauta, corpus = []) {
  const stop = new Set(['lava', 'seca', 'e', 'a', 'o', 'de', 'da', 'do', 'para', 'com', 'em', 'qual']);
  const mine = new Set(
    pauta.keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !stop.has(w))
  );

  const scored = corpus
    .filter((c) => c.slug !== pauta.slug)
    .map((c) => {
      const theirs = c.keyword.toLowerCase().split(/\s+/).filter((w) => !stop.has(w));
      const shared = theirs.filter((w) => mine.has(w)).length;
      return { ...c, shared };
    })
    .filter((c) => c.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 5);

  const lines = ['## Leia também', ''];
  for (const c of scored) lines.push(`- [${c.title}](/blog/${c.slug}/)`);
  lines.push(`- [Ranking das melhores lava e seca do mercado](/)`);
  return lines.join('\n');
}

/**
 * Linkagem RETROATIVA: percorre os artigos ja publicados e transforma a
 * primeira mencao nao-linkada da keyword nova em link pro artigo novo.
 *
 * Substitui o processo manual de buscar `site:dominio "keyword"` no Google:
 * como temos o corpus local inteiro, da pra fazer direto.
 *
 * @returns {string[]} caminhos dos arquivos alterados
 */
export function linkBackToNewPost(files, newPost, fs) {
  const touched = [];
  const re = new RegExp(`\\b${escapeRe(newPost.keyword)}\\b`, 'i');

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const split = raw.indexOf('\n---', 4);
    if (split === -1) continue;
    const fm = raw.slice(0, split + 4);
    let body = raw.slice(split + 4);

    if (body.includes(`/blog/${newPost.slug}/`)) continue;   // ja aponta
    const state = { done: false };
    body = linkFirst(body, re, `/blog/${newPost.slug}/`, state);
    if (!state.done) continue;

    fs.writeFileSync(file, fm + body, 'utf8');
    touched.push(file);
  }
  return touched;
}
