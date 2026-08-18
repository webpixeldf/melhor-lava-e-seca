#!/usr/bin/env node
/**
 * Retrofit dos artigos JA publicados.
 *
 * Corrige, sem chamar a API, o que da pra corrigir deterministicamente nos
 * textos que ja estao no ar:
 *   - paragrafo acima de PARA_MAX quebrado em dois (a queixa "paragrafos
 *     grandes": 25% do acervo estava acima do alvo);
 *   - subtitulo repetido entre dezenas de artigos trocado por variante
 *     (o mesmo H2 aparecia em 32 dos 59 textos);
 *   - bloco final de links regerado, pra variar titulo e ancora.
 *
 * O que NAO da pra consertar aqui: cliche e enrolacao, que exigem reescrever o
 * texto. Esses o script apenas RELATA, pra virar fila de regeracao.
 *
 * Uso:
 *   node scripts/retrofit-artigos.mjs --dry-run   # so relatorio
 *   node scripts/retrofit-artigos.mjs             # aplica
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { variarH2 } from './lib/cronograma.mjs';
import { buildLeiaTambem } from './lib/interlink.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'src', 'content', 'blog');
const DRY = process.argv.includes('--dry-run');

const NL = String.fromCharCode(10);
const PP = NL + NL;
const PARA_MAX = 340;

const CLICHES = [
  'a boa noticia e que', 'neste guia vou te mostrar', 'vou te mostrar',
  'o segredo esta em', 'vale ressaltar', 'vale destacar', 'e importante destacar',
  'nao e a toa que', 'em suma', 'dito isso', 'afinal de contas',
  'receita para desastre', 'e ai que mora o perigo', 'no fim das contas',
  'a verdade e que', 'em um mundo cada vez mais',
];
const semAcento = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Quebra paragrafo longo na fronteira de frase mais proxima do meio. */
function quebrar(bloco) {
  const t = bloco.trim();
  if (t.length <= PARA_MAX || /^[#|>*`-]/.test(t) || /^[0-9]+[.)][ ]/.test(t)) return [bloco];
  const frases = t.match(/[^.!?]+[.!?]+[ ]*/g);
  if (!frases || frases.length < 2) return [bloco];
  let buf = '', corte = 0;
  for (let i = 0; i < frases.length - 1; i++) {
    buf += frases[i];
    if (buf.length >= t.length / 2) { corte = i + 1; break; }
  }
  if (!corte) return [bloco];
  const a = frases.slice(0, corte).join('').trim();
  const c = frases.slice(corte).join('').trim();
  return [...quebrar(a), ...quebrar(c)];
}

function lerCorpus() {
  return fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
    const title = (raw.match(/title:\s*"([^"]+)"/) || [])[1] || f;
    const kws = (raw.match(/keywords:\s*\[([^\]]*)\]/) || [])[1] || '';
    const keyword = (kws.split(',')[0] || '').replace(/["']/g, '').trim();
    const date = (raw.match(/date:\s*"([^"]+)"/) || [])[1] || '';
    return { slug: f.replace(/\.md$/, ''), title, keyword, date };
  }).filter((c) => c.keyword);
}

const corpus = lerCorpus();
let tocados = 0, paraQuebrados = 0, h2Trocados = 0;
const paraRegerar = [];

for (const art of corpus) {
  const file = path.join(DIR, art.slug + '.md');
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, NL);
  const m = raw.match(/^(---[\s\S]*?---)(([\s\S]*)$)/);
  if (!m) { console.log('  ! frontmatter nao reconhecido:', art.slug); continue; }
  const frontmatter = m[1];
  let corpo = m[2];

  // 1. remove o bloco final de links (qualquer variante do titulo)
  corpo = corpo.replace(/\n\n##[^\n]*\n+(?:[ ]*-[ ]*\[[^\n]*\n?)+\s*$/, '');

  // 2. varia subtitulos repetidos
  const linhas = corpo.split(NL).map((l) => {
    if (!/^## /.test(l)) return l;
    const atual = l.replace(/^## /, '').trim();
    const novo = variarH2(atual, art.slug);
    if (novo !== atual) h2Trocados++;
    return '## ' + novo;
  });
  corpo = linhas.join(NL);

  // 3. quebra paragrafos longos
  const blocos = corpo.split(PP);
  const novos = [];
  for (const bl of blocos) {
    const partes = quebrar(bl);
    if (partes.length > 1) paraQuebrados += partes.length - 1;
    novos.push(...partes);
  }
  corpo = novos.join(PP).trim();

  // 4. regera o bloco final de links, com titulo e ancora variados
  corpo = corpo + PP + buildLeiaTambem(art, corpus, 6);

  // 5. relata o que so a regeracao resolve
  const plano = semAcento(corpo);
  const achados = CLICHES.filter((c) => plano.includes(semAcento(c)));
  const passos = (corpo.match(/^[ ]*[0-9]+[.)][ ]+\S/gm) || []).length;
  if (achados.length >= 2 || passos < 4) {
    paraRegerar.push({ slug: art.slug, cliches: achados, passos });
  }

  const final = frontmatter + PP + corpo + NL;
  if (!DRY) fs.writeFileSync(file, final, 'utf8');
  tocados++;
}

console.log(`artigos processados: ${tocados}`);
console.log(`paragrafos quebrados: ${paraQuebrados}`);
console.log(`subtitulos variados: ${h2Trocados}`);
console.log(`${DRY ? '[dry-run] nada gravado' : 'arquivos atualizados'}`);
console.log(`${NL}precisam de REGERACAO (cliche ou sem passo a passo): ${paraRegerar.length}`);
for (const r of paraRegerar.slice(0, 60)) {
  console.log(`  ${r.slug} | passos: ${r.passos} | ${r.cliches.join(', ') || '-'}`);
}
