import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, ShoppingBag, CreditCard, Banknote, Loader2 } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatINR } from '../data/products'
import { getPaymentConfig, loadRazorpay, createOrder, verifyPayment, saveOrder } from '../lib/payment'

export default function Checkout() {
  const { lines, subtotal, clear, count } = useStore()
  const [placed, setPlaced] = useState(null) // { method, paymentId? }
  const [method, setMethod] = useState('online')
  const [rzpEnabled, setRzpEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pin: '',
  })

  const shipping = 0
  const total = subtotal + shipping

  function buildOrderPayload(extra) {
    return {
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        pin: form.pin,
      },
      items: lines.map((l) => ({
        slug: l.slug,
        name: l.product.name,
        color: l.color,
        qty: l.qty,
        price: l.product.price,
      })),
      subtotal,
      shipping,
      total,
      ...extra,
    }
  }

  useEffect(() => {
    getPaymentConfig().then((c) => {
      setRzpEnabled(Boolean(c.razorpayEnabled))
      setMethod(c.razorpayEnabled ? 'online' : 'cod')
    })
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const formValid = form.name && form.phone && form.email && form.address && form.city && form.pin

  async function payWithRazorpay() {
    setError('')
    setBusy(true)
    try {
      const ok = await loadRazorpay()
      if (!ok) throw new Error('Could not load the payment gateway. Check your connection.')

      const order = await createOrder(total * 100, `ssbikes_${Date.now()}`)

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'SS Bikes',
          description: `${count} item${count > 1 ? 's' : ''} · e-cycle order`,
          order_id: order.orderId,
          prefill: { name: form.name, email: form.email, contact: form.phone },
          notes: { address: `${form.address}, ${form.city} ${form.pin}` },
          theme: { color: '#1fa34a' },
          modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
          handler: async (resp) => {
            const result = await verifyPayment(resp)
            if (result.verified) {
              // Payment is already captured at this point — a failure to save the
              // order record shouldn't be shown as a payment failure to the customer.
              try {
                await saveOrder(
                  buildOrderPayload({
                    paymentMethod: 'online',
                    razorpayOrderId: resp.razorpay_order_id,
                    razorpayPaymentId: result.paymentId,
                  }),
                )
              } catch (saveErr) {
                console.error('order save failed after successful payment:', saveErr)
              }
              clear()
              setPlaced({ method: 'online', paymentId: result.paymentId })
              resolve()
            } else {
              reject(new Error('Payment could not be verified. You were not charged.'))
            }
          },
        })
        rzp.on('payment.failed', (r) =>
          reject(new Error(r?.error?.description || 'Payment failed. Please try again.')),
        )
        rzp.open()
      })
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function placeCOD() {
    setError('')
    setBusy(true)
    try {
      await saveOrder(buildOrderPayload({ paymentMethod: 'cod' }))
      clear()
      setPlaced({ method: 'cod' })
    } catch (e) {
      setError(e.message || 'Could not place your order. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!formValid) return
    if (method === 'online') payWithRazorpay()
    else placeCOD()
  }

  // ---- success ----
  if (placed) {
    return (
      <section className="section">
        <div className="container center-narrow">
          <div className="form-ok__ico">
            <CheckCircle2 size={34} />
          </div>
          <h1 style={{ fontSize: '2rem' }}>Order confirmed!</h1>
          <p style={{ color: 'var(--muted)', margin: '12px 0 8px' }}>
            {placed.method === 'online'
              ? 'Payment received — thank you for choosing SS Bikes.'
              : 'Your Cash on Delivery order is placed — thank you for choosing SS Bikes.'}
          </p>
          {placed.paymentId && (
            <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: '0.9rem' }}>
              Payment ID: <b style={{ color: 'var(--ink)' }}>{placed.paymentId}</b>
            </p>
          )}
          <p style={{ color: 'var(--muted)', margin: '0 0 24px' }}>
            Our team will call you to arrange delivery. Be electrified! ⚡
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
            <form className="form-grid" onSubmit={onSubmit}>
              <div className="input">
                <label>Full name</label>
                <input required value={form.name} onChange={set('name')} placeholder="Your name" />
              </div>
              <div className="input">
                <label>Phone number</label>
                <input required type="tel" value={form.phone} onChange={set('phone')} placeholder="+91" />
              </div>
              <div className="input full">
                <label>Email</label>
                <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
              </div>
              <div className="input full">
                <label>Address</label>
                <input required value={form.address} onChange={set('address')} placeholder="House no., street, area" />
              </div>
              <div className="input">
                <label>City</label>
                <input required value={form.city} onChange={set('city')} placeholder="City" />
              </div>
              <div className="input">
                <label>PIN code</label>
                <input required value={form.pin} onChange={set('pin')} placeholder="000000" />
              </div>

              <div className="input full" style={{ marginTop: 8 }}>
                <div className="field__label">Payment method</div>
                <div className="pay-methods">
                  <label className={`pay-opt${method === 'online' ? ' active' : ''}${!rzpEnabled ? ' disabled' : ''}`}>
                    <input
                      type="radio"
                      name="pay"
                      value="online"
                      checked={method === 'online'}
                      disabled={!rzpEnabled}
                      onChange={() => setMethod('online')}
                    />
                    <CreditCard size={18} />
                    <div>
                      <b>Pay online</b>
                      <span>UPI · Cards · Net Banking · Wallets{!rzpEnabled ? ' (unavailable)' : ''}</span>
                    </div>
                  </label>
                  <label className={`pay-opt${method === 'cod' ? ' active' : ''}`}>
                    <input
                      type="radio"
                      name="pay"
                      value="cod"
                      checked={method === 'cod'}
                      onChange={() => setMethod('cod')}
                    />
                    <Banknote size={18} />
                    <div>
                      <b>Cash on Delivery</b>
                      <span>Pay when your e-cycle arrives</span>
                    </div>
                  </label>
                </div>
              </div>

              {method === 'online' && (
                <div className="input full">
                  <div className="notice">
                    <Lock size={16} /> Payments are processed securely by Razorpay. Your card details
                    never touch our servers.
                  </div>
                </div>
              )}

              {error && (
                <div className="input full">
                  <div className="notice notice--error">{error}</div>
                </div>
              )}

              <div className="input full">
                <button className="btn btn--primary btn--block" type="submit" disabled={busy || !formValid}>
                  {busy ? (
                    <>
                      <Loader2 size={16} className="spin" /> Processing…
                    </>
                  ) : method === 'online' ? (
                    `Pay ${formatINR(total)} securely`
                  ) : (
                    `Place order · ${formatINR(total)}`
                  )}
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
                <img src={l.product.colorImages?.[l.color] || l.product.image} alt={l.product.name} />
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
