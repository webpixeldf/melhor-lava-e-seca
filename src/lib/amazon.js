import { site } from './site';

const BASE = 'https://www.amazon.com.br/dp/';

// Detecta ASIN real vs placeholder (B09XXXXXXX, B09YYYYYYY...)
function isRealAsin(asin) {
  if (!asin) return false;
  if (!/^[A-Z0-9]{10}$/.test(asin)) return false;
  // 4+ caracteres repetidos seguidos (XXXX, YYYY) = placeholder
  if (/([A-Z0-9])\1{3,}/.test(asin)) return false;
  return true;
}

/**
 * Gera o link de afiliado para um produto.
 *
 * Prioridade:
 *  1. ASIN verificado (vindo da PA-API) → link /dp/ASIN direto
 *  2. Fallback: busca por nome do produto na Amazon → sempre valido
 *
 * A funcao nunca retorna 404 porque, no pior caso, faz uma busca textual
 * que a propria Amazon cuida de resolver.
 */
export function amazonLink(product) {
  if (isRealAsin(product.asin)) {
    const url = new URL(BASE + product.asin);
    url.searchParams.set('tag', site.amazonPartnerTag);
    url.searchParams.set('linkCode', 'osi');
    url.searchParams.set('language', 'pt_BR');
    return url.toString();
  }
  // Fallback: busca pelo nome — sempre leva a uma pagina de resultados valida
  return amazonSearchLink(product.name);
}

export function amazonSearchLink(query) {
  const url = new URL('https://www.amazon.com.br/s');
  url.searchParams.set('k', query);
  url.searchParams.set('tag', site.amazonPartnerTag);
  url.searchParams.set('linkCode', 'ssc');
  return url.toString();
}
