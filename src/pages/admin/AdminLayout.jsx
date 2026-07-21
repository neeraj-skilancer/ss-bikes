import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Handshake,
  Store,
  Bike,
  Users,
  LogOut,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { adminMe, adminLogout } from '../../lib/adminApi'
import { AdminSessionProvider } from '../../context/AdminSessionContext'

export default function AdminLayout() {
  const [status, setStatus] = useState('checking') // checking | authed | anon
  const [session, setSession] = useState(null)

  useEffect(() => {
    adminMe()
      .then((r) => {
        if (r.authenticated) {
          setSession({ type: r.type, email: r.email, permissions: r.permissions })
          setStatus('authed')
        } else {
          setStatus('anon')
        }
      })
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

  const isOwner = session.type === 'owner'
  const can = (key) => isOwner || Boolean(session.permissions?.[key])

  return (
    <AdminSessionProvider value={session}>
      <div className="admin">
        <aside className="admin__sidebar">
          <div className="admin__brand">SS Bikes Admin</div>
          <nav className="admin__nav">
            <NavLink to="/admin" end>
              <LayoutDashboard size={17} /> Dashboard
            </NavLink>
            {can('viewProducts') && (
              <NavLink to="/admin/products">
                <Package size={17} /> Products
              </NavLink>
            )}
            {can('viewOrders') && (
              <NavLink to="/admin/orders">
                <ClipboardList size={17} /> Orders
              </NavLink>
            )}
            {can('viewDealers') && (
              <>
                <NavLink to="/admin/dealer-stores">
                  <Store size={17} /> Dealer Stores
                </NavLink>
                <NavLink to="/admin/dealers">
                  <Handshake size={17} /> Applications
                </NavLink>
              </>
            )}
            {can('viewTestDrives') && (
              <NavLink to="/admin/test-drive-bookings">
                <Bike size={17} /> Test Drives
              </NavLink>
            )}
            {isOwner && (
              <NavLink to="/admin/users">
                <Users size={17} /> Manage Users
              </NavLink>
            )}
          </nav>
          <div className="admin__sidebar-foot">
            {session.email && (
              <div className="admin__whoami" title={session.email}>
                {isOwner ? 'Owner' : session.email}
              </div>
            )}
            <Link to="/" target="_blank" className="admin__view-site">
              <ExternalLink size={15} /> View storefront
            </Link>
            <button
              className="admin__logout"
              onClick={async () => {
                await adminLogout()
                window.location.href = '/admin/login'
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
    </AdminSessionProvider>
  )
}
