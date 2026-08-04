/**
 * Helper de busca e download de imagem no Unsplash.
 * Baixa a melhor foto encontrada, redimensiona pra 1200x630 webp.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

function getKey() {
  const k = process.env.UNSPLASH_ACCESS_KEY;
  if (!k) throw new Error('UNSPLASH_ACCESS_KEY nao definida');
  return k;
}

/**
 * Traduz a pauta em portugues para uma query de banco de imagem em INGLES.
 *
 * Passar a keyword crua pro Unsplash e uma armadilha: "lava e seca" contem
 * "lava", que em ingles e lava de vulcao, e "eco bubble" virou instalacao de
 * arte com esfera. Sairam capas de vulcao e de escultura em artigo de
 * eletrodomestico. A keyword NUNCA vai pra busca — so o tema traduzido.
 */
const TEMAS = [
  [/secadora|\bsecar\b/, 'clothes dryer machine'],
  [/frontal|abertura frontal/, 'front load washing machine'],
  [/\bmini\b|pequena|compacta|portat|port[áa]til/, 'compact front load washing machine'],
  [/industrial|lavanderia/, 'industrial laundry machine'],
  [/inverter|motor|tambor|centrifug/, 'washing machine drum detail'],
  [/erro|n[ãa]o seca|vazando|conserto|amortecedor|filtro|barulho|quebr/, 'washing machine repair technician'],
  [/instalar|calibrar|nivelar/, 'washing machine installation'],
  [/energia|consumo|gasta|econom/, 'energy efficient laundry room'],
  [/edredom|roupa de cama|len[çc]ol|travesseiro/, 'bedding laundry'],
  [/t[êe]nis|sapato|sapatilha/, 'sneakers laundry'],
  [/beb[êe]|crian[çc]a|fralda/, 'baby clothes laundry'],
];

// Variacoes de cena pro caso geral. Sem elas quase toda pauta caia na mesma
// query, a Unsplash devolvia os mesmos 3 resultados no topo e 6 artigos
// terminaram com a MESMA capa — o que contradiz "avaliamos 23 maquinas" na
// cara do leitor. A escolha e estavel por slug: reprocessar nao troca a capa.
const CENAS = [
  'laundry room washing machine',
  'washing machine laundry room home',
  'modern laundry room interior',
  'washer and dryer home laundry',
  'laundry basket washing machine home',
  'utility room washing machine',
];

function hashTexto(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}

export function imageQueryFor({ keyword = '', intent = '', slug = '' } = {}) {
  const k = keyword.toLowerCase();
  for (const [re, query] of TEMAS) {
    if (re.test(k)) return query;
  }
  return CENAS[hashTexto(slug || keyword) % CENAS.length];
}

/**
 * Registro das fotos ja usadas (id do Unsplash -> slug). Serve pra nao repetir
 * capa entre artigos: sem isso a aleatoriedade dentro do top 5 colide sempre.
 */
export function carregarUsadas(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

export function salvarUsadas(file, mapa) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(mapa, null, 2) + '\n');
}

// Rede de seguranca: mesmo com query em ingles, o Unsplash as vezes devolve
// paisagem. Foto cuja descricao/tags batem aqui e descartada.
const PROIBIDO = /volcano|lava|magma|erupt|geolog|mountain|crater|sunset|beach|forest|sculpture|installation/i;

// Descartar o obviamente errado nao basta: "small washing machine apartment"
// devolveu um paleto numa cadeira. Foto que fala do aparelho vem primeiro.
const RELEVANTE = /washing machine|washer|dryer|laundry|laundrette|laundromat/i;

function textoDaFoto(photo) {
  return [
    photo.description,
    photo.alt_description,
    ...(photo.tags || []).map((t) => t.title || ''),
  ].filter(Boolean).join(' ');
}

function fotoSuspeita(photo) {
  return PROIBIDO.test(textoDaFoto(photo));
}

function fotoRelevante(photo) {
  return RELEVANTE.test(textoDaFoto(photo));
}

export async function searchUnsplash(query, { perPage = 10, orientation = 'landscape' } = {}) {
  const ACCESS_KEY = getKey();
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('orientation', orientation);
  url.searchParams.set('content_filter', 'high');

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Unsplash ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.results || [];
}

/**
 * Busca + baixa + redimensiona para 1200x630 webp.
 * Salva em destPath. Retorna { photo, destPath, saved }.
 */
export async function fetchBlogCover(query, destPath, { fallbackQueries = [], usadas = {} } = {}) {
  const queries = [query, ...fallbackQueries, 'washing machine', 'laundry room'];
  const jaUsada = (p) => Object.prototype.hasOwnProperty.call(usadas, p.id);
  let photos = [];
  let reserva = [];
  let chosenQuery = '';

  for (const q of queries) {
    // per_page 30 e nao 10: com pool curto, as poucas fotos do topo se repetem
    // entre artigos mesmo sorteando.
    const achadas = (await searchUnsplash(q, { perPage: 30 })).filter((p) => !fotoSuspeita(p));
    const boas = achadas.filter(fotoRelevante);
    // Inedita primeiro; foto ja usada em outro artigo so como ultimo recurso.
    const ineditas = boas.filter((p) => !jaUsada(p));
    if (ineditas.length > 0) {
      photos = ineditas;
      chosenQuery = q;
      break;
    }
    if (!reserva.length) reserva = boas.length ? boas : achadas;
  }
  if (!photos.length) photos = reserva;
  if (!chosenQuery) chosenQuery = queries[queries.length - 1];

  if (photos.length === 0) {
    throw new Error(`Nenhuma imagem encontrada para: ${queries.join(' | ')}`);
  }

  const pool = photos.slice(0, 12);
  const photo = pool[Math.floor(Math.random() * pool.length)];

  // Pega a maior disponivel (full) e redimensiona localmente
  const imageUrl = photo.urls?.raw
    ? `${photo.urls.raw}&w=1600&q=85&fm=jpg`
    : photo.urls?.full || photo.urls?.regular;

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Falha ao baixar ${imageUrl}: ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());

  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  await sharp(buf)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .webp({ quality: 82, effort: 5 })
    .toFile(destPath);

  // Registrar download (requisito do Unsplash API)
  if (photo.links?.download_location) {
    fetch(photo.links.download_location, {
      headers: { Authorization: `Client-ID ${getKey()}` },
    }).catch(() => {});
  }

  return {
    photo,
    destPath,
    query: chosenQuery,
    photographer: photo.user?.name,
    photographerUrl: photo.user?.links?.html,
    sourceUrl: photo.links?.html,
  };
}
