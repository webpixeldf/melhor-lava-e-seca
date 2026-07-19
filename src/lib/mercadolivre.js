import { site } from './site';

/**
 * Gera o link de afiliado do Mercado Livre para um produto.
 *
 * Prioridade (espelha a lógica de src/lib/amazon.js):
 *  1. product.mlUrl → link de afiliado real gerado na Central de Afiliados
 *     do Mercado Livre (é o único que rastreia comissão com 100% de certeza).
 *  2. Fallback: busca pelo nome do produto, com os parâmetros de rastreio
 *     anexados. Nunca retorna 404 — a própria busca do ML resolve o resto.
 */
export function mercadoLivreLink(product) {
  if (product.mlUrl) return withTracking(product.mlUrl);
  return mercadoLivreSearchLink(product.name);
}

export function mercadoLivreSearchLink(query) {
  const slug = query
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return withTracking(`https://lista.mercadolivre.com.br/${slug}`);
}

// Anexa os parâmetros de afiliado do ML (matt_word/matt_tool) quando houver ID.
function withTracking(rawUrl) {
  if (!site.mlAffiliateId) return rawUrl;
  const url = new URL(rawUrl);
  url.searchParams.set('matt_word', site.mlAffiliateId);
  url.searchParams.set('matt_tool', site.mlAffiliateId);
  return url.toString();
}
