// Frontend helpers for the Razorpay checkout flow.
// The secret key never touches the browser — orders are created and verified
// on the server (see /server/index.js).

const RZP_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

export async function getPaymentConfig() {
  try {
    const r = await fetch('/api/config')
    if (!r.ok) return { razorpayEnabled: false }
    return await r.json()
  } catch {
    return { razorpayEnabled: false }
  }
}

export function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = RZP_SCRIPT
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export async function createOrder(amountPaise, receipt) {
  const r = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt }),
  })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e.error || 'Could not start payment.')
  }
  return r.json()
}

export async function verifyPayment(payload) {
  const r = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return r.json()
}

// Persists a placed order (COD immediately, online after payment verification)
// so it shows up in the admin dashboard.
export async function saveOrder(order) {
  const r = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Could not save the order.')
  return data
}
