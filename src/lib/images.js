import fs from 'node:fs';
import path from 'node:path';
export const fallbackImage='/og/og-default.png';
export function imageExists(src) {
 if(!src || !src.startsWith('/') || src.includes('..')) return false;
 return fs.existsSync(path.join(process.cwd(),'public',src));
}
export function resolvedImage(src) { return imageExists(src) ? src : fallbackImage; }
export function imageSources(src) {
 if(!src?.startsWith('/images/blog/') || !src.endsWith('.webp')) return undefined;
 const variants=[400,800].map(w=>[src.replace('/images/blog/','/images/blog/responsive/').replace(/\.webp$/,`-${w}.webp`),w]).filter(([url])=>imageExists(url));
 return variants.length ? [...variants.map(([url,w])=>`${url} ${w}w`),`${src} 1200w`].join(', ') : undefined;
}
