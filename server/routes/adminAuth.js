import { Router } from 'express'
import { db } from '../lib/firestore.js'
import {
  adminConfigured,
  checkOwnerPassword,
  verifyPasswordHash,
  setSessionCookie,
  clearSessionCookie,
  resolveSession,
} from '../lib/adminAuth.js'

export const adminAuthRouter = Router()

// Unified login: leave email blank to sign in as the owner (single shared
// password, unchanged from before). Provide an email to sign in as a staff
// account created under Manage Users.
adminAuthRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email) {
    if (!adminConfigured()) {
      return res.status(503).json({ error: 'Admin login is not configured on this server yet.' })
    }
    if (!checkOwnerPassword(password)) {
      return res.status(401).json({ error: 'Incorrect password.' })
    }
    setSessionCookie(res, { type: 'owner' })
    return res.json({ ok: true })
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase()
    const snap = await db.collection('adminUsers').where('email', '==', normalizedEmail).limit(1).get()
    if (snap.empty) return res.status(401).json({ error: 'Incorrect email or password.' })
    const doc = snap.docs[0]
    const user = doc.data()
    if (user.active === false) return res.status(401).json({ error: 'This account has been deactivated.' })
    if (!verifyPasswordHash(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect email or password.' })
    }
    setSessionCookie(res, { type: 'staff', uid: doc.id })
    res.json({ ok: true })
  } catch (err) {
    console.error('POST /login (staff) error:', err?.message || err)
    res.status(500).json({ error: 'Could not sign in.' })
  }
})

adminAuthRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

adminAuthRouter.get('/me', async (req, res) => {
  const session = await resolveSession(req)
  if (!session) return res.json({ authenticated: false })
  res.json({
    authenticated: true,
    type: session.type,
    email: session.email || null,
    permissions: session.permissions,
  })
})
