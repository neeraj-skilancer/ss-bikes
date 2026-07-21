import { Router } from 'express'
import { db, FieldValue } from '../lib/firestore.js'
import { requirePermission } from '../lib/adminAuth.js'

export const dealerStoresRouter = Router()

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const splitList = (s) =>
  String(s || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

function docToDealer(doc) {
  const d = doc.data()
  return {
    ...d,
    slug: doc.id,
    createdAt: d.createdAt?.toDate?.().toISOString() || null,
    updatedAt: d.updatedAt?.toDate?.().toISOString() || null,
  }
}

async function fetchProductsBySlug(slugs) {
  const bySlug = {}
  const docs = await Promise.all(slugs.map((slug) => db.collection('products').doc(slug).get()))
  for (const doc of docs) {
    if (doc.exists) bySlug[doc.id] = { ...doc.data(), slug: doc.id }
  }
  return bySlug
}

function buildDealerPayload(body) {
  return {
    name: body.name,
    tagline: body.tagline || '',
    city: body.city || '',
    state: body.state || '',
    address: body.address || '',
    pincodes: Array.isArray(body.pincodes) ? body.pincodes : splitList(body.pincodesText),
    phone: body.phone || '',
    email: body.email || '',
    logo: body.logo || '',
    active: body.active !== false,
    products: Array.isArray(body.products)
      ? body.products.map((p) => ({
          slug: p.slug,
          priceOverride: p.priceOverride != null && p.priceOverride !== '' ? Number(p.priceOverride) : null,
          stock: p.stock != null && p.stock !== '' ? Number(p.stock) : null,
        }))
      : [],
  }
}

// ---- Public ----

// Directory of active dealer stores.
dealerStoresRouter.get('/dealers', async (_req, res) => {
  try {
    const snap = await db.collection('dealerStores').get()
    const dealers = snap.docs
      .map(docToDealer)
      .filter((d) => d.active !== false)
      .map((d) => ({
        slug: d.slug,
        name: d.name,
        tagline: d.tagline,
        city: d.city,
        state: d.state,
        logo: d.logo,
        productCount: (d.products || []).length,
      }))
    res.json({ dealers })
  } catch (err) {
    console.error('GET /dealers error:', err?.message || err)
    res.status(500).json({ error: 'Could not load dealers.' })
  }
})

// A single dealer's public storefront, with products resolved against the catalog.
dealerStoresRouter.get('/dealers/:slug', async (req, res) => {
  try {
    const ref = db.collection('dealerStores').doc(req.params.slug)
    const doc = await ref.get()
    if (!doc.exists || doc.data().active === false) {
      return res.status(404).json({ error: 'Dealer not found.' })
    }
    const dealer = docToDealer(doc)
    const slugs = (dealer.products || []).map((p) => p.slug)
    const catalog = await fetchProductsBySlug(slugs)

    const products = (dealer.products || [])
      .map((p) => {
        const base = catalog[p.slug]
        if (!base || base.active === false) return null
        return {
          ...base,
          price: p.priceOverride != null ? p.priceOverride : base.price,
          dealerStock: p.stock,
          soldOut: p.stock === 0 ? true : base.soldOut,
        }
      })
      .filter(Boolean)

    res.json({ dealer: { ...dealer, products: undefined }, products })
  } catch (err) {
    console.error('GET /dealers/:slug error:', err?.message || err)
    res.status(500).json({ error: 'Could not load this dealer.' })
  }
})

// ---- Admin ----

dealerStoresRouter.get('/admin/dealer-stores', requirePermission('viewDealers'), async (_req, res) => {
  try {
    const snap = await db.collection('dealerStores').get()
    res.json({ dealers: snap.docs.map(docToDealer) })
  } catch (err) {
    console.error('GET /admin/dealer-stores error:', err?.message || err)
    res.status(500).json({ error: 'Could not load dealer stores.' })
  }
})

dealerStoresRouter.get('/admin/dealer-stores/:slug', requirePermission('viewDealers'), async (req, res) => {
  try {
    const doc = await db.collection('dealerStores').doc(req.params.slug).get()
    if (!doc.exists) return res.status(404).json({ error: 'Dealer not found.' })
    res.json({ dealer: docToDealer(doc) })
  } catch (err) {
    console.error('GET /admin/dealer-stores/:slug error:', err?.message || err)
    res.status(500).json({ error: 'Could not load dealer.' })
  }
})

dealerStoresRouter.post('/admin/dealer-stores', requirePermission('manageDealers'), async (req, res) => {
  try {
    const body = req.body || {}
    if (!body.name) return res.status(400).json({ error: 'name is required.' })
    const slug = slugify(body.slug || body.name)
    if (!slug) return res.status(400).json({ error: 'Could not derive a valid slug from the name.' })

    const ref = db.collection('dealerStores').doc(slug)
    if ((await ref.get()).exists) {
      return res.status(409).json({ error: `A dealer with slug "${slug}" already exists.` })
    }

    const data = {
      ...buildDealerPayload(body),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }
    await ref.set(data)
    res.status(201).json({ dealer: { ...data, slug } })
  } catch (err) {
    console.error('POST /admin/dealer-stores error:', err?.message || err)
    res.status(500).json({ error: 'Could not create dealer.' })
  }
})

// Partial update: only fields present in the body are touched. This lets the
// dealer-info form and the dedicated dealer-products screen each save
// independently without clobbering fields the other one owns.
dealerStoresRouter.put('/admin/dealer-stores/:slug', requirePermission('manageDealers'), async (req, res) => {
  try {
    const ref = db.collection('dealerStores').doc(req.params.slug)
    if (!(await ref.get()).exists) return res.status(404).json({ error: 'Dealer not found.' })

    const body = req.body || {}
    const update = { updatedAt: FieldValue.serverTimestamp() }
    const stringFields = ['name', 'tagline', 'city', 'state', 'address', 'phone', 'email', 'logo']
    for (const f of stringFields) if (body[f] !== undefined) update[f] = body[f]
    if (body.pincodes !== undefined || body.pincodesText !== undefined) {
      update.pincodes = Array.isArray(body.pincodes) ? body.pincodes : splitList(body.pincodesText)
    }
    if (body.active !== undefined) update.active = Boolean(body.active)
    if (body.products !== undefined) {
      update.products = Array.isArray(body.products)
        ? body.products.map((p) => ({
            slug: p.slug,
            priceOverride: p.priceOverride != null && p.priceOverride !== '' ? Number(p.priceOverride) : null,
            stock: p.stock != null && p.stock !== '' ? Number(p.stock) : null,
          }))
        : []
    }

    await ref.update(update)
    const fresh = await ref.get()
    res.json({ dealer: docToDealer(fresh) })
  } catch (err) {
    console.error('PUT /admin/dealer-stores error:', err?.message || err)
    res.status(500).json({ error: 'Could not update dealer.' })
  }
})

dealerStoresRouter.delete('/admin/dealer-stores/:slug', requirePermission('manageDealers'), async (req, res) => {
  try {
    await db.collection('dealerStores').doc(req.params.slug).delete()
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /admin/dealer-stores error:', err?.message || err)
    res.status(500).json({ error: 'Could not delete dealer.' })
  }
})

// Exported so the orders route can validate dealer-scoped checkouts.
export async function getActiveDealerBySlug(slug) {
  const doc = await db.collection('dealerStores').doc(slug).get()
  if (!doc.exists) return null
  const dealer = docToDealer(doc)
  if (dealer.active === false) return null
  return dealer
}
