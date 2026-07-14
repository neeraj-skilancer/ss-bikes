import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, LogOut, Loader2, ExternalLink } from 'lucide-react'
import { adminMe, adminLogout } from '../../lib/adminApi'

export default function AdminLayout() {
  const [status, setStatus] = useState('checking') // checking | authed | anon

  useEffect(() => {
    adminMe()
      .then((r) => setStatus(r.authenticated ? 'authed' : 'anon'))
      .catch(() => setStatus('anon'))
  }, [])

  if (status === 'checking') {
    return (
      <div className="admin-auth">
        <Loader2 size={28} className="spin" />
      </div>
    )
  }

  if (status === 'anon') return <Navigate to="/admin/login" replace />

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">SS Bikes Admin</div>
        <nav className="admin__nav">
          <NavLink to="/admin" end>
            <LayoutDashboard size={17} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products">
            <Package size={17} /> Products
          </NavLink>
          <NavLink to="/admin/orders">
            <ClipboardList size={17} /> Orders
          </NavLink>
        </nav>
        <div className="admin__sidebar-foot">
          <Link to="/" target="_blank" className="admin__view-site">
            <ExternalLink size={15} /> View storefront
          </Link>
          <button
            className="admin__logout"
            onClick={async () => {
              await adminLogout()
              window.location.hash = '#/admin/login'
              window.location.reload()
            }}
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>
      <main className="admin__content">
        <Outlet />
      </main>
    </div>
  )
}
