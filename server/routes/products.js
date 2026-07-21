import { Router } from 'express'
import { db, FieldValue } from '../lib/firestore.js'
import { requirePermission, requireAnyPermission } from '../lib/adminAuth.js'

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

productsRouter.get('/admin/products', requirePermission('viewProducts'), async (_req, res) => {
  try {
    const snap = await db.collection('products').get()
    res.json({ products: snap.docs.map(docToProduct) })
  } catch (err) {
    console.error('GET /admin/products error:', err?.message || err)
    res.status(500).json({ error: 'Could not load products.' })
  }
})

productsRouter.post('/admin/products', requirePermission('addProducts'), async (req, res) => {
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
      amazonUrl: body.amazonUrl || null,
      flipkartUrl: body.flipkartUrl || null,
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

// Field-level enforcement: a caller needs the *specific* permission for the
// category of field they're changing, not just blanket product-edit access.
// This is checked here (server-side) regardless of what the client sends —
// the frontend also hides/disables these fields, but that's UX, not security.
const PRICING_FIELDS = ['price', 'compareAt']
const INVENTORY_FIELDS = ['soldOut', 'active']
const DETAIL_FIELDS = [
  'name', 'category', 'tagline', 'image', 'range', 'short', 'badge',
  'colors', 'colorImages', 'specs', 'motorW', 'amazonUrl', 'flipkartUrl',
]

productsRouter.put(
  '/admin/products/:slug',
  requireAnyPermission(['editPricing', 'editInventory', 'editProductDetails']),
  async (req, res) => {
    try {
      const ref = db.collection('products').doc(req.params.slug)
      const existing = await ref.get()
      if (!existing.exists) return res.status(404).json({ error: 'Product not found.' })

      const body = req.body || {}
      const perms = req.adminSession.permissions
      const update = { updatedAt: FieldValue.serverTimestamp() }
      const blocked = []

      for (const f of PRICING_FIELDS) {
        if (body[f] === undefined) continue
        if (!perms.editPricing) {
          blocked.push(f)
          continue
        }
        update[f] = f === 'compareAt' ? (body[f] === '' ? null : Number(body[f])) : Number(body[f])
      }
      for (const f of INVENTORY_FIELDS) {
        if (body[f] === undefined) continue
        if (!perms.editInventory) {
          blocked.push(f)
          continue
        }
        update[f] = Boolean(body[f])
      }
      for (const f of DETAIL_FIELDS) {
        if (body[f] === undefined) continue
        if (!perms.editProductDetails) {
          blocked.push(f)
          continue
        }
        update[f] = f === 'motorW' ? (body[f] === '' ? null : Number(body[f])) : body[f]
      }

      if (blocked.length > 0) {
        return res.status(403).json({ error: `You don't have permission to edit: ${blocked.join(', ')}.` })
      }

      await ref.update(update)
      const fresh = await ref.get()
      res.json({ product: docToProduct(fresh) })
    } catch (err) {
      console.error('PUT /admin/products error:', err?.message || err)
      res.status(500).json({ error: 'Could not update product.' })
    }
  },
)

productsRouter.delete('/admin/products/:slug', requirePermission('deleteProducts'), async (req, res) => {
  try {
    await db.collection('products').doc(req.params.slug).delete()
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /admin/products error:', err?.message || err)
    res.status(500).json({ error: 'Could not delete product.' })
  }
})
