import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, ShoppingBag } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatINR } from '../data/products'

export default function Checkout() {
  const { lines, subtotal, clear, count } = useStore()
  const [placed, setPlaced] = useState(false)

  const shipping = 0
  const total = subtotal + shipping

  if (placed) {
    return (
      <section className="section">
        <div className="container center-narrow">
          <div className="form-ok__ico">
            <CheckCircle2 size={34} />
          </div>
          <h1 style={{ fontSize: '2rem' }}>Order placed!</h1>
          <p style={{ color: 'var(--muted)', margin: '12px 0 24px' }}>
            Thank you for choosing SS Bikes. A confirmation has been sent to your email and our team
            will call you to arrange delivery. Be electrified! ⚡
          </p>
          <Link to="/shop/e-bikes" className="btn btn--primary">
            Continue shopping
          </Link>
        </div>
      </section>
    )
  }

  if (count === 0) {
    return (
      <section className="section">
        <div className="container center-narrow">
          <ShoppingBag size={44} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h1 style={{ fontSize: '1.8rem' }}>Your cart is empty</h1>
          <p style={{ color: 'var(--muted)', margin: '10px 0 22px' }}>
            Add an e-cycle or accessory to get started.
          </p>
          <Link to="/shop/e-bikes" className="btn btn--primary">
            Shop e-bikes
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Secure checkout</span>
          <h1>Checkout</h1>
        </div>
      </section>

      <div className="container checkout">
        <div>
          <div className="form-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: 18 }}>Contact &amp; delivery</h3>
            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault()
                clear()
                setPlaced(true)
              }}
            >
              <div className="input">
                <label>Full name</label>
                <input required placeholder="Your name" />
              </div>
              <div className="input">
                <label>Phone number</label>
                <input required type="tel" placeholder="+91" />
              </div>
              <div className="input full">
                <label>Email</label>
                <input required type="email" placeholder="you@example.com" />
              </div>
              <div className="input full">
                <label>Address</label>
                <input required placeholder="House no., street, area" />
              </div>
              <div className="input">
                <label>City</label>
                <input required placeholder="City" />
              </div>
              <div className="input">
                <label>PIN code</label>
                <input required placeholder="000000" />
              </div>

              <div className="input full" style={{ marginTop: 8 }}>
                <div className="field__label">Payment</div>
                <div className="notice">
                  <Lock size={16} /> Cash on delivery &amp; online payment available. This is a demo
                  checkout — no payment is taken.
                </div>
              </div>

              <div className="input full">
                <button className="btn btn--primary btn--block" type="submit">
                  Place order · {formatINR(total)}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="summary">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 14 }}>Order summary</h3>
          <div className="summary__items">
            {lines.map((l) => (
              <div className="mini-line" key={`${l.slug}-${l.color}`}>
                <img src={l.product.image} alt={l.product.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{l.product.name}</div>
                  <small>
                    {l.color} · Qty {l.qty}
                  </small>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatINR(l.lineTotal)}</div>
              </div>
            ))}
          </div>
          <div className="summary__line">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="summary__line">
            <span>Shipping</span>
            <span style={{ color: 'var(--accent-strong)', fontWeight: 600 }}>Free</span>
          </div>
          <div className="summary__total">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
        </aside>
      </div>
    </>
  )
}
