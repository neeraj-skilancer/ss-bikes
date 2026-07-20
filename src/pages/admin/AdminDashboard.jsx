import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IndianRupee,
  ClipboardList,
  Package,
  Truck,
  PackageCheck,
  XCircle,
  Loader2,
  Handshake,
  Store,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { adminStats } from '../../lib/adminApi'
import { formatINR } from '../../data/products'
import { formatOrderNumber } from '../../lib/orders'

const STATUS_CLASS = {
  Processing: 'tag--blue',
  Shipped: 'tag--amber',
  Delivered: 'tag--green',
  Cancelled: 'tag--red',
}

function StatCard({ to, icon: Icon, iconClass, value, label, extra }) {
  return (
    <Link to={to} className="admin-stat admin-stat--link">
      <div className={`admin-stat__ico ${iconClass}`}>
        <Icon size={18} />
      </div>
      <div>
        <b>
          {value}
          {extra}
        </b>
        <span>{label}</span>
      </div>
    </Link>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminStats()
      .then(setStats)
      .catch((e) => setError(e.message || 'Could not load stats.'))
  }, [])

  const avgOrderValue = stats && stats.totalOrders > 0 ? Math.round(stats.revenue / stats.totalOrders) : 0

  return (
    <div>
      <div className="admin__head">
        <h1>Dashboard</h1>
        <p>An overview of your store.</p>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {!stats && !error && (
        <div className="admin__loading">
          <Loader2 size={24} className="spin" />
        </div>
      )}

      {stats && (
        <>
          <div className="admin-stats">
            <StatCard
              to="/admin/orders"
              icon={IndianRupee}
              iconClass="admin-stat__ico--green"
              value={formatINR(stats.revenue)}
              label="Revenue (excl. cancelled)"
            />
            <StatCard
              to="/admin/orders"
              icon={ClipboardList}
              iconClass="admin-stat__ico--blue"
              value={stats.totalOrders}
              label="Total orders"
            />
            <StatCard
              to="/admin/orders"
              icon={TrendingUp}
              iconClass="admin-stat__ico--amber"
              value={formatINR(avgOrderValue)}
              label="Avg. order value"
            />
            <StatCard
              to="/admin/products"
              icon={Package}
              iconClass="admin-stat__ico--amber"
              value={stats.totalProducts}
              label="Products in catalog"
            />
            <StatCard
              to="/admin/dealers"
              icon={Handshake}
              iconClass="admin-stat__ico--blue"
              value={stats.totalDealerApplications}
              label="Dealer applications"
              extra={
                stats.newDealerApplications > 0 && (
                  <span className="tag tag--blue" style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                    {stats.newDealerApplications} new
                  </span>
                )
              }
            />
            <StatCard
              to="/admin/dealer-stores"
              icon={Store}
              iconClass="admin-stat__ico--green"
              value={stats.totalDealerStores}
              label="Live dealer stores"
            />
          </div>

          <div className="admin__head" style={{ marginTop: 34 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Orders by status</h2>
          </div>
          <div className="admin-stats">
            <StatCard
              to="/admin/orders?status=Processing"
              icon={ClipboardList}
              iconClass="admin-stat__ico--blue"
              value={stats.byStatus.Processing || 0}
              label="Processing"
            />
            <StatCard
              to="/admin/orders?status=Shipped"
              icon={Truck}
              iconClass="admin-stat__ico--amber"
              value={stats.byStatus.Shipped || 0}
              label="Shipped"
            />
            <StatCard
              to="/admin/orders?status=Delivered"
              icon={PackageCheck}
              iconClass="admin-stat__ico--green"
              value={stats.byStatus.Delivered || 0}
              label="Delivered"
            />
            <StatCard
              to="/admin/orders?status=Cancelled"
              icon={XCircle}
              iconClass="admin-stat__ico--red"
              value={stats.byStatus.Cancelled || 0}
              label="Cancelled"
            />
          </div>

          <div className="admin__head admin__head--row" style={{ marginTop: 34 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Recent orders</h2>
            <Link to="/admin/orders" className="admin__back-link" style={{ fontWeight: 600 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {stats.recentOrders?.length > 0 ? (
            <div className="admin-table">
              <div className="admin-table__row admin-table__row--head admin-table__row--recent">
                <span>Order</span>
                <span>Customer</span>
                <span>Total</span>
                <span>Source</span>
                <span>Status</span>
                <span>Placed</span>
              </div>
              {stats.recentOrders.map((o) => (
                <Link
                  to="/admin/orders"
                  className="admin-table__row admin-table__row--recent admin-table__row--clickable"
                  key={o.id}
                >
                  <span className="admin-table__mono">{formatOrderNumber(o)}</span>
                  <span>{o.customer?.name}</span>
                  <span>{formatINR(o.total)}</span>
                  <span>
                    {o.dealerName ? (
                      <span className="tag tag--blue">{o.dealerName}</span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>SS Bikes</span>
                    )}
                  </span>
                  <span className={`tag ${STATUS_CLASS[o.status] || ''}`}>{o.status}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{fmtDate(o.createdAt)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="admin__empty">No orders yet.</p>
          )}

          <div className="admin-quicklinks">
            <Link to="/admin/orders" className="btn btn--dark">
              Manage orders
            </Link>
            <Link to="/admin/products" className="btn btn--ghost">
              Manage products
            </Link>
            <Link to="/admin/dealer-stores" className="btn btn--ghost">
              Manage dealer stores
            </Link>
            <Link to="/admin/dealers" className="btn btn--ghost">
              View dealer applications
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
