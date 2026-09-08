import {notFound} from 'next/navigation';
import {getAllPosts} from '@/lib/blog';
import {topics,topicFor} from '@/lib/topics';
import {buildMetadata} from '@/lib/seo';
import BlogListing from '@/components/BlogListing';
export function generateStaticParams(){return topics.map(t=>({category:t.slug}));}
export function generateMetadata({params}){const t=topics.find(t=>t.slug===params.category);return t?buildMetadata({title:`Lava e seca: ${t.name.toLowerCase()}`,description:t.description,path:`/blog/categoria/${t.slug}/`,appendSiteName:false}):{};}
export default function Page({params}){const t=topics.find(t=>t.slug===params.category);if(!t)notFound();return <BlogListing posts={getAllPosts().filter(p=>topicFor(p).slug===t.slug)} title={t.name} description={t.description} topic={t}/>;}
