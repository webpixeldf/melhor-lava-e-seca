import { getAllPosts } from '@/lib/blog';
import { site } from '@/lib/site';
import { editorialUpdated, authorPath } from '@/lib/editorial';
import { topics, topicFor } from '@/lib/topics';
const latest=(posts)=>posts.reduce((date,p)=>new Date(p.updated||p.date)>new Date(date)?new Date(p.updated||p.date).toISOString():date,editorialUpdated);
export default function sitemap(){
 const posts=getAllPosts();
 const fixed=['/','/sobre/','/contato/','/privacidade/','/termos/','/afiliados/',authorPath].map(path=>({url:site.url+path,lastModified:editorialUpdated}));
 const listings=Array.from({length:Math.ceil(posts.length/18)},(_,i)=>({url:site.url+(i?`/blog/pagina/${i+1}/`:'/blog/'),lastModified:latest(posts.slice(i*18,(i+1)*18))}));
 const categories=topics.map(t=>({url:`${site.url}/blog/categoria/${t.slug}/`,lastModified:latest(posts.filter(p=>topicFor(p).slug===t.slug))}));
 return [...fixed,...listings,...categories,...posts.map(p=>({url:`${site.url}/blog/${p.slug}/`,lastModified:new Date(p.updated||p.date).toISOString()}))];
}
