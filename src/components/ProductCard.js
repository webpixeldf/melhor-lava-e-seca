import Image from 'next/image';
import Link from 'next/link';
import { amazonLink } from '@/lib/amazon';
import { productAnchor, imageAlt } from '@/lib/keywords';

function Stars({ value }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="stars" aria-label={`${value} de 5 estrelas`}>
      {'★'.repeat(full)}
      {half ? '★' : ''}
      {'☆'.repeat(empty)}
    </span>
  );
}

function ScoreRow({ label, value }) {
  const pct = Math.min(100, Math.max(0, (value / 10) * 100));
  const tone = value >= 9.3 ? 'high' : value >= 8.7 ? 'mid' : '';
  return (
    <div className="score-row">
      <span className="score-label">{label}</span>
      <div className={`bar ${tone}`}><span style={{ width: `${pct}%` }} /></div>
      <span className="score-val">{value.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const link = amazonLink(product);
  const isWinner = product.rank === 1;
  const anchor = productAnchor(product);

  return (
    <article className={`product-card ${isWinner ? 'is-winner' : ''}`} id={product.slug}>
      <div className="product-rank" aria-label={`Posição ${product.rank}`}>
        {isWinner ? '👑 #1' : `#${product.rank}`}
      </div>
      {product.badge && (
        <span className={`product-badge ${product.badgeTone || 'neutral'}`}>
          {product.badge}
        </span>
      )}

      <div className="product-card-inner">
        <Link
          href="/"
          className="product-image"
          title={anchor}
          aria-label={anchor}
        >
          <Image
            src={product.image}
            alt={imageAlt(anchor, product.name)}
            width={340}
            height={280}
            loading="lazy"
          />
        </Link>

        <div className="product-info">
          <span className="product-brand">{product.brand}</span>
          <h3>{product.name}</h3>

          <div className="rating-line">
            <Stars value={product.rating} />
            <span className="score-pill">{product.rating.toFixed(1)}</span>
            <span>{product.reviewsCount.toLocaleString('pt-BR')} avaliações</span>
          </div>

          <p className="product-headline">{product.headline}</p>
          <p className="product-pitch">{product.pitch}</p>

          <div className="specs-grid">
            <div className="spec">
              <strong>Lavagem</strong>{product.capacityWash}kg
            </div>
            <div className="spec">
              <strong>Secagem</strong>{product.capacityDry}kg
            </div>
            <div className="spec">
              <strong>Classe</strong>{product.energyClass}
            </div>
            <div className="spec">
              <strong>Tensão</strong>{product.voltage}
            </div>
          </div>

          {product.scoreBreakdown && (
            <div className="scores" aria-label="Notas por critério">
              <ScoreRow label="Desempenho" value={product.scoreBreakdown.desempenho} />
              <ScoreRow label="Economia" value={product.scoreBreakdown.economia} />
              <ScoreRow label="Silêncio" value={product.scoreBreakdown.silencio} />
              <ScoreRow label="Recursos" value={product.scoreBreakdown.recursos} />
              <ScoreRow label="Custo-benef." value={product.scoreBreakdown.custoBeneficio} />
            </div>
          )}

          <div className="proscons">
            <div className="proscons-box pros">
              <div className="title">O que eu gostei</div>
              <ul>
                {product.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="proscons-box cons">
              <div className="title">O que eu não gostei</div>
              <ul>
                {product.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div className="ideal-line">
            <span><strong>Ideal para:</strong> {product.ideal}</span>
          </div>

          <div className="cta-row">
            <a
              className="btn btn-amazon"
              href={link}
              target="_blank"
              rel="sponsored nofollow noopener"
            >
              Ver preço na Amazon
            </a>
            <span className="price-note">Preço e estoque em tempo real</span>
          </div>
        </div>
      </div>
    </article>
  );
}
