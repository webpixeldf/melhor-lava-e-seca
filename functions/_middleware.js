export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!['/404', '/404/', '/404.html'].includes(url.pathname)) return context.next();
  // Usa a página 404 estática através de uma URL ausente, sem redirecionamento.
  const missing = new Request(new URL('/__mls-not-found__/', url), context.request);
  const response = await context.env.ASSETS.fetch(missing);
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, follow');
  headers.set('Cache-Control', 'no-store');
  headers.delete('Location');
  return new Response(response.body, {status:404, statusText:'Not Found', headers});
}
