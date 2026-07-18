// Public read endpoints for dealer storefronts.

export async function fetchDealerDirectory() {
  const r = await fetch('/api/dealers')
  if (!r.ok) throw new Error('Could not load dealers.')
  return r.json()
}

export async function fetchDealer(slug) {
  const r = await fetch(`/api/dealers/${encodeURIComponent(slug)}`)
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Could not load this dealer.')
  return data
}
