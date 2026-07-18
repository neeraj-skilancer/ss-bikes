import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Package, Loader2, Store } from 'lucide-react'
import { fetchDealerDirectory } from '../lib/dealerStores'

export default function DealerDirectory() {
  const [dealers, setDealers] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDealerDirectory()
      .then((r) => setDealers(r.dealers))
      .catch((e) => setError(e.message || 'Could not load dealers.'))
  }, [])

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Find a dealer</span>
          <h1>SS Bikes Dealer Stores</h1>
          <p>
            Browse authorised local dealers and shop their in-stock e-cycles and accessories —
            delivered locally, right to your pincode.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <div className="notice notice--error">{error}</div>}

          {!dealers && !error && (
            <div className="admin__loading">
              <Loader2 size={26} className="spin" />
            </div>
          )}

          {dealers && dealers.length === 0 && (
            <div className="center-narrow">
              <Store size={40} style={{ margin: '0 auto 14px', opacity: 0.3 }} />
              <h2 style={{ fontSize: '1.4rem' }}>No dealer stores yet</h2>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>
                Check back soon, or{' '}
                <Link to="/dealer-network" style={{ textDecoration: 'underline' }}>
                  apply to become a dealer
                </Link>
                .
              </p>
            </div>
          )}

          {dealers && dealers.length > 0 && (
            <div className="grid grid--products">
              {dealers.map((d) => (
                <Link to={`/dealers/${d.slug}`} className="card dealer-card" key={d.slug}>
                  <div className="dealer-card__logo">
                    {d.logo ? <img src={d.logo} alt="" /> : <Store size={26} />}
                  </div>
                  <div className="card__body">
                    <h3 className="card__name">{d.name}</h3>
                    {d.tagline && <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{d.tagline}</p>}
                    <div className="card__specs">
                      <span className="chip">
                        <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {d.city}, {d.state}
                      </span>
                      <span className="chip">
                        <Package size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {d.productCount} product{d.productCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
