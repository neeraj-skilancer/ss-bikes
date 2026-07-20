export async function submitTestDrive(payload) {
  const r = await fetch('/api/test-drive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Could not submit your booking.')
  return data
}
