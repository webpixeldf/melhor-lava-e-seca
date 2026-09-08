import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
fs.mkdirSync('auditoria-seo-2026-09-05',{recursive:true});
const root=process.cwd(),out=path.join(root,'out'),base='https://melhorlavaeseca.com';
const errors=[],warnings=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1].toLowerCase(),decode(m[2])]));
if(!fs.existsSync(out)) throw Error('Execute npm run build antes da verificação.');
const files=walk(out).filter(f=>f.endsWith('.html'));
const pages=new Map(files.map(file=>{
 const relative=path.relative(out,file).replaceAll('\\','/');const route=relative==='index.html'?'/':'/'+relative.replace(/index\.html$/,'');
 const html=fs.readFileSync(file,'utf8');
 return [route,{file,html,ids:new Set([...html.matchAll(/\bid="([^"]*)"/g)].map(m=>decode(m[1])))}];
}));
const titles=new Map(),descriptions=new Map(),indexed=[];
const existsRoute=pathname=>pages.has(pathname)||pages.has(pathname.endsWith('/')?pathname:pathname+'/')||fs.existsSync(path.join(out,decodeURIComponent(pathname)));
let checkedLinks=0,checkedImages=0;
for(const [route,p] of pages){
 const errorPage=route==='/404.html'||route==='/404/';
 const meta=[...p.html.matchAll(/<meta\b[^>]*>/g)].map(m=>attrs(m[0]));
 const robots=meta.filter(x=>['robots','googlebot'].includes(x.name)).map(x=>x.content||'');
 if(errorPage){if(!robots.some(x=>x.includes('noindex'))||robots.some(x=>/(?:^|,\s*)index(?:,|$)/.test(x))) errors.push(`${route}: robots conflitante na página de erro`);}
 else {if(robots.some(x=>x.includes('noindex')))errors.push(`${route}: página válida não indexável`);indexed.push(route);}
 const canonical=[...p.html.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0])).filter(x=>x.rel==='canonical');
 if(canonical.length!==1||(!errorPage&&canonical[0].href!==base+route))errors.push(`${route}: canonical ausente, duplicado ou diferente da URL`);
 const h1=[...p.html.matchAll(/<h1\b/g)].length;if(h1!==1)errors.push(`${route}: ${h1} títulos H1`);
 const title=decode(p.html.match(/<title>(.*?)<\/title>/s)?.[1]||'');
 const description=meta.find(x=>x.name==='description')?.content||'';
 if(!title||!description) errors.push(`${route}: title ou description vazio`);
 if(!errorPage){for(const [value,map,name] of [[title,titles,'title'],[description,descriptions,'description']]){if(map.has(value))errors.push(`${route}: ${name} duplicado de ${map.get(value)}`);map.set(value,route);}}
 if(title.length>70)warnings.push(`${route}: título com ${title.length} caracteres`);
 if(description.length>180)warnings.push(`${route}: descrição com ${description.length} caracteres`);
 for(const m of p.html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)){
  try{const data=JSON.parse(m[1]);if(/https:\/\/melhorlavaeseca\.comnull/.test(m[1]))errors.push(`${route}: URL null no schema`);if(route==='/'&&['Product','Review','AggregateRating'].includes(data['@type']))errors.push('Home com avaliação de produto sem evidência');}catch{errors.push(`${route}: JSON-LD inválido`);}
 }
 if(p.html.includes('{% catalog '))errors.push(`${route}: tabela documental não expandida`);
 for(const m of p.html.matchAll(/<a\b[^>]*>/g)){
  const a=attrs(m[0]);if(!a.href||/^(mailto:|tel:|javascript:)/.test(a.href))continue;
  let u;try{u=new URL(a.href,base+route);}catch{errors.push(`${route}: link inválido ${a.href}`);continue;}
  if(u.origin===base){checkedLinks++;if(!existsRoute(u.pathname))errors.push(`${route}: destino ausente ${a.href}`);
   if(u.hash){const dest=pages.get(u.pathname)||pages.get(u.pathname+'/');if(dest&&!dest.ids.has(decodeURIComponent(u.hash.slice(1))))errors.push(`${route}: âncora ausente ${a.href}`);}
  } else if(/(^|\.)amazon\.com\.br$/.test(u.hostname)||u.hostname==='amzn.to'){if(!a.rel?.includes('sponsored'))errors.push(`${route}: afiliado sem sponsored`);}
 }
 for(const m of p.html.matchAll(/<img\b[^>]*>/g)){
  const a=attrs(m[0]);checkedImages++;
  if(!Object.hasOwn(a,'alt'))errors.push(`${route}: imagem sem alt`);
  if(!a.width||!a.height)warnings.push(`${route}: imagem sem dimensões`);
  for(const src of [a.src,...(a.srcset||'').split(',').map(x=>x.trim().split(' ')[0])].filter(Boolean)){
   if(src.startsWith('/')&&!fs.existsSync(path.join(out,decodeURIComponent(src))))errors.push(`${route}: imagem ausente ${src}`);
  }
 }
}
const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>decode(m[1]));
if(new Set(urls).size!==urls.length)errors.push('URLs duplicadas no sitemap');
for(const url of urls){const route=new URL(url).pathname;if(!indexed.includes(route))errors.push(`Sitemap contém URL não indexável/exportada: ${route}`);}
for(const route of indexed)if(!urls.includes(base+route))errors.push(`Página indexável fora do sitemap: ${route}`);
for(const m of sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g))if(!Number.isFinite(Date.parse(m[1]))||Date.parse(m[1])>Date.now())errors.push(`lastmod inválido/futuro: ${m[1]}`);
const retired=[];
for(const file of walk(path.join(root,'src/content/blog')).filter(f=>/\.mdx?$/.test(f))){const {data}=matter(fs.readFileSync(file,'utf8'));if(data.status==='retired'||data.status==='draft'||data.draft===true){const slug=path.basename(file).replace(/\.mdx?$/,'');retired.push(slug);if(pages.has('/blog/'+slug+'/'))errors.push(`Rascunho/retirado exportado: ${slug}`);}}
const report={checkedAt:new Date().toISOString(),htmlPages:pages.size,indexablePages:indexed.length,sitemapUrls:urls.length,internalLinksChecked:checkedLinks,imagesChecked:checkedImages,excludedArticles:retired,errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
const dest=path.join(root,'auditoria-seo-2026-09-05/validacao-apos-ajustes.json');fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,errors:report.errors.slice(0,35),warnings:report.warnings.slice(0,12)},null,2));
if(errors.length)process.exitCode=1;
