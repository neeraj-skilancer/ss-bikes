import { Router } from 'express'
import { db, FieldValue } from '../lib/firestore.js'
import { requireOwner, hashPassword, emptyPermissions, PERMISSIONS } from '../lib/adminAuth.js'

export const adminUsersRouter = Router()

function docToUser(doc) {
  const d = doc.data()
  return {
    id: doc.id,
    email: d.email,
    permissions: { ...emptyPermissions(), ...d.permissions },
    active: d.active !== false,
    createdAt: d.createdAt?.toDate?.().toISOString() || null,
    updatedAt: d.updatedAt?.toDate?.().toISOString() || null,
  }
}

// Exposes the permission catalog so the frontend renders checkboxes/labels
// from the same source of truth the server enforces against.
adminUsersRouter.get('/admin/permissions', requireOwner, (_req, res) => {
  res.json({ permissions: PERMISSIONS })
})

adminUsersRouter.get('/admin/users', requireOwner, async (_req, res) => {
  try {
    const snap = await db.collection('adminUsers').get()
    res.json({ users: snap.docs.map(docToUser) })
  } catch (err) {
    console.error('GET /admin/users error:', err?.message || err)
    res.status(500).json({ error: 'Could not load users.' })
  }
})

adminUsersRouter.post('/admin/users', requireOwner, async (req, res) => {
  try {
    const { email, password, permissions } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }
    const normalizedEmail = String(email).trim().toLowerCase()

    const existing = await db.collection('adminUsers').where('email', '==', normalizedEmail).limit(1).get()
    if (!existing.empty) {
      return res.status(409).json({ error: 'A user with this email already exists.' })
    }

    const data = {
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      permissions: { ...emptyPermissions(), ...permissions },
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }
    const ref = await db.collection('adminUsers').add(data)
    const fresh = await ref.get()
    res.status(201).json({ user: docToUser(fresh) })
  } catch (err) {
    console.error('POST /admin/users error:', err?.message || err)
    res.status(500).json({ error: 'Could not create user.' })
  }
})

adminUsersRouter.put('/admin/users/:id', requireOwner, async (req, res) => {
  try {
    const ref = db.collection('adminUsers').doc(req.params.id)
    if (!(await ref.get()).exists) return res.status(404).json({ error: 'User not found.' })

    const body = req.body || {}
    const update = { updatedAt: FieldValue.serverTimestamp() }
    if (body.permissions !== undefined) {
      update.permissions = { ...emptyPermissions(), ...body.permissions }
    }
    if (body.active !== undefined) update.active = Boolean(body.active)
    if (body.password) {
      if (String(body.password).length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' })
      }
      update.passwordHash = hashPassword(body.password)
    }

    await ref.update(update)
    const fresh = await ref.get()
    res.json({ user: docToUser(fresh) })
  } catch (err) {
    console.error('PUT /admin/users error:', err?.message || err)
    res.status(500).json({ error: 'Could not update user.' })
  }
})

adminUsersRouter.delete('/admin/users/:id', requireOwner, async (req, res) => {
  try {
    await db.collection('adminUsers').doc(req.params.id).delete()
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /admin/users error:', err?.message || err)
    res.status(500).json({ error: 'Could not delete user.' })
  }
})
