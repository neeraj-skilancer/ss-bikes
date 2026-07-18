import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Search, Save } from 'lucide-react'
import { adminGetDealerStore, adminUpdateDealerStore, adminListProducts } from '../../lib/adminApi'
import { formatINR } from '../../data/products'

export default function AdminDealerProducts() {
  const { slug } = useParams()
  const [dealer, setDealer] = useState(null)
  const [rows, setRows] = useState(null) // [{ slug, name, image, price, category, selected, priceOverride, stock }]
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    Promise.all([adminGetDealerStore(slug), adminListProducts()])
      .then(([d, p]) => {
        setDealer(d.dealer)
        const selectedMap = new Map((d.dealer.products || []).map((x) => [x.slug, x]))
        setRows(
          p.products
            .filter((x) => x.active !== false)
            .map((x) => {
              const sel = selectedMap.get(x.slug)
              return {
                slug: x.slug,
                name: x.name,
                image: x.image,
                price: x.price,
                category: x.category,
                selected: Boolean(sel),
                priceOverride: sel?.priceOverride ?? '',
                stock: sel?.stock ?? '',
              }
            }),
        )
      })
      .catch((e) => setError(e.message || 'Could not load this dealer.'))
  }, [slug])

  const visible = useMemo(() => {
    if (!rows) return []
    return rows.filter((r) => {
      if (category !== 'all' && r.category !== category) return false
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [rows, category, query])

  const selectedCount = rows?.filter((r) => r.selected).length || 0

  function toggle(slug) {
    setSaved(false)
    setRows((list) => list.map((r) => (r.slug === slug ? { ...r, selected: !r.selected } : r)))
  }

  function setField(slug, field, value) {
    setSaved(false)
    setRows((list) => list.map((r) => (r.slug === slug ? { ...r, [field]: value } : r)))
  }

  async function onSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const products = rows
        .filter((r) => r.selected)
        .map((r) => ({
          slug: r.slug,
          priceOverride: r.priceOverride === '' ? null : Number(r.priceOverride),
          stock: r.stock === '' ? null : Number(r.stock),
        }))
      await adminUpdateDealerStore(slug, { products })
      setSaved(true)
    } catch (e) {
      setError(e.message || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (error && !dealer) {
    return (
      <div>
        <div className="notice notice--error">{error}</div>
        <Link to="/admin/dealer-stores" className="btn btn--ghost" style={{ marginTop: 16 }}>
          <ArrowLeft size={16} /> Back to dealer stores
        </Link>
      </div>
    )
  }

  if (!dealer || !rows) {
    return (
      <div className="admin__loading">
        <Loader2 size={24} className="spin" />
      </div>
    )
  }

  return (
    <div>
      <Link to="/admin/dealer-stores" className="admin__back-link">
        <ArrowLeft size={14} /> Dealer stores
      </Link>

      <div className="admin__head admin__head--row" style={{ marginTop: 10 }}>
        <div>
          <h1>{dealer.name} — Products</h1>
          <p>{selectedCount} of {rows.length} catalog products selected</p>
        </div>
        <button className="btn btn--primary" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {error && <div className="notice notice--error">{error}</div>}
      {saved && !error && <div className="notice">Saved — this dealer's storefront is up to date.</div>}

      <div className="toolbar" style={{ marginTop: 18 }}>
        <div className="dealer-products__search">
          <Search size={15} />
          <input
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {['all', 'e-bikes', 'accessories'].map((c) => (
          <button
            key={c}
            className={`pill${category === c ? ' active' : ''}`}
            onClick={() => setCategory(c)}
            type="button"
          >
            {c === 'all' ? 'All' : c === 'e-bikes' ? 'E-Bikes' : 'Accessories'}
          </button>
        ))}
        <div className="toolbar__count">{visible.length} shown</div>
      </div>

      <div className="dealer-product-picker dealer-product-picker--page">
        {visible.length === 0 && <p className="admin__empty">No products match.</p>}
        {visible.map((r) => (
          <div className="dealer-product-picker__row" key={r.slug}>
            <label className="admin-checkbox dealer-product-picker__label">
              <input type="checkbox" checked={r.selected} onChange={() => toggle(r.slug)} />
              <img src={r.image} alt="" className="dealer-product-picker__thumb" />
              <span>
                <b>{r.name}</b>
                <small style={{ display: 'block', color: 'var(--muted)' }}>
                  Catalog price: {formatINR(r.price)}
                </small>
              </span>
            </label>
            {r.selected && (
              <div className="dealer-product-picker__fields">
                <input
                  type="number"
                  min="0"
                  placeholder="Price override"
                  value={r.priceOverride}
                  onChange={(e) => setField(r.slug, 'priceOverride', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={r.stock}
                  onChange={(e) => setField(r.slug, 'stock', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn--primary" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
