import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Loader2, X, ExternalLink, Package } from 'lucide-react'
import {
  adminListDealerStores,
  adminCreateDealerStore,
  adminUpdateDealerStore,
  adminDeleteDealerStore,
} from '../../lib/adminApi'

const EMPTY = {
  slug: '',
  name: '',
  tagline: '',
  city: '',
  state: '',
  address: '',
  pincodesText: '',
  phone: '',
  email: '',
  logo: '',
  active: true,
}

function dealerToForm(d) {
  return {
    slug: d.slug,
    name: d.name || '',
    tagline: d.tagline || '',
    city: d.city || '',
    state: d.state || '',
    address: d.address || '',
    pincodesText: (d.pincodes || []).join(', '),
    phone: d.phone || '',
    email: d.email || '',
    logo: d.logo || '',
    active: d.active !== false,
  }
}

function formToPayload(form) {
  return {
    slug: form.slug || undefined,
    name: form.name,
    tagline: form.tagline,
    city: form.city,
    state: form.state,
    address: form.address,
    pincodesText: form.pincodesText,
    phone: form.phone,
    email: form.email,
    logo: form.logo,
    active: form.active,
  }
}

export default function AdminDealerStores() {
  const [dealers, setDealers] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingSlug, setDeletingSlug] = useState(null)

  function load() {
    adminListDealerStores()
      .then((r) => setDealers(r.dealers))
      .catch((e) => setError(e.message || 'Could not load dealer stores.'))
  }

  useEffect(load, [])

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = formToPayload(editing)
      if (editing.slug) {
        await adminUpdateDealerStore(editing.slug, payload)
      } else {
        await adminCreateDealerStore(payload)
      }
      setEditing(null)
      load()
    } catch (e2) {
      setError(e2.message || 'Could not save dealer.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(slug) {
    if (!window.confirm(`Delete dealer "${slug}"? This cannot be undone.`)) return
    setDeletingSlug(slug)
    try {
      await adminDeleteDealerStore(slug)
      setDealers((list) => list.filter((d) => d.slug !== slug))
    } catch (e) {
      setError(e.message || 'Could not delete dealer.')
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
          <h1>Dealer Stores</h1>
          <p>{dealers ? `${dealers.length} dealer stores` : 'Loading…'}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setEditing({ ...EMPTY })}>
          <Plus size={16} /> Add dealer store
        </button>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {!dealers && !error && (
        <div className="admin__loading">
          <Loader2 size={24} className="spin" />
        </div>
      )}

      {dealers && dealers.length === 0 && <p className="admin__empty">No dealer stores yet.</p>}

      {dealers && dealers.length > 0 && (
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head admin-table__row--dealers">
            <span>Dealer</span>
            <span>Location</span>
            <span>Pincodes</span>
            <span>Products</span>
            <span>Status</span>
            <span></span>
          </div>
          {dealers.map((d) => (
            <div className="admin-table__row admin-table__row--dealers" key={d.slug}>
              <span>
                <b>{d.name}</b>
                <br />
                <small style={{ color: 'var(--muted)' }}>{d.slug}</small>
              </span>
              <span>
                {d.city}, {d.state}
              </span>
              <span>{(d.pincodes || []).join(', ') || '—'}</span>
              <span>{(d.products || []).length}</span>
              <span>
                {d.active === false ? (
                  <span className="tag tag--red">Hidden</span>
                ) : (
                  <span className="tag tag--green">Live</span>
                )}
              </span>
              <span className="admin-table__actions">
                <Link
                  className="icon-btn"
                  to={`/admin/dealer-stores/${d.slug}/products`}
                  aria-label="Manage products"
                  title="Manage products"
                >
                  <Package size={16} />
                </Link>
                <a
                  className="icon-btn"
                  href={`/dealers/${d.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View storefront"
                >
                  <ExternalLink size={16} />
                </a>
                <button className="icon-btn" onClick={() => setEditing(dealerToForm(d))} aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => onDelete(d.slug)}
                  disabled={deletingSlug === d.slug}
                  aria-label="Delete"
                >
                  {deletingSlug === d.slug ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
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
              <h3>{editing.slug ? `Edit ${editing.name}` : 'Add dealer store'}</h3>
              <button className="icon-btn" onClick={() => setEditing(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form className="form-grid admin-modal__body" onSubmit={onSave}>
              <div className="input">
                <label>Dealer / business name</label>
                <input required value={editing.name} onChange={set('name')} />
              </div>
              <div className="input">
                <label>Tagline (optional)</label>
                <input value={editing.tagline} onChange={set('tagline')} />
              </div>
              <div className="input">
                <label>City</label>
                <input required value={editing.city} onChange={set('city')} />
              </div>
              <div className="input">
                <label>State</label>
                <input required value={editing.state} onChange={set('state')} />
              </div>
              <div className="input full">
                <label>Address</label>
                <input value={editing.address} onChange={set('address')} />
              </div>
              <div className="input">
                <label>Serviceable pincodes (comma separated)</label>
                <input
                  required
                  value={editing.pincodesText}
                  onChange={set('pincodesText')}
                  placeholder="e.g. 411001, 411002"
                />
              </div>
              <div className="input">
                <label>Phone</label>
                <input value={editing.phone} onChange={set('phone')} />
              </div>
              <div className="input">
                <label>Email</label>
                <input type="email" value={editing.email} onChange={set('email')} />
              </div>
              <div className="input">
                <label>Logo URL (optional)</label>
                <input value={editing.logo} onChange={set('logo')} placeholder="https://…" />
              </div>

              <div className="input full">
                <label className="admin-checkbox">
                  <input type="checkbox" checked={editing.active} onChange={set('active')} />
                  Visible / accepting orders
                </label>
              </div>

              {!editing.slug && (
                <div className="input full">
                  <div className="notice">
                    You'll be able to pick which products this dealer sells right after saving.
                  </div>
                </div>
              )}

              <div className="input full admin-modal__foot">
                <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : 'Save dealer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
