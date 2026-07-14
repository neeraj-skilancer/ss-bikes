import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'

const FILTERS = [
  { handle: 'e-bikes', title: 'E-Bikes' },
  { handle: 'accessories', title: 'Accessories' },
  { handle: 'all', title: 'Everything' },
]

const SORTS = {
  featured: { label: 'Featured', fn: null },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
}

const COPY = {
  'e-bikes': {
    title: 'Electric Cycles',
    sub: 'Silent, zero-emission e-cycles with BLDC motors, dual disc brakes and up to 100 km of range. Find the ride that matches your commute and your style.',
  },
  accessories: {
    title: 'Accessories & Spares',
    sub: 'Genuine SS Bikes components — motors, controllers, throttles and brake parts to keep your e-cycle running like new.',
  },
  all: {
    title: 'Shop Everything',
    sub: 'Browse the full SS Bikes catalogue of e-cycles and genuine spare parts.',
  },
}

export default function Shop() {
  const { byCategory } = useProducts()
  const { handle = 'e-bikes' } = useParams()
  const active = COPY[handle] ? handle : 'e-bikes'
  const [sort, setSort] = useState('featured')

  const items = useMemo(() => {
    const list = [...byCategory(active)]
    const fn = SORTS[sort].fn
    return fn ? list.sort(fn) : list
  }, [active, sort, byCategory])

  const copy = COPY[active]

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">SS Bikes · Collection</span>
          <h1>{copy.title}</h1>
          <p>{copy.sub}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="toolbar">
            {FILTERS.map((f) => (
              <Link
                key={f.handle}
                to={`/shop/${f.handle}`}
                className={`pill${active === f.handle ? ' active' : ''}`}
              >
                {f.title}
              </Link>
            ))}
            <div className="toolbar__count">
              {items.length} products ·{' '}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  font: 'inherit',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid--products">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
