import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import Razorpay from 'razorpay'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedIfEmpty } from './lib/firestore.js'
import { adminAuthRouter } from './routes/adminAuth.js'
import { productsRouter } from './routes/products.js'
import { ordersRouter } from './routes/orders.js'
import { dealersRouter } from './routes/dealers.js'
import { dealerStoresRouter } from './routes/dealerStores.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

try {
  process.loadEnvFile()
} catch {
  // Ignore error if .env file is missing, environment variables may be provided directly
}

const KEY_ID = process.env.RAZORPAY_KEY_ID
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const configured = Boolean(KEY_ID && KEY_SECRET)

// Razorpay client is only created when keys are present, so the site still
// runs (with Cash on Delivery) before payment keys are configured.
const razorpay = configured ? new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET }) : null

const app = express()
app.use(compression())
app.use(express.json())
app.use(cookieParser())

// Firestore-backed product catalog, order storage, and admin auth.
seedIfEmpty()
app.use('/api/admin', adminAuthRouter) // /api/admin/login, /logout, /me
app.use('/api', productsRouter) // /api/products, /api/admin/products...
app.use('/api', ordersRouter) // /api/orders, /api/admin/orders...
app.use('/api', dealersRouter) // /api/dealer-applications, /api/admin/dealer-applications...
app.use('/api', dealerStoresRouter) // /api/dealers, /api/dealers/:slug, /api/admin/dealer-stores...

// Tells the frontend whether online payment is available + the public key id.
app.get('/api/config', (_req, res) => {
  res.json({ razorpayEnabled: configured, keyId: KEY_ID || null })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, razorpay: configured })
})

// Create a Razorpay order. amount is in paise (₹1 = 100).
app.post('/api/order', async (req, res) => {
  if (!configured) return res.status(503).json({ error: 'Online payments are not configured yet.' })
  try {
    const { amount, currency = 'INR', receipt } = req.body || {}
    const paise = Math.round(Number(amount))
    if (!Number.isFinite(paise) || paise < 100) {
      return res.status(400).json({ error: 'Invalid amount.' })
    }
    const order = await razorpay.orders.create({
      amount: paise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    })
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: KEY_ID })
  } catch (err) {
    console.error('order error:', err?.message || err)
    res.status(500).json({ error: 'Could not create payment order.' })
  }
})

// Verify the payment signature returned by Razorpay Checkout.
app.post('/api/verify', (req, res) => {
  if (!configured) return res.status(503).json({ error: 'Online payments are not configured yet.' })
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ verified: false, error: 'Missing payment fields.' })
  }
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  // timing-safe compare
  const a = Buffer.from(expected)
  const b = Buffer.from(razorpay_signature)
  const verified = a.length === b.length && crypto.timingSafeEqual(a, b)
  if (!verified) return res.status(400).json({ verified: false })
  res.json({ verified: true, paymentId: razorpay_payment_id })
})

// Serve the built SPA
app.use(express.static(distDir, { maxAge: '1y', index: false }))
// SPA fallback (Express 5: use a catch-all middleware, not app.get('*'))
app.use((_req, res) => res.sendFile(path.join(distDir, 'index.html')))

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`SS Bikes server listening on :${port} — razorpay ${configured ? 'ON' : 'OFF'}`)
})
