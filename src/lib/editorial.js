export const editorialUpdated = '2026-09-07T23:43:17Z';
export const authorPath = '/autores/marcelo-franca/';
export const authorUrl = 'https://melhorlavaeseca.com' + authorPath;
export function displayDate(value) {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long', year: 'numeric' });
}
