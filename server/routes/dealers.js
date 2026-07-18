import { Router } from 'express'
import { db, FieldValue } from '../lib/firestore.js'
import { requireAdmin } from '../lib/adminAuth.js'

export const dealersRouter = Router()

const STATUSES = ['New', 'Contacted', 'Approved', 'Rejected']

function docToApplication(doc) {
  const d = doc.data()
  return {
    id: doc.id,
    ...d,
    createdAt: d.createdAt?.toDate?.().toISOString() || null,
    updatedAt: d.updatedAt?.toDate?.().toISOString() || null,
  }
}

// ---- Public: submitted from the "Become a dealer" form ----
dealersRouter.post('/dealer-applications', async (req, res) => {
  try {
    const { name, businessName, phone, email, city, state, message } = req.body || {}
    if (!name || !phone || !email || !city || !state) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    const application = {
      name: String(name),
      businessName: String(businessName || ''),
      phone: String(phone),
      email: String(email),
      city: String(city),
      state: String(state),
      message: String(message || ''),
      status: 'New',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const ref = await db.collection('dealerApplications').add(application)
    res.status(201).json({ id: ref.id })
  } catch (err) {
    console.error('POST /dealer-applications error:', err?.message || err)
    res.status(500).json({ error: 'Could not submit your application.' })
  }
})

// ---- Admin ----
dealersRouter.get('/admin/dealer-applications', requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection('dealerApplications').orderBy('createdAt', 'desc').get()
    res.json({ applications: snap.docs.map(docToApplication) })
  } catch (err) {
    console.error('GET /admin/dealer-applications error:', err?.message || err)
    res.status(500).json({ error: 'Could not load applications.' })
  }
})

dealersRouter.patch('/admin/dealer-applications/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {}
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` })
    }
    const ref = db.collection('dealerApplications').doc(req.params.id)
    if (!(await ref.get()).exists) return res.status(404).json({ error: 'Application not found.' })
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() })
    const fresh = await ref.get()
    res.json({ application: docToApplication(fresh) })
  } catch (err) {
    console.error('PATCH /admin/dealer-applications error:', err?.message || err)
    res.status(500).json({ error: 'Could not update application.' })
  }
})
