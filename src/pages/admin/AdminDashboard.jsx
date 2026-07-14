import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IndianRupee, ClipboardList, Package, Truck, PackageCheck, XCircle, Loader2 } from 'lucide-react'
import { adminStats } from '../../lib/adminApi'
import { formatINR } from '../../data/products'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminStats()
      .then(setStats)
      .catch((e) => setError(e.message || 'Could not load stats.'))
  }, [])

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
            <div className="admin-stat">
              <div className="admin-stat__ico admin-stat__ico--green">
                <IndianRupee size={18} />
              </div>
              <div>
                <b>{formatINR(stats.revenue)}</b>
                <span>Revenue (excl. cancelled)</span>
              </div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat__ico admin-stat__ico--blue">
                <ClipboardList size={18} />
              </div>
              <div>
                <b>{stats.totalOrders}</b>
                <span>Total orders</span>
              </div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat__ico admin-stat__ico--amber">
                <Package size={18} />
              </div>
              <div>
                <b>{stats.totalProducts}</b>
                <span>Products in catalog</span>
              </div>
            </div>
          </div>

          <div className="admin__head" style={{ marginTop: 34 }}>
            <h2 style={{ fontSize: '1.15rem' }}>Orders by status</h2>
          </div>
          <div className="admin-stats">
            <div className="admin-stat">
              <div className="admin-stat__ico admin-stat__ico--blue">
                <ClipboardList size={18} />
              </div>
              <div>
                <b>{stats.byStatus.Processing || 0}</b>
                <span>Processing</span>
              </div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat__ico admin-stat__ico--amber">
                <Truck size={18} />
              </div>
              <div>
                <b>{stats.byStatus.Shipped || 0}</b>
                <span>Shipped</span>
              </div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat__ico admin-stat__ico--green">
                <PackageCheck size={18} />
              </div>
              <div>
                <b>{stats.byStatus.Delivered || 0}</b>
                <span>Delivered</span>
              </div>
            </div>
            <div className="admin-stat">
              <div className="admin-stat__ico admin-stat__ico--red">
                <XCircle size={18} />
              </div>
              <div>
                <b>{stats.byStatus.Cancelled || 0}</b>
                <span>Cancelled</span>
              </div>
            </div>
          </div>

          <div className="admin-quicklinks">
            <Link to="/admin/orders" className="btn btn--dark">
              Manage orders
            </Link>
            <Link to="/admin/products" className="btn btn--ghost">
              Manage products
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
