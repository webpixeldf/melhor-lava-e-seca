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

import { loadQueue, saveQueue, markStatus, buildOutline } from './lib/cronograma.mjs';
import {
  addInternalLinks,
  buildLeiaTambem,
  linkBackToNewPost,
  linkTargetFor,
  countInternalLinks,
} from './lib/interlink.mjs';
import {
  fetchBlogCover,
  imageQueryFor,
  carregarUsadas,
  salvarUsadas,
} from './lib/unsplash.mjs';
import { fixAccents } from './lib/accents.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const IMG_DIR = path.join(ROOT, 'public', 'images', 'blog');
// Fotos ja usadas como capa, pra nao repetir a mesma imagem entre artigos.
const USADAS_FILE = path.join(ROOT, 'scripts', 'data', 'capas-usadas.json');

const KEY = process.env.DEEPSEEK_API_KEY;
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

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
- Concreto sempre: exemplo e situacao real. Numero exato, SO quando ele veio na lista de modelos fornecida. Se voce nao tem o numero, seja concreto pelo cenario ("um edredom de casal precisa de duas levas pra secar") — nunca invente valor.

O QUE VOCE NUNCA FAZ:
- Nunca copie nem parafraseie texto de outro site. Escreva do zero, com seu proprio angulo.
- Nunca repita a palavra-chave de forma mecanica. Ela deve aparecer naturalmente; se a frase ficar estranha, use sinonimo ou pronome.
- Nunca use enchimento: "vale ressaltar que", "e importante destacar", "em um mundo cada vez mais", "sem duvida alguma".
- Nunca abra secao com definicao de dicionario.
- Nunca escreva conclusao generica tipo "espero ter ajudado" ou "em suma".
- Nunca cite preco em reais. Diga para consultar o preco atualizado.
- Nunca cite numero de kWh, decibeis, rpm ou anos de garantia que nao esteja na lista de modelos fornecida. Sem o dado, fale qualitativamente ("gasta pouco", "quase nao vibra").
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
function loadCatalog() {
  const file = path.join(ROOT, 'src', 'content', 'products.js');
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, 'utf8');
  const out = [];
  const re = /name:\s*'([^']+)',\s*\n\s*brand:\s*'([^']+)'[\s\S]{0,1500}?capacityWash:\s*([\d.]+),[\s\S]{0,120}?capacityDry:\s*([\d.]+)/g;
  let m;
  while ((m = re.exec(src))) {
    out.push({ name: m[1], brand: m[2], wash: parseFloat(m[3]), dry: parseFloat(m[4]) });
  }
  return out;
}

// Marcas que existem no mercado mas (ainda) nao no catalogo. Se a pauta cita
// uma delas, a cobertura reprova em vez de deixar o artigo coroar uma Samsung
// como "melhor Philco" — exatamente o que saiu publicado em 22/07/2026.
const MARCAS_FORA = ['philco', 'tcl', 'toshiba', 'panasonic', 'consul', 'wanke', 'mueller', 'eos', 'gree', 'daewoo'];

/**
 * Cobertura de catalogo da pauta. Ranking/review/comparativo so podem citar
 * modelo real, entao:
 *   - pauta de marca -> so modelos DAQUELA marca; nenhum -> pula a pauta;
 *   - pauta de capacidade ("13kg") -> so modelos daquela faixa;
 *   - ranking com menos de 3 modelos cobertos nao e ranking honesto -> pula;
 *   - review de modelo que nao esta no catalogo -> pula.
 * Pauta pulada recebe status proprio na fila e a razao registrada, pra virar
 * decisao editorial (ampliar catalogo ou descartar a pauta) em vez de artigo ruim.
 */
function checkCoverage(pauta, catalog) {
  if (!NEEDS_CATALOG.has(pauta.intent)) return { ok: true, models: [] };

  const kw = ` ${pauta.keyword.toLowerCase()} `;
  const knownBrands = [...new Set([...catalog.map((c) => c.brand.toLowerCase()), ...MARCAS_FORA])];
  const brands = knownBrands.filter((b) => kw.includes(` ${b} `));

  let models = catalog;
  if (brands.length) {
    models = catalog.filter((c) => brands.includes(c.brand.toLowerCase()));
    if (!models.length) return { ok: false, reason: `marca sem produto no catalogo: ${brands.join(', ')}` };
  }

  const caps = [...pauta.keyword.matchAll(/(\d+(?:[.,]\d+)?)\s*kg/g)].map((m) => parseFloat(m[1].replace(',', '.')));
  if (caps.length) {
    models = models.filter((c) => caps.some((v) => Math.abs(c.wash - v) < 0.6));
    if (!models.length) return { ok: false, reason: `nenhum modelo de ${caps.join('/')}kg no catalogo` };
  }

  // Codigo de modelo na keyword ("wd11t", "pls11c"): precisa existir de verdade.
  const tokens = pauta.keyword.toLowerCase().match(/\b[a-z]{2,4}\d+\w*\b/g) || [];
  for (const t of tokens) {
    if (!models.some((c) => c.name.toLowerCase().includes(t))) {
      return { ok: false, reason: `modelo "${t}" nao esta no catalogo` };
    }
  }

  if (pauta.intent === 'ranking' && models.length < 3) {
    return { ok: false, reason: `apenas ${models.length} modelo(s) cobrem a pauta — ranking honesto precisa de 3+` };
  }
  if (pauta.intent === 'comparativo') {
    for (const b of brands) {
      if (!models.some((c) => c.brand.toLowerCase() === b)) {
        return { ok: false, reason: `comparativo sem modelo da marca ${b}` };
      }
    }
  }

  return { ok: true, models };
}

function catalogBlock(models) {
  if (!models.length) return '';
  const lines = models.map((c) => `- ${c.name} (lava ${c.wash}kg / seca ${c.dry}kg)`);
  return `\n\nMODELOS QUE VOCE PODE CITAR (os unicos — nao invente outros nem cite modelo de outra marca):\n${lines.join('\n')}`;
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

function sectionPrompt(pauta, section, index, total, written, catalogo) {
  const secundarias = themesFrom(pauta);
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
- REPETICAO DA PALAVRA-CHAVE: a expressao exata "${pauta.keyword}" pode
  aparecer NO MAXIMO 1 vez nesta secao (contando o subtitulo) — e somente
  onde encaixar com naturalidade absoluta. Se a frase precisar se contorcer
  pra caber a expressao, NAO use: prefira sinonimo ("a maquina", "o aparelho",
  "ela", "esse tipo de lavadora") ou simplesmente omita — o leitor ja sabe do
  que voce esta falando. Forcar a expressao inteira onde ela nao cabe e o erro
  que mais denuncia texto feito por IA (ex.: "essa e a melhor lava e seca X
  que cabe no bolso" falando de um modelo de outra marca).
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

/**
 * NAO troque o modelo pra deepseek-v4-pro sem mexer aqui: o pro raciocina
 * antes de responder, gasta o orcamento de max_tokens no raciocinio e devolve
 * `content` vazio — testado em 27/07/2026, falhou nas 3 tentativas da 1a secao.
 * O v4-flash tambem devolve vazio de vez em quando, dai as 5 tentativas.
 */
async function ask(messages, maxTokens = 4096) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.9,
          max_tokens: maxTokens,
          // Sem isto o v4 raciocina antes de responder: o raciocinio consome o
          // orcamento de tokens e `content` volta VAZIO. Foi o que derrubou a
          // publicacao entre 31/07 e 03/08/2026 — "resposta vazia" em todas as
          // tentativas. Medido: no padrao, content=0 chars e reasoning=1252.
          reasoning_effort: 'none',
          messages,
        }),
      });
      if (!r.ok) throw new Error(`DeepSeek ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const data = await r.json();
      const c = data.choices?.[0]?.message?.content?.trim();
      if (!c) throw new Error('resposta vazia');
      return c;
    } catch (err) {
      if (attempt === 5) throw err;
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

// A correcao de acentuacao mora em lib/accents.mjs (lista bem maior que a
// original: o modelo escapava com "nao", "voce", "ja", "pecas"... em secoes
// inteiras). O validate() ainda tem uma rede de seguranca por densidade de
// acentos pro que a lista nao cobrir.

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
  const linkTarget = linkTargetFor(corpusSize);
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

  // Consumo por ciclo com precisao falsa ("0,27 kWh", "0,23 kWh"): nao ha
  // fonte pra esse dado no catalogo, entao qualquer valor assim e inventado —
  // um exemplo de prompt antigo apareceu em 6 dos 8 primeiros artigos.
  if (/\b0,\d{1,2}\s*kwh/i.test(body)) {
    problems.push('consumo em kWh com precisao falsa (dado sem fonte no catalogo)');
  }

  // Secao praticamente sem acento = o modelo escreveu sem acentuacao e a
  // whitelist de accents.mjs nao cobriu tudo. Texto normal em portugues tem
  // ~2-4% de caracteres acentuados; abaixo de 0,25% e falha sistemica.
  for (const bloco of body.split(/\n(?=## )/)) {
    const texto = bloco.replace(/\|[^\n]*\|/g, '');
    if (texto.length < 400) continue;
    const acentuados = (texto.match(/[áàâãéêíóôõúç]/gi) || []).length;
    if (acentuados < texto.length / 400) {
      problems.push(`secao com acentuacao faltando: "${bloco.trim().slice(0, 48)}..."`);
      break;
    }
  }

  return { ok: problems.length === 0, problems, words, density, occurrences, headings: headings.length };
}

// ------------------------------------------------------------ frontmatter

const META_MIN = 140;
const META_MAX = 160;

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Junta frases inteiras ate o limite. Nunca corta no meio da frase. */
function frasesAte(texto, max) {
  const frases = texto.match(/[^.!?]+[.!?]+/g) || [];
  let out = '';
  for (const f of frases) {
    const proximo = (out ? `${out} ${f.trim()}` : f.trim());
    if (proximo.length > max) break;
    out = proximo;
  }
  return out;
}

function metaAceitavel(d, pauta) {
  return (
    d.length >= META_MIN &&
    d.length <= META_MAX &&
    d.toLowerCase().includes(pauta.keyword.toLowerCase()) &&
    !d.includes('...') &&
    !d.includes('…') &&
    !d.includes('\n')
  );
}

/**
 * Rede de seguranca pra quando o modelo nao entrega description na faixa.
 * Monta com frases INTEIRAS da introducao — cortar no meio da frase e o que
 * gerava aquele "..." no fim do snippet.
 */
function metaFallback(pauta, intro) {
  const base = intro.replace(/\s+/g, ' ').replace(/[#*_]/g, '').trim();

  let d = frasesAte(base, META_MAX);
  if (d.toLowerCase().includes(pauta.keyword.toLowerCase()) && d.length >= META_MIN) {
    return d.replace(/"/g, "'");
  }

  // Sem a keyword no trecho, abre com ela — mas como frase de verdade,
  // capitalizada, e nao como rotulo solto grudado na frente.
  const abertura = `${capitalizar(pauta.keyword)}: `;
  const resto = frasesAte(base, META_MAX - abertura.length);
  d = resto ? abertura + resto : abertura + base.slice(0, META_MAX - abertura.length).replace(/\s+\S*$/, '');
  return d.replace(/"/g, "'");
}

/**
 * Meta description escrita pelo modelo, validada em 140-160 caracteres.
 *
 * A versao anterior fatiava a introducao no braco e, quando a keyword nao caia
 * no pedaco, colava "keyword: " em minuscula na frente e cortava com
 * reticencias. Saia assim no Google:
 *   "melhor lava e seca samsung: Voce passou meia hora olhando o painel..."
 * Keyword solta em minuscula na frente e frase cortada no meio sao exatamente
 * o que o padrao de SEO proibe.
 */
function metaProblema(d, pauta) {
  if (d.length > META_MAX) return `Ficou com ${d.length} caracteres, ${d.length - META_MAX} acima do teto. Corte o que for acessorio`;
  if (d.length < META_MIN) return `Ficou com ${d.length} caracteres, ${META_MIN - d.length} abaixo do minimo. Acrescente um detalhe concreto`;
  if (!d.toLowerCase().includes(pauta.keyword.toLowerCase())) return `Faltou a palavra-chave "${pauta.keyword}". Encaixe ela de forma natural`;
  return 'Terminou cortada. Reescreva com frases completas';
}

async function metaDescription(pauta, intro) {
  const prompt = `ARTIGO: "${pauta.title}"
PALAVRA-CHAVE PRINCIPAL: "${pauta.keyword}"

INTRODUCAO DO ARTIGO:
${intro.slice(0, 900)}

Escreva a meta description desse artigo — o texto que aparece embaixo do
titulo no resultado do Google.

REGRAS:
- Entre ${META_MIN} e ${META_MAX} caracteres. Conte antes de responder: fora dessa faixa o Google corta.
- A palavra-chave "${pauta.keyword}" precisa aparecer, de forma natural.
- Uma ou duas frases COMPLETAS, terminando com ponto. Nunca corte com reticencias.
- Diga o que o leitor ganha lendo: promessa concreta, nao resumo generico.
- Sem aspas, sem markdown, sem quebra de linha.
- Responda SOMENTE com a meta description.`;

  // Pedir de novo do zero quase nao ajuda: num teste de 3 chamadas so uma caiu
  // na faixa (181, 152, 162 caracteres). Modelo nao conta caractere bem. Mostrar
  // a tentativa anterior e de quanto ela errou converge muito mais rapido.
  const messages = [{ role: 'system', content: VOICE }, { role: 'user', content: prompt }];

  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const raw = (await ask(messages, 300))
        .replace(/\s+/g, ' ')
        .replace(/^["'\s]+|["'\s]+$/g, '')
        .trim();
      if (metaAceitavel(raw, pauta)) return raw.replace(/"/g, "'");

      console.log(`      meta description com ${raw.length} chars, ajustando (tentativa ${tentativa}/3)`);
      messages.push({ role: 'assistant', content: raw });
      messages.push({
        role: 'user',
        content: `${metaProblema(raw, pauta)}. A nova versao precisa ter entre ${META_MIN} e ${META_MAX} caracteres, conter "${pauta.keyword}" e terminar em ponto final. Responda SOMENTE com a meta description corrigida.`,
      });
    } catch (err) {
      console.log(`      meta description falhou (${err.message}), usando a introducao`);
      break;
    }
  }
  return metaFallback(pauta, intro);
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
    `author: "Marcelo França"`,
    `keywords: [${kws.map(q).join(', ')}]`,
    // Sem capa baixada, o campo nao entra: apontar pra arquivo inexistente
    // rende imagem quebrada no artigo e no card da listagem.
    ...(image ? [`image: ${q(image)}`] : []),
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

async function generate(pauta, corpus, models = []) {
  const outline = buildOutline(pauta);
  const catalogo = catalogBlock(models);
  console.log(`\n  "${pauta.title}"`);
  console.log(`   /blog/${pauta.slug}/ | ${pauta.intent} | alvo ${pauta.targetWords}p | ${outline.length} secoes | ${models.length} modelo(s) no catalogo da pauta`);

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
      { role: 'user', content: sectionPrompt(pauta, s, i, outline.length, written, catalogo) },
    ], budget));

    if (looksTruncated(md)) {
      process.stdout.write('(truncou, refazendo) ');
      md = clean(await ask([
        { role: 'system', content: VOICE },
        { role: 'user', content: sectionPrompt(pauta, s, i, outline.length, written, catalogo) },
      ], 4096));
    }

    parts.push(md);
    written.push(s.h2);
    console.log(`${countWords(md)}p`);
  }

  let body = splitLongParagraphs(fixAccents(parts.join('\n\n')));

  const { body: linked, report } = addInternalLinks(body, pauta, corpus);

  // O "Leia tambem" fecha a diferenca entre o que o link inline conseguiu
  // encaixar e o que o portao exige — ver linkTargetFor/countInternalLinks.
  const faltam = linkTargetFor(corpus.length) - report.count;
  body = linked + '\n\n' + buildLeiaTambem(pauta, corpus, faltam);

  // O portao precisa contar o corpo MONTADO, senao ignora o bloco acima.
  report.count = countInternalLinks(body);

  const check = validate(body, pauta, report, corpus.length);
  console.log(`   -> ${check.words} palavras | densidade ${check.density.toFixed(2)}% | ${report.count} links | ${check.headings} subtitulos`);

  return { body, intro, check, report };
}

async function main() {
  const queue = loadQueue();
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const catalog = loadCatalog();
  let published = 0, skipped = 0;
  const tried = new Set();

  // Quando a falha e sistemica (API fora do ar, modelo renomeado, portao
  // quebrado), o laco abaixo percorria as ~200 pautas pendentes tentando uma
  // a uma ate o job estourar os 25 min do workflow e ser cancelado — e cada
  // volta ainda marcava a pauta como reprovada. Tres tombos seguidos ja
  // provam que o problema nao e da pauta.
  const MAX_FALHAS_SEGUIDAS = 3;
  let falhasSeguidas = 0;

  // Pauta sem cobertura de catalogo e PULADA (status registrado) e a fila
  // segue pra proxima: melhor a execucao publicar a pauta seguinte do que
  // sair um "ranking Philco" cheio de Samsung, ou nada.
  while (published < COUNT) {
    const pauta = ONLY
      ? queue.items.find((i) => i.slug === ONLY && !tried.has(i.slug))
      : queue.items.find((i) => i.status === 'pending' && !tried.has(i.slug));
    if (!pauta) {
      if (!tried.size) console.log(ONLY ? `Pauta "${ONLY}" nao encontrada.` : 'Nada pendente na fila.');
      break;
    }
    tried.add(pauta.slug);

    const cover = checkCoverage(pauta, catalog);
    if (!cover.ok) {
      console.log(`\n  "${pauta.title}"\n   PULADO (sem cobertura): ${cover.reason}`);
      if (!DRY && !ONLY) { markStatus(queue, pauta.slug, 'sem-cobertura', { problems: [cover.reason] }); saveQueue(queue); }
      skipped++;
      if (ONLY) break;
      continue;
    }

    const corpus = readCorpus();
    try {
      const { body, intro, check } = await generate(pauta, corpus, cover.models);

      if (!check.ok) {
        // Reprovacao na 1a tentativa nao descarta a pauta: o texto e gerado de
        // novo a cada execucao, e uma regressao passageira do modelo chegou a
        // queimar pautas boas em definitivo. So vira "reprovado" na 2a.
        const attempts = (pauta.attempts || 0) + 1;
        const definitivo = attempts >= 2;
        console.log(`   REPROVADO (tentativa ${attempts}${definitivo ? ', descartada' : ', volta pra fila'}): ${check.problems.join('; ')}`);
        if (!DRY) {
          markStatus(queue, pauta.slug, definitivo ? 'reprovado' : 'pending', {
            problems: check.problems,
            attempts,
          });
          saveQueue(queue);
        }
        skipped++;
        falhasSeguidas++;
        if (falhasSeguidas >= MAX_FALHAS_SEGUIDAS) {
          console.log(`\n  Abortando: ${falhasSeguidas} reprovacoes seguidas indicam problema geral, nao da pauta.`);
          break;
        }
        continue;
      }

      const iso = new Date().toISOString().replace(/\.\d{3}Z$/, '-03:00');
      const imgWeb = `/images/blog/${pauta.slug}.webp`;
      if (!DRY) {
        try {
          const usadas = carregarUsadas(USADAS_FILE);
          const capa = await fetchBlogCover(imageQueryFor(pauta), path.join(IMG_DIR, `${pauta.slug}.webp`), { usadas });
          if (capa?.photo?.id) {
            usadas[capa.photo.id] = pauta.slug;
            salvarUsadas(USADAS_FILE, usadas);
          }
        } catch { console.log('   (capa nao baixada, seguindo sem imagem nova)'); }
      }

      // Se a capa falhou, o frontmatter NAO pode apontar pro arquivo: o
      // template renderiza a tag e o leitor ve imagem quebrada — foi o que
      // aconteceu em "lava e seca separadas" (30/07/2026). Sem o campo, o
      // template simplesmente nao mostra imagem.
      const temCapa = DRY || fs.existsSync(path.join(IMG_DIR, `${pauta.slug}.webp`));

      const description = await metaDescription(pauta, intro);
      const md = buildFrontmatter(pauta, description, temCapa ? imgWeb : null, iso) + '\n\n' + body + '\n';

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
      falhasSeguidas = 0;
    } catch (err) {
      console.log(`   ERRO: ${err.message}`);
      skipped++;
      falhasSeguidas++;
      if (falhasSeguidas >= MAX_FALHAS_SEGUIDAS) {
        console.log(`\n  Abortando: ${falhasSeguidas} erros seguidos (provavel falha de API, nao das pautas).`);
        break;
      }
    }
  }

  console.log(`\nPublicados: ${published} | Pulados: ${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
