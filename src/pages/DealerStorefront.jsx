import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Phone, Mail, Loader2, Store, ShieldCheck } from 'lucide-react'
import { fetchDealer } from '../lib/dealerStores'
import { formatINR } from '../data/products'
import { colorHex } from '../lib/colors'
import { useStore } from '../context/StoreContext'

function DealerProductCard({ product, dealer }) {
  const { addToCart } = useStore()
  const colors = product.colors?.length ? product.colors : ['Default']
  const [color, setColor] = useState(colors[0])
  const image = product.colorImages?.[color] || product.image

  return (
    <div className="card">
      <div className="card__media">
        <img src={image} alt={product.name} loading="lazy" />
        {product.soldOut && <span className="badge badge--sold">Sold out</span>}
      </div>
      <div className="card__body">
        <span className="card__cat">{product.category === 'e-bikes' ? 'Electric cycle' : 'Accessory'}</span>
        <h3 className="card__name">{product.name}</h3>

        {product.colors?.length > 1 && (
          <div className="color-opts" style={{ marginTop: 4 }}>
            {product.colors.map((c) => (
              <button
                key={c}
                className={`color-opt${color === c ? ' active' : ''}`}
                style={{ padding: '4px 9px', fontSize: '0.76rem' }}
                onClick={() => setColor(c)}
                type="button"
              >
                <span className="color-dot" style={{ background: colorHex(c) }} />
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="card__foot">
          <div className="price">
            <b>{formatINR(product.price)}</b>
          </div>
          <button
            className="btn btn--primary"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            disabled={product.soldOut}
            onClick={() =>
              addToCart(product.slug, color, 1, { slug: dealer.slug, name: dealer.name, price: product.price })
            }
          >
            {product.soldOut ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DealerStorefront() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setData(null)
    setError('')
    fetchDealer(slug)
      .then(setData)
      .catch((e) => setError(e.message || 'Could not load this dealer.'))
  }, [slug])

  if (error) {
    return (
      <section className="section">
        <div className="container center-narrow">
          <Store size={40} style={{ margin: '0 auto 14px', opacity: 0.3 }} />
          <h1 style={{ fontSize: '1.8rem' }}>Dealer not found</h1>
          <p style={{ color: 'var(--muted)', margin: '10px 0 22px' }}>{error}</p>
          <Link to="/dealers" className="btn btn--primary">
            Browse all dealers
          </Link>
        </div>
      </section>
    )
  }

  if (!data) {
    return (
      <div className="admin__loading" style={{ minHeight: '50vh' }}>
        <Loader2 size={28} className="spin" />
      </div>
    )
  }

  const { dealer, products } = data

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" style={{ paddingTop: 0, marginBottom: 14 }}>
            <Link to="/dealers">All dealers</Link> / <span style={{ color: 'var(--ink)' }}>{dealer.name}</span>
          </nav>
          <span className="eyebrow">
            <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4 }} />
            Authorised SS Bikes dealer
          </span>
          <h1>{dealer.name}</h1>
          {dealer.tagline && <p>{dealer.tagline}</p>}

          <div className="dealer-meta">
            {dealer.address && (
              <span>
                <MapPin size={14} /> {dealer.address}, {dealer.city}, {dealer.state}
              </span>
            )}
            {dealer.phone && (
              <span>
                <Phone size={14} /> {dealer.phone}
              </span>
            )}
            {dealer.email && (
              <span>
                <Mail size={14} /> {dealer.email}
              </span>
            )}
          </div>

          {dealer.pincodes?.length > 0 && (
            <div className="notice" style={{ marginTop: 16, display: 'inline-flex' }}>
              Delivers only within pincode{dealer.pincodes.length > 1 ? 's' : ''}:{' '}
              <b style={{ marginLeft: 4 }}>{dealer.pincodes.join(', ')}</b>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 style={{ fontSize: '1.6rem' }}>Available from {dealer.name}</h2>
            <p>{products.length} product{products.length === 1 ? '' : 's'} in stock</p>
          </div>

          {products.length === 0 ? (
            <p className="admin__empty">This dealer hasn't listed any products yet.</p>
          ) : (
            <div className="grid grid--products">
              {products.map((p) => (
                <DealerProductCard key={p.slug} product={p} dealer={dealer} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
