import {notFound} from 'next/navigation';
import {getAllPosts} from '@/lib/blog';
import {buildMetadata} from '@/lib/seo';
import BlogListing,{pageSize} from '@/components/BlogListing';
export function generateStaticParams(){return Array.from({length:Math.max(0,Math.ceil(getAllPosts().length/pageSize)-1)},(_,i)=>({page:String(i+2)}));}
export function generateMetadata({params}){return buildMetadata({title:`Blog de lava e seca — página ${params.page}`,description:`Continue pelos artigos de compra, uso e manutenção de lava e seca. Página ${params.page} do acervo.`,path:`/blog/pagina/${params.page}/`,appendSiteName:false});}
export default function Page({params}){const posts=getAllPosts(),n=Number(params.page),total=Math.ceil(posts.length/pageSize);if(!Number.isInteger(n)||n<2||n>total)notFound();return <BlogListing posts={posts.slice((n-1)*pageSize,n*pageSize)} currentPage={n} totalPages={total}/>;}
