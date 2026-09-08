import { getAllPosts } from '@/lib/blog';
import BlogListing, {pageSize} from '@/components/BlogListing';
import {buildMetadata} from '@/lib/seo';
export const metadata=buildMetadata({title:'Blog de lava e seca: compra, uso e manutenção',description:'Encontre comparativos de lava e seca, guias de instalação, cuidados com as roupas e orientações de manutenção organizados por assunto.',path:'/blog/',appendSiteName:false});
export default function BlogIndex(){const posts=getAllPosts();return <BlogListing posts={posts.slice(0,pageSize)} totalPages={Math.ceil(posts.length/pageSize)} />;}
