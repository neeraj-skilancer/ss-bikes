import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { adminListTestDriveBookings, adminUpdateTestDriveBookingStatus } from '../../lib/adminApi'

const STATUSES = ['New', 'Contacted', 'Completed', 'Cancelled']

const STATUS_CLASS = {
  New: 'tag--blue',
  Contacted: 'tag--amber',
  Completed: 'tag--green',
  Cancelled: 'tag--red',
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminTestDrive() {
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter] = useState('all')

  function load() {
    adminListTestDriveBookings()
      .then((r) => setBookings(r.bookings))
      .catch((e) => setError(e.message || 'Could not load bookings.'))
  }

  useEffect(load, [])

  async function changeStatus(id, status) {
    setUpdating(id)
    try {
      await adminUpdateTestDriveBookingStatus(id, status)
      setBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)))
    } catch (e) {
      setError(e.message || 'Could not update booking.')
    } finally {
      setUpdating(null)
    }
  }

  const visible = bookings?.filter((b) => filter === 'all' || b.status === filter) || []

  return (
    <div>
      <div className="admin__head">
        <h1>Test Drive Bookings</h1>
        <p>{bookings ? `${bookings.length} bookings received` : 'Loading…'}</p>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {bookings && (
        <div className="toolbar" style={{ marginBottom: 18 }}>
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              className={`pill${filter === s ? ' active' : ''}`}
              onClick={() => setFilter(s)}
              type="button"
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      )}

      {!bookings && !error && (
        <div className="admin__loading">
          <Loader2 size={24} className="spin" />
        </div>
      )}

      {bookings && visible.length === 0 && <p className="admin__empty">No test drive bookings here yet.</p>}

      {bookings && visible.length > 0 && (
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head admin-table__row--dealers">
            <span>Name</span>
            <span>Phone</span>
            <span>Model</span>
            <span>Date / Location</span>
            <span>Status</span>
            <span></span>
          </div>
          {visible.map((b) => (
            <div className="admin-table__row admin-table__row--dealers" key={b.id}>
              <span>
                <b>{b.name}</b>
                <br />
                <small style={{ color: 'var(--muted)' }}>Requested {fmtDate(b.createdAt)}</small>
              </span>
              <span>{b.phone}</span>
              <span>{b.model || '—'}</span>
              <span>
                {b.date || '—'}
                <br />
                <small style={{ color: 'var(--muted)' }}>{b.location}</small>
              </span>
              <span>
                <select
                  className={`status-select ${STATUS_CLASS[b.status] || ''}`}
                  value={b.status}
                  disabled={updating === b.id}
                  onChange={(e) => changeStatus(b.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </span>
              <span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
