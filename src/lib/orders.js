// Orders get a short sequential number (1000, 1001, …) assigned server-side.
// Older orders created before that existed fall back to a 4-char id fragment.
export function formatOrderNumber(order) {
  if (order?.orderNumber) return `#${order.orderNumber}`
  return `#${(order?.id || '').slice(0, 4).toUpperCase()}`
}
