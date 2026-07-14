import crypto from 'node:crypto'

const COOKIE_NAME = 'ss_admin'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SESSION_SECRET = process.env.SESSION_SECRET || ADMIN_PASSWORD || 'dev-only-insecure-secret'

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verify(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!payload.exp || Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function adminConfigured() {
  return Boolean(ADMIN_PASSWORD)
}

export function checkPassword(password) {
  if (!ADMIN_PASSWORD) return false
  const a = Buffer.from(String(password))
  const b = Buffer.from(ADMIN_PASSWORD)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function setSessionCookie(res) {
  const token = sign({ role: 'admin', exp: Date.now() + MAX_AGE_MS })
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
    path: '/',
  })
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' })
}

export function isAdminRequest(req) {
  const token = req.cookies?.[COOKIE_NAME]
  return Boolean(verify(token))
}

export function requireAdmin(req, res, next) {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not authenticated.' })
  next()
}
