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

export function imageQueryFor({ keyword = '', intent = '' } = {}) {
  const k = keyword.toLowerCase();
  for (const [re, query] of TEMAS) {
    if (re.test(k)) return query;
  }
  // Ranking/comparativo pedem a maquina em cena de casa; o resto, lavanderia.
  return intent === 'ranking' || intent === 'comparativo'
    ? 'washing machine laundry room home'
    : 'laundry room washing machine';
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
export async function fetchBlogCover(query, destPath, { fallbackQueries = [] } = {}) {
  const queries = [query, ...fallbackQueries, 'washing machine', 'laundry room'];
  let photos = [];
  let chosenQuery = '';

  for (const q of queries) {
    const achadas = (await searchUnsplash(q, { perPage: 10 })).filter((p) => !fotoSuspeita(p));
    const boas = achadas.filter(fotoRelevante);
    if (boas.length > 0) {
      photos = boas;
      chosenQuery = q;
      break;
    }
    // Sem nenhuma foto que fale do aparelho, tenta a query seguinte antes de
    // se contentar com o que sobrou.
    if (achadas.length && !photos.length) photos = achadas;
  }
  if (!chosenQuery) chosenQuery = queries[queries.length - 1];

  if (photos.length === 0) {
    throw new Error(`Nenhuma imagem encontrada para: ${queries.join(' | ')}`);
  }

  // escolhe com randomizacao dos top 5 pra variar
  const pool = photos.slice(0, 5);
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
