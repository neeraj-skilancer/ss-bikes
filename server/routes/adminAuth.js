import { Router } from 'express'
import { adminConfigured, checkPassword, setSessionCookie, clearSessionCookie, isAdminRequest } from '../lib/adminAuth.js'

export const adminAuthRouter = Router()

adminAuthRouter.post('/login', (req, res) => {
  if (!adminConfigured()) {
    return res.status(503).json({ error: 'Admin login is not configured on this server yet.' })
  }
  const { password } = req.body || {}
  if (!checkPassword(password)) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }
  setSessionCookie(res)
  res.json({ ok: true })
})

adminAuthRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

adminAuthRouter.get('/me', (req, res) => {
  res.json({ authenticated: isAdminRequest(req) })
})
