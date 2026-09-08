import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2), slug=args[args.indexOf('--slug')+1];
try {
 if(!args.includes('--slug')||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||'')) throw Error('Informe --slug com o nome do rascunho.');
 const draft=path.join(root,'src/content/drafts',slug+'.md'), target=path.join(root,'src/content/blog',slug+'.md');
 const {data,content}=matter(fs.readFileSync(draft,'utf8'));
 const validDate=d=>typeof d==='string'&&Number.isFinite(Date.parse(d))&&Date.parse(d)<=Date.now();
 if(data.status!=='approved'||typeof data.reviewer!=='string'||data.reviewer.trim().length<3||!validDate(data.reviewed)) throw Error('Necessários status: approved, reviewer e reviewed válidos após revisão editorial.');
 if(!data.title?.trim()||!data.description?.trim()||!content.trim()) throw Error('Título, descrição e conteúdo são obrigatórios.');
 if(!Array.isArray(data.sources)||!data.sources.length||!data.sources.every(url=>{try{return new URL(url).protocol==='https:'&&content.includes(url);}catch{return false;}})) throw Error('Inclua sources HTTPS e cite cada referência no corpo.');
 const exists=fs.existsSync(target);
 if(exists&&!args.includes('--replace')) throw Error('Artigo existente: use --replace somente após revisar as diferenças.');
 const previous=exists?matter(fs.readFileSync(target,'utf8')).data:null;
 if(previous?.status==='retired') throw Error('Pauta retirada: revise a decisão editorial antes de republicar.');
 const now=new Date().toISOString();
 data.date=previous?.date||now;data.updated=now;data.status='published';delete data.draft;
 // Impede links para rascunhos ou páginas ausentes antes de entrar no site.
 for(const match of content.matchAll(/\]\(\/?blog\/([a-z0-9-]+)\/?(?:#[^)]*)?\)/g)) {
  if(match[1]!==slug){
   const linked=path.join(root,'src/content/blog',match[1]+'.md');
   if(!fs.existsSync(linked)) throw Error(`Link interno sem destino: ${match[1]}`);
   const state=matter(fs.readFileSync(linked,'utf8')).data;
   if(state.draft===true||['draft','retired'].includes(state.status)) throw Error(`Link para conteúdo não publicado: ${match[1]}`);
  }
 }
 if(args.includes('--check')) {console.log('Rascunho validado; nada publicado.');process.exit(0);}
 fs.writeFileSync(target,matter.stringify(content,data));
 const queuePath=path.join(root,'scripts/data/cronograma.json');
 if(fs.existsSync(queuePath)){const queue=JSON.parse(fs.readFileSync(queuePath,'utf8'));const item=queue.items.find(p=>p.slug===slug);if(item){item.status='publicado';item.publishedAt=data.date;item.reviewedAt=data.reviewed;fs.writeFileSync(queuePath,JSON.stringify(queue,null,2)+'\n');}}
 data.status='published';fs.writeFileSync(draft,matter.stringify(content,data));
 console.log(`Publicado localmente: /blog/${slug}/. Execute npm run build e npm run seo:check antes da implantação.`);
} catch(error){console.error(error.message);process.exitCode=1;}
