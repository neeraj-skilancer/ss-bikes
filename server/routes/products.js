import { Router } from 'express'
import { db, FieldValue } from '../lib/firestore.js'
import { requireAdmin } from '../lib/adminAuth.js'

export const productsRouter = Router()

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

function docToProduct(doc) {
  const d = doc.data()
  return {
    ...d,
    slug: doc.id,
    createdAt: d.createdAt?.toDate?.().toISOString() || null,
    updatedAt: d.updatedAt?.toDate?.().toISOString() || null,
  }
}

// ---- Public ----

productsRouter.get('/products', async (_req, res) => {
  try {
    const snap = await db.collection('products').get()
    const items = snap.docs.map(docToProduct).filter((p) => p.active !== false)
    res.json({ products: items })
  } catch (err) {
    console.error('GET /products error:', err?.message || err)
    res.status(500).json({ error: 'Could not load products.' })
  }
})

// ---- Admin ----

productsRouter.get('/admin/products', requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection('products').get()
    res.json({ products: snap.docs.map(docToProduct) })
  } catch (err) {
    console.error('GET /admin/products error:', err?.message || err)
    res.status(500).json({ error: 'Could not load products.' })
  }
})

productsRouter.post('/admin/products', requireAdmin, async (req, res) => {
  try {
    const body = req.body || {}
    if (!body.name || !body.category || body.price == null) {
      return res.status(400).json({ error: 'name, category and price are required.' })
    }
    let slug = slugify(body.slug || body.name)
    if (!slug) return res.status(400).json({ error: 'Could not derive a valid slug from the name.' })

    const ref = db.collection('products').doc(slug)
    if ((await ref.get()).exists) {
      return res.status(409).json({ error: `A product with slug "${slug}" already exists.` })
    }

    const data = {
      name: body.name,
      category: body.category,
      tagline: body.tagline || '',
      price: Number(body.price),
      compareAt: body.compareAt != null && body.compareAt !== '' ? Number(body.compareAt) : null,
      badge: body.badge || null,
      image: body.image || '',
      colors: Array.isArray(body.colors) ? body.colors : [],
      colorImages: body.colorImages && typeof body.colorImages === 'object' ? body.colorImages : {},
      range: body.range || '',
      motorW: body.motorW != null && body.motorW !== '' ? Number(body.motorW) : null,
      short: body.short || '',
      specs: body.specs && typeof body.specs === 'object' ? body.specs : {},
      soldOut: Boolean(body.soldOut),
      active: body.active !== false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }
    await ref.set(data)
    res.status(201).json({ product: { ...data, slug } })
  } catch (err) {
    console.error('POST /admin/products error:', err?.message || err)
    res.status(500).json({ error: 'Could not create product.' })
  }
})

productsRouter.put('/admin/products/:slug', requireAdmin, async (req, res) => {
  try {
    const ref = db.collection('products').doc(req.params.slug)
    const existing = await ref.get()
    if (!existing.exists) return res.status(404).json({ error: 'Product not found.' })

    const body = req.body || {}
    const update = { updatedAt: FieldValue.serverTimestamp() }
    const fields = [
      'name', 'category', 'tagline', 'image', 'range', 'short', 'badge',
    ]
    for (const f of fields) if (body[f] !== undefined) update[f] = body[f]
    if (body.price !== undefined) update.price = Number(body.price)
    if (body.compareAt !== undefined) update.compareAt = body.compareAt === '' ? null : Number(body.compareAt)
    if (body.motorW !== undefined) update.motorW = body.motorW === '' ? null : Number(body.motorW)
    if (body.colors !== undefined) update.colors = Array.isArray(body.colors) ? body.colors : []
    if (body.colorImages !== undefined) update.colorImages = body.colorImages || {}
    if (body.specs !== undefined) update.specs = body.specs || {}
    if (body.soldOut !== undefined) update.soldOut = Boolean(body.soldOut)
    if (body.active !== undefined) update.active = Boolean(body.active)

    await ref.update(update)
    const fresh = await ref.get()
    res.json({ product: docToProduct(fresh) })
  } catch (err) {
    console.error('PUT /admin/products error:', err?.message || err)
    res.status(500).json({ error: 'Could not update product.' })
  }
})

productsRouter.delete('/admin/products/:slug', requireAdmin, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.slug).delete()
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /admin/products error:', err?.message || err)
    res.status(500).json({ error: 'Could not delete product.' })
  }
})
