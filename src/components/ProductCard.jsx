import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { formatINR } from '../data/products'
import { colorHex } from '../lib/colors'

// deterministic pseudo-rating (4.5–4.9) so cards feel real without fake review counts
const ratingFor = (slug) => (4.5 + ((slug.length * 3) % 5) / 10).toFixed(1)

export default function ProductCard({ product }) {
  const { slug, name, category, image, price, compareAt, badge, colors, range, motorW, soldOut } =
    product
  const off = compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0
  const emi = Math.round(price / 24 / 10) * 10
  const rate = ratingFor(slug)

  return (
    <Link to={`/product/${slug}`} className="card">
      <div className="card__media">
        <span className="card__range">{category === 'e-bikes' ? 'E-Cycle' : 'Accessory'}</span>
        {soldOut ? (
          <span className="badge badge--sold">Sold out</span>
        ) : off > 0 ? (
          <span className="badge badge--accent">{off}% OFF</span>
        ) : badge ? (
          <span className="badge">{badge}</span>
        ) : null}
        <img src={image} alt={name} loading="lazy" />
      </div>

      <div className="card__body">
        <div className="card__namerow">
          <h3 className="card__name">{name}</h3>
          <span className="card__rating">
            <Star size={13} fill="#f5a623" strokeWidth={0} /> {rate}
          </span>
        </div>

        {category === 'e-bikes' && (
          <div className="card__specs">
            {motorW && <span className="chip">{motorW}W</span>}
            {range && <span className="chip">{range}</span>}
            <span className="chip">Dual disc</span>
          </div>
        )}

        {colors?.length > 1 && (
          <div className="swatches">
            {colors.slice(0, 5).map((c) => (
              <span key={c} className="swatch" style={{ background: colorHex(c) }} title={c} />
            ))}
            {colors.length > 5 && <span className="swatch--more">+{colors.length - 5}</span>}
          </div>
        )}

        <div className="card__pricerow">
          <b>{formatINR(price)}</b>
          {compareAt > price && <s>{formatINR(compareAt)}</s>}
          {off > 0 && <span className="price-off">{off}% off</span>}
        </div>

        <div className="card__emi">or {formatINR(emi)}/mo · EMI available</div>

        <span className={`btn ${soldOut ? 'btn--ghost' : 'btn--primary'} btn--block card__buy`}>
          {soldOut ? 'Notify me' : 'Shop now'}
        </span>
      </div>
    </Link>
  )
}
