import { useNavigate } from 'react-router-dom'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatINR } from '../data/products'

export default function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, setQty, remove, count } = useStore()
  const navigate = useNavigate()

  const goCheckout = () => {
    setCartOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      <div
        className={`overlay${cartOpen ? ' open' : ''}`}
        onClick={() => setCartOpen(false)}
        style={{ zIndex: 95 }}
      />
      <aside className={`drawer${cartOpen ? ' open' : ''}`} aria-hidden={!cartOpen}>
        <div className="drawer__head">
          <h3>Your cart {count > 0 && `(${count})`}</h3>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="drawer__body">
          {lines.length === 0 ? (
            <div className="drawer__empty">
              <ShoppingBag size={40} style={{ margin: '0 auto 14px', opacity: 0.35 }} />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            lines.map((l) => (
              <div className="line" key={`${l.slug}-${l.color}`}>
                <img className="line__img" src={l.product.image} alt={l.product.name} />
                <div>
                  <div className="line__name">{l.product.name}</div>
                  <div className="line__meta">{l.color}</div>
                  <div className="qty">
                    <button onClick={() => setQty(l.slug, l.color, l.qty - 1)} aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span>{l.qty}</span>
                    <button onClick={() => setQty(l.slug, l.color, l.qty + 1)} aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="line__right">
                  <span className="line__price">{formatINR(l.lineTotal)}</span>
                  <button className="link-btn" onClick={() => remove(l.slug, l.color)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer__foot">
            <div className="drawer__subtotal">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <button className="btn btn--primary btn--block" onClick={goCheckout}>
              Checkout
            </button>
            <p className="drawer__note">Shipping &amp; taxes calculated at checkout · Free delivery</p>
          </div>
        )}
      </aside>
    </>
  )
}
