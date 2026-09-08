import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/Schema';
import { site } from '@/lib/site';
export default function InstitutionalPage({title,path,children}) {
 return <><BreadcrumbSchema items={[{name:'Início',url:site.url},{name:title,url:site.url+path}]} /><section className="section container-narrow institutional-page"><nav className="breadcrumb" aria-label="Você está em"><ol><li><Link href="/">Início</Link></li><li aria-current="page">{title}</li></ol></nav><h1>{title}</h1><p className="updated">Atualizado em <time dateTime="2026-09-07">7 de setembro de 2026</time></p>{children}</section></>;
}
