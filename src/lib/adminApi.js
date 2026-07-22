// Admin API client — all calls include cookies so the signed session cookie
// set by /api/admin/login is sent along automatically.

async function call(path, opts = {}) {
  const r = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`)
  return data
}

// Leave email blank to sign in as the owner (single shared password).
export const adminLogin = (password, email) =>
  call('/api/admin/login', { method: 'POST', body: JSON.stringify({ password, email: email || undefined }) })

export const adminLogout = () => call('/api/admin/logout', { method: 'POST' })

export const adminMe = () => call('/api/admin/me')

export const adminListProducts = () => call('/api/admin/products')

export const adminCreateProduct = (product) =>
  call('/api/admin/products', { method: 'POST', body: JSON.stringify(product) })

export const adminUpdateProduct = (slug, product) =>
  call(`/api/admin/products/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  })

export const adminDeleteProduct = (slug) =>
  call(`/api/admin/products/${encodeURIComponent(slug)}`, { method: 'DELETE' })

export const adminListOrders = () => call('/api/admin/orders')

export const adminUpdateOrderStatus = (id, status) =>
  call(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const adminStats = () => call('/api/admin/stats')

export const adminListDealerApplications = () => call('/api/admin/dealer-applications')

export const adminUpdateDealerApplicationStatus = (id, status) =>
  call(`/api/admin/dealer-applications/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const adminListDealerStores = () => call('/api/admin/dealer-stores')

export const adminGetDealerStore = (slug) => call(`/api/admin/dealer-stores/${encodeURIComponent(slug)}`)

export const adminCreateDealerStore = (dealer) =>
  call('/api/admin/dealer-stores', { method: 'POST', body: JSON.stringify(dealer) })

export const adminUpdateDealerStore = (slug, dealer) =>
  call(`/api/admin/dealer-stores/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(dealer),
  })

export const adminDeleteDealerStore = (slug) =>
  call(`/api/admin/dealer-stores/${encodeURIComponent(slug)}`, { method: 'DELETE' })

export const adminListTestDriveBookings = () => call('/api/admin/test-drive-bookings')

export const adminUpdateTestDriveBookingStatus = (id, status) =>
  call(`/api/admin/test-drive-bookings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

// ---- Manage Users (owner-only) ----
export const adminListPermissionCatalog = () => call('/api/admin/permissions')

export const adminListUsers = () => call('/api/admin/users')

export const adminCreateUser = (user) =>
  call('/api/admin/users', { method: 'POST', body: JSON.stringify(user) })

export const adminUpdateUser = (id, patch) =>
  call(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) })

export const adminDeleteUser = (id) =>
  call(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const adminUpdateCodFees = (config) =>
  call('/api/admin/settings/cod-fees', { method: 'PUT', body: JSON.stringify(config) })
