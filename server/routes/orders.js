import { Router } from 'express'
import { db, FieldValue, nextOrderNumber } from '../lib/firestore.js'
import { requireAdmin } from '../lib/adminAuth.js'
import { getActiveDealerBySlug } from './dealerStores.js'

export const ordersRouter = Router()

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled']

function docToOrder(doc) {
  const d = doc.data()
  return {
    id: doc.id,
    ...d,
    createdAt: d.createdAt?.toDate?.().toISOString() || null,
    updatedAt: d.updatedAt?.toDate?.().toISOString() || null,
  }
}

// ---- Public: created by the checkout flow (COD immediately, online after payment verification) ----
ordersRouter.post('/orders', async (req, res) => {
  try {
    const {
      customer,
      items,
      subtotal,
      shipping = 0,
      total,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      dealerSlug,
    } = req.body || {}

    if (!customer?.name || !customer?.phone || !customer?.address) {
      return res.status(400).json({ error: 'Missing customer details.' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order has no items.' })
    }
    if (!['online', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method.' })
    }

    // Online orders must present a payment already verified by /api/verify.
    if (paymentMethod === 'online' && !razorpayPaymentId) {
      return res.status(400).json({ error: 'Online orders require a verified payment.' })
    }

    // Dealer-scoped checkout: re-validate everything server-side — never trust
    // the client for pincode eligibility or which products a dealer sells.
    let dealerInfo = null
    if (dealerSlug) {
      const dealer = await getActiveDealerBySlug(String(dealerSlug))
      if (!dealer) {
        return res.status(400).json({ error: 'This dealer is not currently available.' })
      }
      const pin = String(customer.pin || '')
      if (!dealer.pincodes?.includes(pin)) {
        return res.status(400).json({
          error: `This dealer only delivers within pincode${dealer.pincodes?.length > 1 ? 's' : ''}: ${(dealer.pincodes || []).join(', ')}.`,
        })
      }
      const dealerSlugs = new Set((dealer.products || []).map((p) => p.slug))
      const invalidItem = items.find((it) => !dealerSlugs.has(it.slug))
      if (invalidItem) {
        return res.status(400).json({ error: `"${invalidItem.name}" is not offered by this dealer.` })
      }
      dealerInfo = { dealerSlug: dealer.slug, dealerName: dealer.name }
    }

    const orderNumber = await nextOrderNumber()

    const order = {
      orderNumber,
      ...(dealerInfo || {}),
      customer: {
        name: String(customer.name),
        phone: String(customer.phone),
        email: String(customer.email || ''),
        address: String(customer.address),
        city: String(customer.city || ''),
        pin: String(customer.pin || ''),
      },
      items: items.map((it) => ({
        slug: String(it.slug),
        name: String(it.name),
        color: String(it.color || ''),
        qty: Math.max(1, Number(it.qty) || 1),
        price: Number(it.price) || 0,
      })),
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'Paid' : 'Pending (COD)',
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      status: 'Processing',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const ref = await db.collection('orders').add(order)
    res.status(201).json({ orderId: ref.id, orderNumber })
  } catch (err) {
    console.error('POST /orders error:', err?.message || err)
    res.status(500).json({ error: 'Could not save order.' })
  }
})

// ---- Admin ----
ordersRouter.get('/admin/orders', requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection('orders').orderBy('createdAt', 'desc').get()
    res.json({ orders: snap.docs.map(docToOrder) })
  } catch (err) {
    console.error('GET /admin/orders error:', err?.message || err)
    res.status(500).json({ error: 'Could not load orders.' })
  }
})

ordersRouter.patch('/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {}
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` })
    }
    const ref = db.collection('orders').doc(req.params.id)
    if (!(await ref.get()).exists) return res.status(404).json({ error: 'Order not found.' })
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() })
    const fresh = await ref.get()
    res.json({ order: docToOrder(fresh) })
  } catch (err) {
    console.error('PATCH /admin/orders error:', err?.message || err)
    res.status(500).json({ error: 'Could not update order.' })
  }
})

ordersRouter.get('/admin/stats', requireAdmin, async (_req, res) => {
  try {
    const [ordersSnap, productsSnap, dealerAppsSnap, dealerStoresSnap, recentSnap] = await Promise.all([
      db.collection('orders').get(),
      db.collection('products').get(),
      db.collection('dealerApplications').get(),
      db.collection('dealerStores').get(),
      db.collection('orders').orderBy('createdAt', 'desc').limit(5).get(),
    ])

    let revenue = 0
    const byStatus = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 }
    for (const doc of ordersSnap.docs) {
      const o = doc.data()
      if (byStatus[o.status] != null) byStatus[o.status] += 1
      if (o.status !== 'Cancelled') revenue += Number(o.total) || 0
    }

    const newDealerApplications = dealerAppsSnap.docs.filter((d) => d.data().status === 'New').length

    res.json({
      totalOrders: ordersSnap.size,
      totalProducts: productsSnap.size,
      revenue,
      byStatus,
      totalDealerApplications: dealerAppsSnap.size,
      newDealerApplications,
      totalDealerStores: dealerStoresSnap.docs.filter((d) => d.data().active !== false).length,
      recentOrders: recentSnap.docs.map(docToOrder),
    })
  } catch (err) {
    console.error('GET /admin/stats error:', err?.message || err)
    res.status(500).json({ error: 'Could not load stats.' })
  }
})
