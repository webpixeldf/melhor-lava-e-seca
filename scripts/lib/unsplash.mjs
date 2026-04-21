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
    photos = await searchUnsplash(q, { perPage: 10 });
    if (photos.length > 0) {
      chosenQuery = q;
      break;
    }
  }

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
