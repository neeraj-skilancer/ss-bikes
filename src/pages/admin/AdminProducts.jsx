import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '../../lib/adminApi'
import { formatINR } from '../../data/products'

const EMPTY = {
  slug: '',
  name: '',
  category: 'e-bikes',
  tagline: '',
  price: '',
  compareAt: '',
  badge: '',
  image: '',
  range: '',
  motorW: '',
  short: '',
  colorsText: '',
  specsText: '',
  soldOut: false,
  active: true,
}

// "key: value" per line <-> { key: value }
const specsToText = (specs) =>
  Object.entries(specs || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

const textToSpecs = (text) =>
  Object.fromEntries(
    text
      .split('\n')
      .map((line) => line.split(':').map((s) => s.trim()))
      .filter(([k, v]) => k && v)
      .map(([k, ...rest]) => [k, rest.join(':').trim()]),
  )

function productToForm(p) {
  return {
    slug: p.slug,
    name: p.name || '',
    category: p.category || 'e-bikes',
    tagline: p.tagline || '',
    price: p.price ?? '',
    compareAt: p.compareAt ?? '',
    badge: p.badge || '',
    image: p.image || '',
    range: p.range || '',
    motorW: p.motorW ?? '',
    short: p.short || '',
    colorsText: (p.colors || []).join(', '),
    specsText: specsToText(p.specs),
    soldOut: Boolean(p.soldOut),
    active: p.active !== false,
  }
}

function formToPayload(form) {
  return {
    slug: form.slug || undefined,
    name: form.name,
    category: form.category,
    tagline: form.tagline,
    price: form.price === '' ? 0 : Number(form.price),
    compareAt: form.compareAt === '' ? null : Number(form.compareAt),
    badge: form.badge || null,
    image: form.image,
    range: form.range,
    motorW: form.motorW === '' ? null : Number(form.motorW),
    short: form.short,
    colors: form.colorsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    specs: textToSpecs(form.specsText),
    soldOut: form.soldOut,
    active: form.active,
  }
}

export default function AdminProducts() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null closed, EMPTY = new, form obj = editing
  const [saving, setSaving] = useState(false)
  const [deletingSlug, setDeletingSlug] = useState(null)

  function load() {
    adminListProducts()
      .then((r) => setProducts(r.products))
      .catch((e) => setError(e.message || 'Could not load products.'))
  }

  useEffect(load, [])

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = formToPayload(editing)
      if (editing.slug) {
        await adminUpdateProduct(editing.slug, payload)
      } else {
        await adminCreateProduct(payload)
      }
      setEditing(null)
      load()
    } catch (e2) {
      setError(e2.message || 'Could not save product.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(slug) {
    if (!window.confirm(`Delete "${slug}"? This cannot be undone.`)) return
    setDeletingSlug(slug)
    try {
      await adminDeleteProduct(slug)
      setProducts((list) => list.filter((p) => p.slug !== slug))
    } catch (e) {
      setError(e.message || 'Could not delete product.')
    } finally {
      setDeletingSlug(null)
    }
  }

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setEditing((f) => ({ ...f, [k]: v }))
  }

  return (
    <div>
      <div className="admin__head admin__head--row">
        <div>
          <h1>Products</h1>
          <p>{products ? `${products.length} products in the catalog` : 'Loading…'}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setEditing({ ...EMPTY })}>
          <Plus size={16} /> Add product
        </button>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {!products && !error && (
        <div className="admin__loading">
          <Loader2 size={24} className="spin" />
        </div>
      )}

      {products && (
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head admin-table__row--products">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span></span>
          </div>
          {products.map((p) => (
            <div className="admin-table__row admin-table__row--products" key={p.slug}>
              <span className="admin-table__product">
                <img src={p.image} alt="" />
                <span>
                  <b>{p.name}</b>
                  <small>{p.slug}</small>
                </span>
              </span>
              <span>{p.category === 'e-bikes' ? 'E-Bikes' : 'Accessories'}</span>
              <span>
                {formatINR(p.price)}
                {p.compareAt > p.price && (
                  <s style={{ marginLeft: 6, color: 'var(--muted)' }}>{formatINR(p.compareAt)}</s>
                )}
              </span>
              <span>
                {p.active === false && <span className="tag tag--red">Hidden</span>}
                {p.soldOut && <span className="tag tag--amber">Sold out</span>}
                {p.active !== false && !p.soldOut && <span className="tag tag--green">Live</span>}
              </span>
              <span className="admin-table__actions">
                <button className="icon-btn" onClick={() => setEditing(productToForm(p))} aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => onDelete(p.slug)}
                  disabled={deletingSlug === p.slug}
                  aria-label="Delete"
                >
                  {deletingSlug === p.slug ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="admin-modal-overlay" onClick={() => !saving && setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>{editing.slug ? `Edit ${editing.name}` : 'Add product'}</h3>
              <button className="icon-btn" onClick={() => setEditing(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form className="form-grid admin-modal__body" onSubmit={onSave}>
              <div className="input">
                <label>Name</label>
                <input required value={editing.name} onChange={set('name')} />
              </div>
              <div className="input">
                <label>Category</label>
                <select value={editing.category} onChange={set('category')}>
                  <option value="e-bikes">E-Bikes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <div className="input full">
                <label>Tagline</label>
                <input value={editing.tagline} onChange={set('tagline')} />
              </div>
              <div className="input">
                <label>Price (₹)</label>
                <input required type="number" min="0" value={editing.price} onChange={set('price')} />
              </div>
              <div className="input">
                <label>Compare-at price (₹, optional)</label>
                <input type="number" min="0" value={editing.compareAt} onChange={set('compareAt')} />
              </div>
              <div className="input">
                <label>Badge (optional)</label>
                <input value={editing.badge} onChange={set('badge')} placeholder="e.g. Bestseller" />
              </div>
              <div className="input">
                <label>Motor wattage (e-bikes)</label>
                <input type="number" min="0" value={editing.motorW} onChange={set('motorW')} />
              </div>
              <div className="input full">
                <label>Image URL</label>
                <input required value={editing.image} onChange={set('image')} placeholder="https://…" />
              </div>
              <div className="input">
                <label>Range (e-bikes)</label>
                <input value={editing.range} onChange={set('range')} placeholder="e.g. 35+ km" />
              </div>
              <div className="input">
                <label>Colours (comma separated)</label>
                <input value={editing.colorsText} onChange={set('colorsText')} placeholder="Black, White" />
              </div>
              <div className="input full">
                <label>Description</label>
                <textarea rows={3} value={editing.short} onChange={set('short')} />
              </div>
              <div className="input full">
                <label>Specs — one "key: value" per line</label>
                <textarea
                  rows={4}
                  value={editing.specsText}
                  onChange={set('specsText')}
                  placeholder={'motor: 250W BLDC hub motor\nbattery: 36V / 7.8Ah Li-ion'}
                />
              </div>
              <div className="input">
                <label className="admin-checkbox">
                  <input type="checkbox" checked={editing.soldOut} onChange={set('soldOut')} />
                  Sold out
                </label>
              </div>
              <div className="input">
                <label className="admin-checkbox">
                  <input type="checkbox" checked={editing.active} onChange={set('active')} />
                  Visible on storefront
                </label>
              </div>

              <div className="input full admin-modal__foot">
                <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : 'Save product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
