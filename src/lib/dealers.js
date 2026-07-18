// Public endpoint hit by the "Become a dealer" form.
export async function submitDealerApplication(payload) {
  const r = await fetch('/api/dealer-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Could not submit your application.')
  return data
}
