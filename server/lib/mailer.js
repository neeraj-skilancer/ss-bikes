import nodemailer from 'nodemailer'

const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_HOST = process.env.SMTP_HOST // optional — omit to use Gmail's defaults
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'neeraj@ssbikes.in'

const configured = Boolean(SMTP_USER && SMTP_PASS)

const transporter = configured
  ? nodemailer.createTransport(
      SMTP_HOST
        ? { host: SMTP_HOST, port: SMTP_PORT || 587, secure: SMTP_PORT === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } }
        : { service: 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS } },
    )
  : null

if (!configured) {
  console.log('Email notifications OFF — set SMTP_USER / SMTP_PASS to enable.')
}

// Fire-and-forget: notification failures must never break the request that
// triggered them (an order/application/booking still has to save).
async function send(subject, html) {
  if (!configured) return
  try {
    await transporter.sendMail({
      from: `"SS Bikes" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject,
      html,
    })
  } catch (err) {
    console.error('Email send failed:', err?.message || err)
  }
}

const row = (label, value) => (value ? `<tr><td style="padding:4px 12px 4px 0;color:#5f6b58;white-space:nowrap">${label}</td><td style="padding:4px 0;font-weight:600">${value}</td></tr>` : '')

const wrap = (title, rowsHtml, footerUrl) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
    <h2 style="color:#178a3d;margin-bottom:4px">${title}</h2>
    <table style="border-collapse:collapse;margin-top:12px">${rowsHtml}</table>
    ${footerUrl ? `<p style="margin-top:20px"><a href="${footerUrl}" style="color:#178a3d">Open in admin →</a></p>` : ''}
  </div>`

const ADMIN_BASE = process.env.ADMIN_BASE_URL || 'https://ss-bikes-288096108076.us-central1.run.app'

export function notifyNewOrder(order, orderNumber) {
  const items = (order.items || [])
    .map((it) => `${it.name}${it.color ? ` (${it.color})` : ''} × ${it.qty}`)
    .join('<br>')
  const rows =
    row('Order', `#${orderNumber}`) +
    row('Customer', order.customer?.name) +
    row('Phone', order.customer?.phone) +
    row('Email', order.customer?.email) +
    row('Address', `${order.customer?.address}, ${order.customer?.city} ${order.customer?.pin}`) +
    row('Items', items) +
    row('Total', `₹${Number(order.total).toLocaleString('en-IN')}`) +
    row('Payment', order.paymentMethod === 'online' ? 'Paid online' : 'Cash on Delivery') +
    row('Dealer', order.dealerName)
  return send(
    `New order #${orderNumber} — ₹${Number(order.total).toLocaleString('en-IN')}`,
    wrap('New order received', rows, `${ADMIN_BASE}/admin/orders`),
  )
}

export function notifyDealerApplication(app) {
  const rows =
    row('Name', app.name) +
    row('Business', app.businessName) +
    row('Phone', app.phone) +
    row('Email', app.email) +
    row('Location', `${app.city}, ${app.state}`) +
    row('Message', app.message)
  return send(
    `New dealer application — ${app.name} (${app.city})`,
    wrap('New dealer application', rows, `${ADMIN_BASE}/admin/dealers`),
  )
}

export function notifyTestDrive(booking) {
  const rows =
    row('Name', booking.name) +
    row('Phone', booking.phone) +
    row('Model', booking.model) +
    row('Preferred date', booking.date) +
    row('Location', booking.location)
  return send(`New test drive booking — ${booking.name}`, wrap('New test drive request', rows))
}

export const emailConfigured = configured
