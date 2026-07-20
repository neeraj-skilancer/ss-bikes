import { Router } from 'express'
import { db, FieldValue } from '../lib/firestore.js'
import { requireAdmin } from '../lib/adminAuth.js'
import { notifyTestDrive } from '../lib/mailer.js'

export const testDriveRouter = Router()

const STATUSES = ['New', 'Contacted', 'Completed', 'Cancelled']

function docToBooking(doc) {
  const d = doc.data()
  return {
    id: doc.id,
    ...d,
    createdAt: d.createdAt?.toDate?.().toISOString() || null,
    updatedAt: d.updatedAt?.toDate?.().toISOString() || null,
  }
}

// ---- Public: submitted from the "Book a Test Drive" form ----
testDriveRouter.post('/test-drive', async (req, res) => {
  try {
    const { name, phone, model, date, location } = req.body || {}
    if (!name || !phone || !location) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    const booking = {
      name: String(name),
      phone: String(phone),
      model: String(model || ''),
      date: String(date || ''),
      location: String(location),
      status: 'New',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const ref = await db.collection('testDriveBookings').add(booking)
    notifyTestDrive(booking).catch(() => {})
    res.status(201).json({ id: ref.id })
  } catch (err) {
    console.error('POST /test-drive error:', err?.message || err)
    res.status(500).json({ error: 'Could not submit your booking.' })
  }
})

// ---- Admin ----
testDriveRouter.get('/admin/test-drive-bookings', requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection('testDriveBookings').orderBy('createdAt', 'desc').get()
    res.json({ bookings: snap.docs.map(docToBooking) })
  } catch (err) {
    console.error('GET /admin/test-drive-bookings error:', err?.message || err)
    res.status(500).json({ error: 'Could not load bookings.' })
  }
})

testDriveRouter.patch('/admin/test-drive-bookings/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {}
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` })
    }
    const ref = db.collection('testDriveBookings').doc(req.params.id)
    if (!(await ref.get()).exists) return res.status(404).json({ error: 'Booking not found.' })
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() })
    const fresh = await ref.get()
    res.json({ booking: docToBooking(fresh) })
  } catch (err) {
    console.error('PATCH /admin/test-drive-bookings error:', err?.message || err)
    res.status(500).json({ error: 'Could not update booking.' })
  }
})
