/**
 * Quebra um texto corrido em parágrafos curtos, cortando sempre no fim de
 * frase.
 *
 * Por que existe: vários textos do site (respostas do FAQ, principalmente)
 * eram blocos únicos de 1.000 a 2.000 caracteres. No celular isso vira uma
 * parede de texto e o leitor desiste antes de chegar na resposta.
 *
 * @param {string} texto
 * @param {number} alvo  tamanho desejado por parágrafo (corta na primeira
 *                       frase que ultrapassa esse limite)
 * @returns {string[]}   parágrafos prontos para renderizar
 */
export function emParagrafos(texto, alvo = 300) {
  if (!texto) return [];

  const frases = String(texto).match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (!frases) return [String(texto)];

  const out = [];
  let buf = '';

  for (const frase of frases) {
    buf += frase;
    if (buf.length >= alvo) {
      out.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) {
    // Sobra curta demais gruda no parágrafo anterior em vez de virar órfã.
    if (out.length && buf.trim().length < 120) out[out.length - 1] += ' ' + buf.trim();
    else out.push(buf.trim());
  }

  return out;
}
