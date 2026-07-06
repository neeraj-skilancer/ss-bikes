import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Zap,
  BatteryCharging,
  Gauge,
  Disc3,
  CircleDot,
  MonitorSmartphone,
  Settings2,
  Timer,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react'
import { getProduct, formatINR, products } from '../data/products'
import { colorHex } from '../lib/colors'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'

// pick an icon per spec key
const SPEC_META = {
  motor: { icon: Zap, label: 'Motor' },
  battery: { icon: BatteryCharging, label: 'Battery' },
  range: { icon: Gauge, label: 'Range' },
  brakes: { icon: Disc3, label: 'Brakes' },
  topSpeed: { icon: Gauge, label: 'Top speed' },
  frame: { icon: CircleDot, label: 'Frame' },
  modes: { icon: Settings2, label: 'Ride modes' },
  charging: { icon: Timer, label: 'Charging' },
  display: { icon: MonitorSmartphone, label: 'Display' },
  handlebar: { icon: Settings2, label: 'Handlebar' },
  extras: { icon: CircleDot, label: 'Extras' },
  payload: { icon: CircleDot, label: 'Payload' },
  type: { icon: Settings2, label: 'Type' },
  voltage: { icon: Zap, label: 'Voltage' },
  fit: { icon: CircleDot, label: 'Fitment' },
  warranty: { icon: ShieldCheck, label: 'Warranty' },
  feature: { icon: Settings2, label: 'Feature' },
  integration: { icon: Settings2, label: 'Integration' },
}

export default function ProductDetail() {
  const { slug } = useParams()
  const product = getProduct(slug)
  const { addToCart } = useStore()
  const [color, setColor] = useState(product?.colors?.[0] || 'Black')

  if (!product) {
    return (
      <section className="section">
        <div className="container center-narrow">
          <h1 style={{ fontSize: '2rem' }}>Product not found</h1>
          <p style={{ color: 'var(--muted)', margin: '12px 0 22px' }}>
            The item you're looking for may have moved.
          </p>
          <Link to="/shop/e-bikes" className="btn btn--primary">
            Back to shop
          </Link>
        </div>
      </section>
    )
  }

  const { name, image, price, compareAt, short, specs, colors, soldOut, category, tagline } = product
  const saving = compareAt > price ? compareAt - price : 0
  const related = products
    .filter((p) => p.category === category && p.slug !== product.slug)
    .slice(0, 3)

  return (
    <>
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to={`/shop/${category}`}>{category === 'e-bikes' ? 'E-Bikes' : 'Accessories'}</Link> /{' '}
          <span style={{ color: 'var(--ink)' }}>{name}</span>
        </nav>
      </div>

      <div className="container pdp">
        <div className="pdp__media">
          <img src={image} alt={name} />
        </div>

        <div>
          <span className="eyebrow">{tagline}</span>
          <h1>{name}</h1>

          <div className="pdp__price">
            <b>{formatINR(price)}</b>
            {compareAt > price && <s>{formatINR(compareAt)}</s>}
            {saving > 0 && <span className="save">Save {formatINR(saving)}</span>}
          </div>

          <p className="pdp__desc">{short}</p>

          {colors?.length > 0 && (
            <div className="field">
              <div className="field__label">
                Colour — <span style={{ color: 'var(--ink)' }}>{color}</span>
              </div>
              <div className="color-opts">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={`color-opt${color === c ? ' active' : ''}`}
                    onClick={() => setColor(c)}
                  >
                    <span className="color-dot" style={{ background: colorHex(c) }} />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pdp__buy">
            <button
              className="btn btn--primary"
              style={{ flex: 1, maxWidth: 260 }}
              disabled={soldOut}
              onClick={() => addToCart(product.slug, color, 1)}
            >
              {soldOut ? 'Sold out' : `Add to cart · ${formatINR(price)}`}
            </button>
            <Link to="/test-drive" className="btn btn--ghost">
              Test ride
            </Link>
          </div>

          <div className="specs-grid">
            {Object.entries(specs).map(([k, v]) => {
              const meta = SPEC_META[k] || { icon: CircleDot, label: k }
              const Icon = meta.icon
              return (
                <div className="spec" key={k}>
                  <div className="spec__ico">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="spec__k">{meta.label}</div>
                    <div className="spec__v">{v}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pdp__assure">
            <div>
              <Truck size={18} /> Free delivery
            </div>
            <div>
              <ShieldCheck size={18} /> 1-year warranty
            </div>
            <div>
              <RotateCcw size={18} /> 7-day easy returns
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2 style={{ fontSize: '1.8rem' }}>You may also like</h2>
            </div>
            <div className="grid grid--products">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Link to={`/shop/${category}`} className="btn btn--ghost">
                View all <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
