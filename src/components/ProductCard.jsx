import { Link } from 'react-router-dom'
import { formatINR } from '../data/products'
import { colorHex } from '../lib/colors'

export default function ProductCard({ product }) {
  const { slug, name, category, image, price, compareAt, badge, colors, range, motorW, soldOut } =
    product

  return (
    <Link to={`/product/${slug}`} className="card">
      <div className="card__media">
        <img src={image} alt={name} loading="lazy" />
        {soldOut ? (
          <span className="badge badge--sold">Sold out</span>
        ) : badge ? (
          <span className={`badge${badge === 'Bestseller' ? ' badge--accent' : ''}`}>{badge}</span>
        ) : null}
      </div>
      <div className="card__body">
        <span className="card__cat">{category === 'e-bikes' ? 'Electric cycle' : 'Accessory'}</span>
        <h3 className="card__name">{name}</h3>

        {category === 'e-bikes' && (
          <div className="card__specs">
            {motorW && <span className="chip">{motorW}W</span>}
            {range && <span className="chip">{range} range</span>}
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

        <div className="card__foot">
          <div className="price">
            <b>{formatINR(price)}</b>
            {compareAt > price && <s>{formatINR(compareAt)}</s>}
          </div>
          <span className="btn btn--ghost" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            View
          </span>
        </div>
      </div>
    </Link>
  )
}
