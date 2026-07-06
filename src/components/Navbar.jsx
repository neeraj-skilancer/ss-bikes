import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X, Zap } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import logo from '../assets/logo.png'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop/e-bikes', label: 'E-Bikes' },
  { to: '/shop/accessories', label: 'Accessories' },
  { to: '/dealer-network', label: 'Dealer Network' },
  { to: '/about', label: 'About Us' },
  { to: '/test-drive', label: 'Book Test Drive' },
]

export default function Navbar() {
  const { count, setCartOpen } = useStore()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <div className="announce">
        <b>Free delivery</b> across India · Zero-emission rides from ₹23,000 · <b>Be electrified ⚡</b>
      </div>
      <header className="nav">
        <div className="container nav__inner">
          <Link to="/" className="brand" aria-label="SS Bikes home">
            <img className="brand__logo" src={logo} alt="SS Bikes" />
          </Link>

          <nav className="nav__links">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav__spacer" />

          <div className="nav__actions">
            <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Open cart">
              <ShoppingBag size={20} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
            <button
              className="icon-btn nav__burger"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`mobile-menu${open ? ' open' : ''}`}>
        <div className="brand" style={{ marginBottom: 18 }}>
          <img className="brand__logo" src={logo} alt="SS Bikes" />
        </div>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            {l.label}
          </NavLink>
        ))}
        <Link to="/shop/e-bikes" className="btn btn--primary btn--block" style={{ marginTop: 18 }}>
          <Zap size={16} /> Shop e-bikes
        </Link>
      </aside>
    </>
  )
}
