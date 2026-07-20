import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Loader2, Phone, Mail, MapPin } from 'lucide-react'
import { adminListOrders, adminUpdateOrderStatus } from '../../lib/adminApi'
import { formatINR } from '../../data/products'
import { formatOrderNumber } from '../../lib/orders'

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_CLASS = {
  Processing: 'tag--blue',
  Shipped: 'tag--amber',
  Delivered: 'tag--green',
  Cancelled: 'tag--red',
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)
  const [updating, setUpdating] = useState(null)
  const initialStatus = searchParams.get('status')
  const [filter, setFilter] = useState(STATUSES.includes(initialStatus) ? initialStatus : 'all')

  function load() {
    adminListOrders()
      .then((r) => setOrders(r.orders))
      .catch((e) => setError(e.message || 'Could not load orders.'))
  }

  useEffect(load, [])

  async function changeStatus(id, status) {
    setUpdating(id)
    try {
      await adminUpdateOrderStatus(id, status)
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)))
    } catch (e) {
      setError(e.message || 'Could not update order.')
    } finally {
      setUpdating(null)
    }
  }

  const visible = orders?.filter((o) => filter === 'all' || o.status === filter) || []

  return (
    <div>
      <div className="admin__head">
        <h1>Orders</h1>
        <p>{orders ? `${orders.length} total orders` : 'Loading…'}</p>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {orders && (
        <div className="toolbar" style={{ marginBottom: 18 }}>
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              className={`pill${filter === s ? ' active' : ''}`}
              onClick={() => {
                setFilter(s)
                setSearchParams(s === 'all' ? {} : { status: s })
              }}
              type="button"
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      )}

      {!orders && !error && (
        <div className="admin__loading">
          <Loader2 size={24} className="spin" />
        </div>
      )}

      {orders && visible.length === 0 && <p className="admin__empty">No orders here yet.</p>}

      {orders && visible.length > 0 && (
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head admin-table__row--orders">
            <span>Order</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Source</span>
            <span>Status</span>
            <span></span>
          </div>
          {visible.map((o) => (
            <div key={o.id}>
              <div className="admin-table__row admin-table__row--orders">
                <span className="admin-table__mono">{formatOrderNumber(o)}</span>
                <span>{o.customer?.name}</span>
                <span>{o.items?.reduce((n, it) => n + it.qty, 0)} item(s)</span>
                <span>{formatINR(o.total)}</span>
                <span className={`tag ${o.paymentMethod === 'online' ? 'tag--green' : 'tag--amber'}`}>
                  {o.paymentMethod === 'online' ? 'Online' : 'COD'}
                </span>
                <span>
                  {o.dealerName ? (
                    <span className="tag tag--blue">{o.dealerName}</span>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>SS Bikes</span>
                  )}
                </span>
                <span>
                  <select
                    className={`status-select ${STATUS_CLASS[o.status] || ''}`}
                    value={o.status}
                    disabled={updating === o.id}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </span>
                <button
                  className="icon-btn"
                  onClick={() => setOpenId(openId === o.id ? null : o.id)}
                  aria-label="Toggle details"
                >
                  {openId === o.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {openId === o.id && (
                <div className="admin-order-detail">
                  <div>
                    <h4>Items</h4>
                    <ul className="admin-order-items">
                      {o.items?.map((it, i) => (
                        <li key={i}>
                          {it.name} {it.color ? `· ${it.color}` : ''} × {it.qty} —{' '}
                          {formatINR(it.price * it.qty)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Customer</h4>
                    <p>
                      <Phone size={13} /> {o.customer?.phone}
                    </p>
                    {o.customer?.email && (
                      <p>
                        <Mail size={13} /> {o.customer.email}
                      </p>
                    )}
                    <p>
                      <MapPin size={13} /> {o.customer?.address}, {o.customer?.city} {o.customer?.pin}
                    </p>
                  </div>
                  <div>
                    <h4>Meta</h4>
                    <p>Placed: {fmtDate(o.createdAt)}</p>
                    <p>Payment status: {o.paymentStatus}</p>
                    {o.dealerName && <p>Dealer: {o.dealerName}</p>}
                    {o.razorpayPaymentId && <p>Payment ID: {o.razorpayPaymentId}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
