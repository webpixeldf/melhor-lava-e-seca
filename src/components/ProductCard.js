import {amazonLink} from '@/lib/amazon';
import {emParagrafos} from '@/lib/text';
export default function ProductCard({product:p}) {
 return <article className="product-card" id={p.slug}>
  <div className="product-rank" aria-label={`Item ${p.rank} da seleção`}>#{p.rank}</div><span className="product-badge neutral">{p.badge}</span>
  <div className="product-card-inner"><div className="product-image">{p.image?<img src={p.image} alt={p.name} width="340" height="280" loading="lazy"/>:<div className="product-image-placeholder"><span>{p.brand}<br/>{p.name}</span></div>}</div>
   <div className="product-info"><span className="product-brand">{p.brand}</span><h3>{p.name}</h3><p className="product-headline">{p.headline}</p>
    {emParagrafos(p.pitch,320).map((text,i)=><p className="product-pitch" key={i}>{text}</p>)}
    <div className="specs-grid"><div className="spec"><strong>Lavagem</strong>{p.capacityWash.toLocaleString('pt-BR')} kg</div><div className="spec"><strong>Secagem</strong>{p.capacityDry} kg</div><div className="spec"><strong>Wi-Fi</strong>{p.wifi===true?'Sim':p.wifi===false?'Não':'Consultar ficha'}</div><div className="spec"><strong>Vapor</strong>{p.steam===true?'Sim':p.steam===false?'Não':'Consultar ficha'}</div></div>
    <div className="proscons"><div className="proscons-box pros"><div className="title">O que considerar</div><ul>{p.pros.map(t=><li key={t}>{t}</li>)}</ul></div><div className="proscons-box cons"><div className="title">Antes de comprar</div><ul>{p.cons.map(t=><li key={t}>{t}</li>)}</ul></div></div>
    <p><a className="source-link" href={p.sourceUrl} target="_blank" rel="noopener noreferrer">Ficha ou manual do fabricante</a> · Consulta documental em {new Date(p.sourceChecked+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}.</p>
    <div className="cta-row"><a className="btn btn-amazon" href={amazonLink(p)} target="_blank" rel="sponsored nofollow noopener" data-product={p.id}>Consultar oferta na Amazon</a><span className="price-note">Confira o modelo e a tensão no anúncio.</span></div>
   </div></div>
 </article>;
}
