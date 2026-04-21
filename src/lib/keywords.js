// Pool de anchor texts (lava e seca + adjetivo / adjetivo + lava e seca).
// Usado para linkar imagens e trechos de volta para a pagina inicial,
// concentrando relevancia de SEO na home.

const POOL = [
  'melhor lava e seca',
  'melhor lava e seca 2026',
  'melhores lava e seca',
  'ranking das lava e seca',
  'lava e seca top de linha',
  'lava e seca mais vendida',
  'lava e seca premium',
  'lava e seca economica',
  'lava e seca barata',
  'lava e seca com wifi',
  'lava e seca com vapor',
  'lava e seca 11kg',
  'lava e seca para familia',
  'lava e seca inteligente',
  'lava e seca em oferta',
];

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

// Deterministico: o mesmo seed sempre retorna o mesmo anchor
export function anchorFor(seed = '') {
  return POOL[hashStr(String(seed)) % POOL.length];
}

// Anchor text especifico para um produto do ranking
export function productAnchor(product) {
  const byBrand = {
    Samsung: 'melhor lava e seca Samsung',
    LG: 'melhor lava e seca LG',
    Electrolux: 'melhor lava e seca Electrolux',
    Brastemp: 'melhor lava e seca Brastemp',
    Midea: 'melhor lava e seca Midea',
    Hisense: 'melhor lava e seca Hisense',
    Panasonic: 'melhor lava e seca Panasonic',
  };
  return byBrand[product.brand] || anchorFor(product.slug);
}

// Anchor para um post de blog (varia segundo o titulo/slug)
export function blogAnchor(post) {
  const t = (post.title || '').toLowerCase();
  if (t.includes('samsung')) return 'melhor lava e seca Samsung';
  if (t.includes('lg')) return 'melhor lava e seca LG';
  if (t.includes('electrolux')) return 'melhor lava e seca Electrolux';
  if (t.includes('economiz') || t.includes('consumo') || t.includes('luz'))
    return 'lava e seca economica';
  if (t.includes('edredom') || t.includes('cama') || t.includes('travesseiro'))
    return 'lava e seca para roupa de cama';
  if (t.includes('barulho') || t.includes('ruido') || t.includes('quebra'))
    return 'lava e seca durável';
  if (t.includes('vale a pena')) return 'melhor lava e seca 2026';
  return anchorFor(post.slug);
}

// Alt text: combina anchor + contexto curto
export function imageAlt(anchor, context) {
  return context ? `${anchor} — ${context}` : anchor;
}
