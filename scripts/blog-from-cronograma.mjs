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

import { loadQueue, saveQueue, markStatus, buildOutline, escolherTemplate } from './lib/cronograma.mjs';
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
// Endereco do provedor em variavel, nao no codigo: DeepSeek e OpenAI falam o
// mesmo formato, entao trocar de fornecedor vira configuracao. A DeepSeek NAO
// publica versao datada (o /models so lista deepseek-v4-flash e -pro), entao
// nao da pra fixar versao — o identificador muda de comportamento sozinho,
// como em 25/07 e 31/07/2026. Dai a verificacao de modelo no arranque.
const BASE_URL = (process.env.LLM_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i > -1 ? argv[i + 1] : d; };
const DRY = has('--dry-run');
const COUNT = parseInt(val('--count', '1'), 10);
const ONLY = val('--slug', null);
// Regeracao de artigo JA publicado. Os 57 textos anteriores a 04/08/2026
// sairam com template errado (tutorial sem passo a passo) e cliche; nenhum
// deles se conserta com regex. Rodando 1 por execucao junto com o artigo
// novo, o acervo se refaz em ~3 semanas sem rajada de API. Com --count N
// da pra fazer em lote quando houver pressa.
const REWRITE = has('--rewrite');

if (!KEY) { console.error('DEEPSEEK_API_KEY nao definida em .env.local'); process.exit(1); }

// ----------------------------------------------------------------- prompts

const VOICE = `Voce e um redator brasileiro que trabalha com eletrodomestico ha anos e escreve pro blog do melhorlavaeseca.com.

COMO VOCE ESCREVE:
- Portugues brasileiro com acentuacao completa e correta. Isso e inegociavel.
- Primeira pessoa, tom de conversa, como quem explica pra um amigo. Pode usar expressao coloquial brasileira sem exagero.
- Frases de tamanho variado. Alterne periodo curto e longo: texto com todas as frases do mesmo tamanho soa robotico.
- PARAGRAFO CURTO, regra critica: 2 ou 3 frases, entre 180 e 320 caracteres.
  NUNCA passe de 340 caracteres. A maioria le no celular, e bloco grande de
  texto faz o leitor desistir. Na duvida, quebre em dois. Paragrafo de uma
  frase so, isolado, tambem funciona bem e cria respiro.
- Concreto sempre: exemplo e situacao real. Numero exato, SO quando ele veio na lista de modelos fornecida. Se voce nao tem o numero, seja concreto pelo cenario ("um edredom de casal precisa de duas levas pra secar") — nunca invente valor.

O QUE VOCE NUNCA FAZ:
- Nunca copie nem parafraseie texto de outro site. Escreva do zero, com seu proprio angulo.
- Nunca repita a palavra-chave de forma mecanica. Ela deve aparecer naturalmente; se a frase ficar estranha, use sinonimo ou pronome.
- Nunca use estas formulas, medidas como vicio recorrente no proprio blog:
  "a boa noticia e que", "neste guia vou te mostrar", "o segredo esta em",
  "vale ressaltar/destacar que", "e importante destacar", "nao e a toa que",
  "em suma", "dito isso", "por fim", "afinal de contas", "receita para
  desastre", "e ai que mora o perigo", "desempenha um papel crucial",
  "no fim das contas", "a verdade e que", "em um mundo cada vez mais".
- Nao abra dois paragrafos seguidos com a mesma palavra, e nao abra o texto
  com "Voce": os 59 artigos ja publicados abrem assim e fica evidente.
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

// Intencoes que prometem ensinar e portanto precisam de passo a passo real.
const ENSINA = new Set(['guia', 'informativo']);

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

${section.steps ? `FORMATO OBRIGATORIO DESTA SECAO — LISTA NUMERADA:
Esta secao NAO pode ser texto corrido. Ela e um procedimento e sai assim:

1. **Verbo no imperativo abrindo o passo.** Uma ou duas frases dizendo
   exatamente o que fazer e o que observar depois de fazer.
2. **Proximo passo.** Idem.

Regras: no minimo 5 passos, numerados com "1. ", "2. " no inicio da linha,
na ordem em que a pessoa executa. Cada passo diz QUAL ajuste, QUAL programa,
QUAL limite — "escolha o programa certo" nao e passo, "selecione o ciclo
sinteticos, que trabalha abaixo de 60 graus" e passo. Antes da lista, no
maximo um paragrafo curto de contexto. Depois dela, nada.

` : ''}O QUE ESTA SECAO DEVE COBRIR:
${section.guide}

TAMANHO: entre ${Math.round(section.words * 0.85)} e ${section.words} palavras. Nao ultrapasse o limite superior — texto inflado para bater tamanho fica repetitivo e o leitor abandona.

${written.length ? `O QUE JA FOI DITO NO ARTIGO (nao repita nem reintroduza nada disso;
se um ponto ja apareceu, siga em frente em vez de reformular):
${written.map((w) => '- ' + w.h2 + ' | ja cobriu: ' + w.resumo).join('\n')}

Se depois de descontar tudo isso a secao nao tiver conteudo NOVO suficiente
pro tamanho pedido, escreva MENOS. Texto curto e novo vale mais do que texto
no tamanho cheio repetindo o que ja foi dito.` : 'Esta e a primeira secao do corpo.'}

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

/**
 * Modos de abertura da introducao, sorteados de forma estavel por slug.
 * Sem isto TODOS os 59 artigos publicados abriam com "Voce coloca a roupa...",
 * "Voce acabou de lavar...", "Voce ja passou por isso..." — a mesma jogada em
 * todo texto e o sinal mais visivel de conteudo gerado em serie.
 */
const ABERTURA = [
  '- ABERTURA: comece pelo CUSTO do problema — o que a pessoa perde (tempo, dinheiro, a peca de roupa) por nao saber isso. Nada de "voce".',
  '- ABERTURA: comece por uma crenca comum que esta ERRADA, e corrija na frase seguinte. Nao comece com "voce".',
  '- ABERTURA: comece respondendo a pergunta do titulo em UMA frase seca, e so depois contextualize. Nao comece com "voce".',
  '- ABERTURA: comece por uma cena concreta de casa, em terceira pessoa ou primeira do singular. Nao comece a primeira frase com "voce".',
  '- ABERTURA: comece pela duvida exata que leva a pessoa a pesquisar isso, formulada como ela pensaria. Nao comece com "voce".',
  '- ABERTURA: comece por um contraste ("parece X, mas na pratica e Y"). Nao comece com "voce".',
];

function hashTxt(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}

function introPrompt(pauta) {
  return `ARTIGO: "${pauta.title}"
PALAVRA-CHAVE PRINCIPAL: "${pauta.keyword}"

Escreva APENAS a introducao do artigo, entre 120 e 180 palavras.

REGRAS:
${ABERTURA[hashTxt(pauta.slug || pauta.keyword) % ABERTURA.length]}
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
      const r = await fetch(`${BASE_URL}/chat/completions`, {
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
      if (!r.ok) throw new Error(`LLM ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const data = await r.json();
      const msg = data.choices?.[0]?.message || {};
      const c = msg.content?.trim();
      if (!c) {
        // Diagnostico explicito em vez de "resposta vazia": se veio raciocinio
        // no lugar do texto, o modelo voltou a raciocinar por padrao e o
        // reasoning_effort deixou de ser respeitado. Sem essa mensagem o log
        // nao diz o motivo e a investigacao recomeca do zero.
        throw new Error(
          msg.reasoning_content
            ? `modelo devolveu raciocinio (${msg.reasoning_content.length} chars) e texto vazio — reasoning_effort ignorado?`
            : 'resposta vazia'
        );
      }
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
// 340 e nao 420: o prompt pede 180-320 caracteres, mas o divisor so agia
// acima de 420, entao a faixa 320-420 passava batido — 25% dos paragrafos
// publicados ficaram acima do alvo e a redatora apontou "paragrafos grandes".
const PARA_MAX = 340;

/**
 * Resumo do que a secao ja disse, pra alimentar o prompt da proxima.
 * Primeira frase de cada paragrafo: e ali que o assunto e anunciado.
 */
function resumirSecao(md) {
  return md
    .split('\n\n')
    .map((b) => b.trim())
    .filter((b) => b && !/^[#|>\-*`]/.test(b))
    .map((b) => (b.match(/^[^.!?]+[.!?]/) || [b])[0].trim())
    .join(' ')
    .slice(0, 400);
}

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
/**
 * Cliches medidos no proprio acervo, nao lista generica da internet: cada um
 * destes foi contado nos 59 artigos publicados. "a boa noticia e que" aparecia
 * em 26 artigos, "neste guia vou te mostrar" em 28, "o segredo esta em" se
 * repetia duas vezes no MESMO texto. Pedir no prompt nao basta — o modelo
 * concorda e usa assim mesmo, entao vira reprovacao no portao.
 */
const CLICHES = [
  /a boa not[ií]cia [eé] que/gi,
  /neste guia vou te mostrar/gi,
  /vou te mostrar (o que|como)/gi,
  /o segredo est[aá] em/gi,
  /vale (ressaltar|destacar|lembrar) que/gi,
  /[ée] (importante|fundamental) (destacar|ressaltar|lembrar)/gi,
  /n[aã]o [eé] [aà] toa que/gi,
  /em um mundo cada vez mais/gi,
  /(em suma|dito isso|por fim,|afinal de contas)/gi,
  /receita para (o )?desastre/gi,
  /[eé] a[ií] que mora o perigo/gi,
  /desempenha um papel (crucial|fundamental|importante)/gi,
  /pois bem,/gi,
  /espero (ter ajudado|que este)/gi,
  /(fica a dica|no fim das contas|a verdade [eé] que)/gi,
];

function acharCliches(texto) {
  const achados = [];
  for (const re of CLICHES) {
    const m = texto.match(re);
    if (m) achados.push(`"${m[0].toLowerCase()}"${m.length > 1 ? ` (${m.length}x)` : ''}`);
  }
  return achados;
}

/**
 * Remove por codigo os cliches mecanicos, em vez de reprovar o artigo inteiro
 * por causa deles. No lote de 04/08/2026, 2 das 5 reprovacoes foram so por
 * "a boa not[ií]cia [eé] que" e "vou te mostrar" — o modelo ignora a proibicao do
 * prompt, mas as duas formulas aparecem em posicao previsivel e saem sem
 * estragar a frase. O que sobrar ainda cai no portao.
 */
function limparCliches(md) {
  let out = md;
  out = out.replace(/\s*[—-]?\s*\be a boa not[ií]cia [eé] que,?\s*/gi, '. ');
  out = out.replace(/\bA boa not[ií]cia [eé] que,?\s*/gi, '');
  out = out.replace(/\bNeste guia,?\s*vou te mostrar\b/gi, 'Aqui você vai ver');
  out = out.replace(/\bvou te mostrar\b/gi, 'você vai ver');
  out = out.replace(/\bNo fim das contas,?\s*/gi, '');
  // As substituicoes acima podem deixar ".." ou minuscula abrindo frase.
  out = out.replace(/\.\s*\./g, '.');
  out = out.replace(/([.!?]\s+)([a-zà-ü])/g, (m, a, c) => a + c.toUpperCase());
  // Cliche removido no comeco do paragrafo deixa a frase em minuscula.
  out = out.replace(/(^|\n\n)([a-zà-ü])/g, (m, a, c) => a + c.toUpperCase());
  return out;
}

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

  // A planilha entrega keyword SEM acento ("funcao desodorizar lava e seca")
  // e o texto escreve com acento ("função"), entao a contagem literal dava
  // zero e o artigo era reprovado por "palavra-chave nao aparece no texto"
  // mesmo falando dela o tempo todo. Compara sem diacritico dos dois lados.
  const semAcento = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const kwRe = new RegExp(semAcento(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const occurrences = (semAcento(body).match(kwRe) || []).length;
  const density = (occurrences * kw.split(/\s+/).length) / words * 100;
  // Faixa saudavel: 0,8% a 1,5%. Acima vira stuffing; muito abaixo, o Google
  // pode nao entender sobre o que a pagina e.
  if (density > 2.5) problems.push(`keyword stuffing: densidade ${density.toFixed(2)}%`);
  if (density < 0.45) problems.push(`palavra-chave sub-utilizada: densidade ${density.toFixed(2)}%`);
  if (occurrences === 0) problems.push('palavra-chave nao aparece no texto');

  const headings = body.split('\n').filter((l) => /^#{2,3}\s/.test(l));
  if (headings.length < 4) problems.push(`poucos subtitulos: ${headings.length}`);
  const kwInHeading = headings.some((h) => semAcento(h).includes(semAcento(kw)));
  if (!kwInHeading) problems.push('nenhum H2/H3 contem a palavra-chave');

  // Pauta de guia/informativo promete ensinar. Sem lista numerada, o texto
  // vira dissertacao sobre o assunto — foi a queixa da redatora, "os tutoriais
  // so enrolam e nao ensinam nada". Exigir os passos e a unica checagem
  // objetiva possivel: ou existe procedimento, ou nao existe.
  if (ENSINA.has(pauta.intent)) {
    const passos = (body.match(/^\s*\d+[.)]\s+\S/gm) || []).length;
    if (passos < 4) problems.push(`tutorial sem passo a passo: ${passos} passos numerados, esperado 4`);
  }

  const cliches = acharCliches(body);
  if (cliches.length >= 2) problems.push(`cliche de IA: ${cliches.join(', ')}`);

  if (!linkReport.home) problems.push('sem link para a home com ancora da palavra-chave');

  // A meta de 10-15 links so e alcancavel quando ja existe acervo pra apontar.
  // Nos primeiros artigos, exigir isso reprovaria texto bom por falta de destino.
  const linkTarget = linkTargetFor(corpusSize);
  if (linkReport.count < linkTarget) {
    problems.push(`links internos insuficientes: ${linkReport.count}, esperado ${linkTarget}`);
  }

  // Paragrafo gigante = leitura ruim no mobile. O divisor automatico mira 420,
  // entao o portao aqui e so rede de seguranca pro que escapou.
  // Bloco de lista numerada nao e paragrafo: o item e que precisa ser curto.
  // O divisor automatico ja pula listas, e o portao contava o bloco inteiro —
  // um passo a passo bem escrito era reprovado por "paragrafo gigante".
  const blocos = body.split('\n\n').map((b) => b.trim()).filter(Boolean);
  // Passo numerado pode ser um pouco mais longo que paragrafo corrido: ele
  // carrega a instrucao e o que observar depois de executar.
  const MAX_PROSA = PARA_MAX + 80;
  const MAX_PASSO = PARA_MAX + 160;
  const longP = [];
  for (const b of blocos) {
    const ehLista = /^\d+[.)]\s/.test(b);
    const partes = ehLista ? b.split('\n').map((l) => l.trim()) : [b];
    const limite = ehLista ? MAX_PASSO : MAX_PROSA;
    for (const t of partes) if (!/^[#|>\-*`]/.test(t) && t.length > limite) longP.push(t);
  }
  if (longP.length) problems.push(`${longP.length} trecho(s) longo(s) demais (limite ${MAX_PROSA} em texto, ${MAX_PASSO} em passo)`);

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
    // O bloco final de links e montado por codigo a partir de titulos de
    // outros artigos: nao passou pelo modelo, entao nao diz nada sobre a
    // acentuacao dele. Sem isto, variar o H2 do bloco quebrava o portao.
    if (/^##\s/.test(bloco) && /^\s*-\s*\[/m.test(bloco) && !/[.!?]\s/.test(bloco)) continue;
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
/**
 * Corte de emergencia da meta description: para na ultima palavra que cabe,
 * descarta palavra funcional pendurada no fim e fecha com ponto. Sem isto a
 * descricao saia truncada no meio da ideia ("...serve na sua prima de"), que e
 * o texto que aparece embaixo do titulo no Google.
 */
const PENDURADAS = new Set(['de','da','do','das','dos','e','ou','que','para','com','em','na','no','nas','nos','a','o','as','os','um','uma','se','por','ao','aos','pra','mas','como','sua','seu','minha','meu']);

function cortarLimpo(texto, max) {
  let t = texto.slice(0, max).replace(/\s+\S*$/, '').trim();
  let palavras = t.split(/\s+/);
  while (palavras.length > 1 && PENDURADAS.has(palavras[palavras.length - 1].toLowerCase().replace(/[^a-z\u00e0-\u00fc]/g, ''))) {
    palavras.pop();
  }
  t = palavras.join(' ').replace(/[,;:\s-]+$/, '');
  return /[.!?]$/.test(t) ? t : t + '.';
}

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
  d = resto ? abertura + resto : abertura + cortarLimpo(base, META_MAX - abertura.length);
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
    // Antes ia so o TITULO da secao pro prompt seguinte: o modelo era mandado
    // "nao repita" sem saber o que havia sido dito, e repetia. Agora vai a
    // frase de abertura de cada paragrafo, que e onde o assunto e anunciado.
    written.push({ h2: s.h2, resumo: resumirSecao(md) });
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

  body = limparCliches(body);
  const check = validate(body, pauta, report, corpus.length);
  console.log(`   -> ${check.words} palavras | densidade ${check.density.toFixed(2)}% | ${report.count} links | ${check.headings} subtitulos`);

  return { body, intro, check, report };
}

/**
 * Confere, antes de gerar, se o modelo configurado ainda existe e se responde
 * com TEXTO. As duas paradas do blog teriam sido pegas aqui em segundos:
 * em 25/07 o identificador foi aposentado, em 31/07 o modelo passou a devolver
 * so raciocinio. Sem isso a execucao descobre o problema pauta por pauta.
 */
async function conferirModelo() {
  try {
    const r = await fetch(`${BASE_URL}/models`, { headers: { Authorization: `Bearer ${KEY}` } });
    if (r.ok) {
      const ids = ((await r.json()).data || []).map((m) => m.id);
      if (ids.length && !ids.includes(MODEL)) {
        throw new Error(`modelo "${MODEL}" nao existe mais. Disponiveis: ${ids.join(', ')}`);
      }
    }
  } catch (err) {
    if (/nao existe mais/.test(err.message)) throw err;
    console.log(`   (nao deu pra listar modelos: ${err.message})`);
  }

  const teste = await ask([{ role: 'user', content: 'Responda apenas: ok' }], 50);
  console.log(`   modelo ${MODEL} respondendo ("${teste.slice(0, 20)}")`);
}

/**
 * Diagnostico de um artigo ja publicado: cliche e ausencia de passo a passo
 * sao os dois defeitos que so a regeracao resolve. Quanto maior a nota, pior.
 */
function notaDeDefeito(md, intent) {
  const cliches = acharCliches(md).length;
  const passos = (md.match(/^[ ]*[0-9]+[.)][ ]+\S/gm) || []).length;
  const semPassos = ENSINA.has(intent) && passos < 4;
  return cliches * 2 + (semPassos ? 5 : 0);
}

/** Escolhe o proximo artigo publicado a regerar: o mais defeituoso primeiro. */
function proximoParaRegerar(queue, jaTentados) {
  const candidatos = [];
  for (const pauta of queue.items) {
    if (pauta.status !== 'publicado' || jaTentados.has(pauta.slug)) continue;
    const file = path.join(BLOG_DIR, pauta.slug + '.md');
    if (!fs.existsSync(file)) continue;
    const md = fs.readFileSync(file, 'utf8');
    let nota = notaDeDefeito(md, escolherTemplate(pauta));
    // Artigo reprovado na regeracao mantinha a mesma nota e era reescolhido na
    // execucao seguinte, pra sempre — um texto que o modelo nao consegue
    // acertar travaria a fila e os outros 45 nunca chegariam a vez. Cada
    // fracasso rebaixa a prioridade; ao terceiro, sai da fila.
    const fracassos = pauta.rewriteFails || 0;
    if (fracassos >= 3) continue;
    nota -= fracassos * 3;
    if (nota > 0) candidatos.push({ pauta, nota, file, md });
  }
  candidatos.sort((a, b) => b.nota - a.nota);
  return candidatos[0] || null;
}

/**
 * Regenera um artigo publicado no lugar. Preserva slug, capa e a data de
 * PUBLICACAO — so marca `updated`, que e o campo que o sitemap usa como
 * lastmod. Assim o Google rebusca sem que o artigo finja ser novo nem embaralhe
 * a ordem da listagem.
 */
async function regerarUm(queue, jaTentados) {
  const alvo = proximoParaRegerar(queue, jaTentados);
  if (!alvo) { console.log('  Nenhum artigo publicado precisa de regeracao.'); return false; }
  jaTentados.add(alvo.pauta.slug);

  const catalog = loadCatalog();
  const cover = checkCoverage(alvo.pauta, catalog);
  console.log(`\n  REGERANDO "${alvo.pauta.title}" (nota de defeito ${alvo.nota})`);

  const corpus = readCorpus();
  const { body, intro, check } = await generate(alvo.pauta, corpus, cover.models || []);
  if (!check.ok) {
    console.log(`   REPROVADO na regeracao, artigo antigo mantido: ${check.problems.join('; ')}`);
    markStatus(queue, alvo.pauta.slug, 'publicado', {
      rewriteFails: (alvo.pauta.rewriteFails || 0) + 1,
      rewriteProblems: check.problems,
    });
    saveQueue(queue);
    return false;
  }

  const original = alvo.md;
  const dataPub = (original.match(/^date:\s*"([^"]+)"/m) || [])[1] || new Date().toISOString();
  const imagem = (original.match(/^image:\s*"([^"]+)"/m) || [])[1] || null;
  const agora = new Date().toISOString().replace(/\.\d\d\dZ$/, '-03:00');

  const description = await metaDescription(alvo.pauta, intro);
  let fm = buildFrontmatter(alvo.pauta, description, imagem, dataPub);
  fm = fm.replace(/\n---$/, `\nupdated: "${agora}"\n---`);

  fs.writeFileSync(alvo.file, fm + '\n\n' + body + '\n', 'utf8');
  console.log(`   REGERADO | ${check.words} palavras | ${check.problems.length} problema(s)`);
  markStatus(queue, alvo.pauta.slug, 'publicado', { rewrittenAt: agora, rewriteFails: 0 });
  saveQueue(queue);
  return true;
}

async function main() {
  await conferirModelo();
  const queue = loadQueue();
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.mkdirSync(IMG_DIR, { recursive: true });

  if (REWRITE) {
    const jaTentados = new Set();
    let feitos = 0;
    for (let i = 0; i < COUNT; i++) {
      if (await regerarUm(queue, jaTentados)) feitos++;
    }
    console.log(`
Regerados: ${feitos} de ${COUNT} tentativa(s)`);
    return;
  }

  const catalog = loadCatalog();
  let published = 0, skipped = 0;
  const tried = new Set();

  // Quando a falha e sistemica (API fora do ar, modelo renomeado, portao
  // quebrado), o laco abaixo percorria as ~200 pautas pendentes tentando uma
  // a uma ate o job estourar os 25 min do workflow e ser cancelado — e cada
  // volta ainda marcava a pauta como reprovada. Tres tombos seguidos ja
  // provam que o problema nao e da pauta.
  // Dois limites diferentes de proposito. Erro de API e sistemico: 3 tombos
  // ja provam que o provedor esta fora, e insistir so queima os 25 min do job.
  // Reprovacao no portao e por pauta — o texto e gerado de novo a cada
  // tentativa e a pauta seguinte pode passar tranquilamente. Com o limite
  // unico de 3, uma sequencia azarada de reprovacoes fazia a execucao terminar
  // sem publicar nada, e era isso que derrubava a media de 3 artigos por dia.
  const MAX_ERROS_API = 3;
  const MAX_REPROVACOES = 6;
  let errosApi = 0;
  let reprovacoes = 0;
  let abortouPorErroDeApi = false;

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
        reprovacoes++;
        if (reprovacoes >= MAX_REPROVACOES) {
          console.log(`\n  Abortando: ${reprovacoes} reprovacoes seguidas indicam problema geral, nao da pauta.`);
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
      errosApi = 0;
      reprovacoes = 0;
    } catch (err) {
      console.log(`   ERRO: ${err.message}`);
      skipped++;
      errosApi++;
      if (errosApi >= MAX_ERROS_API) {
        console.log(`\n  Abortando: ${errosApi} erros seguidos (provavel falha de API, nao das pautas).`);
        abortouPorErroDeApi = true;
        break;
      }
    }
  }

  console.log(`\nPublicados: ${published} | Pulados: ${skipped}`);

  // Sair com sucesso quando a API esta fora esconde a quebra: o workflow fica
  // verde, ninguem recebe aviso e o blog passou 4 dias parado (31/07 a 03/08)
  // sem ninguem perceber. Falha de API derruba a execucao de proposito, pro
  // GitHub notificar. Reprovacao no portao nao: aquilo e rotina editorial.
  if (abortouPorErroDeApi && published === 0) {
    throw new Error('nenhum artigo publicado: a API do modelo falhou em todas as tentativas');
  }
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
