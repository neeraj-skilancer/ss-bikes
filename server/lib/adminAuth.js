import crypto from 'node:crypto'
import { db } from './firestore.js'

const COOKIE_NAME = 'ss_admin'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SESSION_SECRET = process.env.SESSION_SECRET || ADMIN_PASSWORD || 'dev-only-insecure-secret'

// The permission catalog — single source of truth for both server-side
// enforcement and what the "Manage Users" screen renders as checkboxes.
export const PERMISSIONS = [
  { key: 'viewOrders', label: 'View orders', group: 'Orders' },
  { key: 'manageOrders', label: 'Update order status', group: 'Orders' },
  { key: 'viewProducts', label: 'View products', group: 'Products' },
  { key: 'addProducts', label: 'Add new products', group: 'Products' },
  { key: 'editProductDetails', label: 'Edit product details (name, images, specs)', group: 'Products' },
  { key: 'editPricing', label: 'Edit pricing', group: 'Products' },
  { key: 'editInventory', label: 'Edit stock / sold-out / visibility', group: 'Products' },
  { key: 'deleteProducts', label: 'Delete products', group: 'Products' },
  { key: 'viewDealers', label: 'View dealer stores & applications', group: 'Dealers' },
  { key: 'manageDealers', label: 'Manage dealer stores & applications', group: 'Dealers' },
  { key: 'viewTestDrives', label: 'View test drive bookings', group: 'Test Drives' },
  { key: 'manageTestDrives', label: 'Update test drive status', group: 'Test Drives' },
]

const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key)

export function emptyPermissions() {
  return Object.fromEntries(PERMISSION_KEYS.map((k) => [k, false]))
}

function allPermissionsGranted() {
  return Object.fromEntries(PERMISSION_KEYS.map((k) => [k, true]))
}

// ---- Password hashing (Node's built-in scrypt — no external dependency) ----
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPasswordHash(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const candidate = crypto.scryptSync(String(password), salt, 64).toString('hex')
  const a = Buffer.from(candidate, 'hex')
  const b = Buffer.from(hash, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// ---- Signed session cookie ----
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

export function checkOwnerPassword(password) {
  if (!ADMIN_PASSWORD) return false
  const a = Buffer.from(String(password))
  const b = Buffer.from(ADMIN_PASSWORD)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// session: { type: 'owner' } | { type: 'staff', uid }
export function setSessionCookie(res, session) {
  const token = sign({ ...session, exp: Date.now() + MAX_AGE_MS })
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

function getRawSession(req) {
  return verify(req.cookies?.[COOKIE_NAME])
}

// Resolves the current request into { type, uid?, email?, permissions } or null.
// Staff permissions are read fresh from Firestore on every call — so editing or
// revoking a staff member's access takes effect on their very next request,
// not just the next time they log in.
export async function resolveSession(req) {
  const raw = getRawSession(req)
  if (!raw) return null
  if (raw.type === 'owner') {
    return { type: 'owner', permissions: allPermissionsGranted() }
  }
  if (raw.type === 'staff' && raw.uid) {
    const doc = await db.collection('adminUsers').doc(raw.uid).get()
    if (!doc.exists || doc.data().active === false) return null
    const data = doc.data()
    return {
      type: 'staff',
      uid: doc.id,
      email: data.email,
      permissions: { ...emptyPermissions(), ...data.permissions },
    }
  }
  return null
}

export function isAdminRequest(req) {
  return Boolean(getRawSession(req))
}

export async function requireAdmin(req, res, next) {
  const session = await resolveSession(req)
  if (!session) return res.status(401).json({ error: 'Not authenticated.' })
  req.adminSession = session
  next()
}

export function requirePermission(key) {
  return async (req, res, next) => {
    const session = await resolveSession(req)
    if (!session) return res.status(401).json({ error: 'Not authenticated.' })
    if (!session.permissions[key]) {
      return res.status(403).json({ error: 'You do not have permission to do this.' })
    }
    req.adminSession = session
    next()
  }
}

export function requireAnyPermission(keys) {
  return async (req, res, next) => {
    const session = await resolveSession(req)
    if (!session) return res.status(401).json({ error: 'Not authenticated.' })
    if (!keys.some((k) => session.permissions[k])) {
      return res.status(403).json({ error: 'You do not have permission to do this.' })
    }
    req.adminSession = session
    next()
  }
}

// Manage Users is intentionally owner-only and NOT a grantable permission —
// letting a staff account manage other accounts would allow privilege escalation.
export function requireOwner(req, res, next) {
  const raw = getRawSession(req)
  if (!raw || raw.type !== 'owner') {
    return res.status(403).json({ error: 'Only the owner account can do this.' })
  }
  next()
}
