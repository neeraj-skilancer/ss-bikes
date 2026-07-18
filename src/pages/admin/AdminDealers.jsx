import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, Phone, Mail, MapPin, Building2 } from 'lucide-react'
import { adminListDealerApplications, adminUpdateDealerApplicationStatus } from '../../lib/adminApi'

const STATUSES = ['New', 'Contacted', 'Approved', 'Rejected']

const STATUS_CLASS = {
  New: 'tag--blue',
  Contacted: 'tag--amber',
  Approved: 'tag--green',
  Rejected: 'tag--red',
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminDealers() {
  const [applications, setApplications] = useState(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter] = useState('all')

  function load() {
    adminListDealerApplications()
      .then((r) => setApplications(r.applications))
      .catch((e) => setError(e.message || 'Could not load applications.'))
  }

  useEffect(load, [])

  async function changeStatus(id, status) {
    setUpdating(id)
    try {
      await adminUpdateDealerApplicationStatus(id, status)
      setApplications((list) => list.map((a) => (a.id === id ? { ...a, status } : a)))
    } catch (e) {
      setError(e.message || 'Could not update application.')
    } finally {
      setUpdating(null)
    }
  }

  const visible = applications?.filter((a) => filter === 'all' || a.status === filter) || []

  return (
    <div>
      <div className="admin__head">
        <h1>Dealer Applications</h1>
        <p>{applications ? `${applications.length} applications received` : 'Loading…'}</p>
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      {applications && (
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

      {!applications && !error && (
        <div className="admin__loading">
          <Loader2 size={24} className="spin" />
        </div>
      )}

      {applications && visible.length === 0 && (
        <p className="admin__empty">No dealer applications here yet.</p>
      )}

      {applications && visible.length > 0 && (
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head admin-table__row--dealers">
            <span>Applicant</span>
            <span>Business</span>
            <span>City / State</span>
            <span>Applied</span>
            <span>Status</span>
            <span></span>
          </div>
          {visible.map((a) => (
            <div key={a.id}>
              <div className="admin-table__row admin-table__row--dealers">
                <span>{a.name}</span>
                <span>{a.businessName || '—'}</span>
                <span>
                  {a.city}, {a.state}
                </span>
                <span>{fmtDate(a.createdAt)}</span>
                <span>
                  <select
                    className={`status-select ${STATUS_CLASS[a.status] || ''}`}
                    value={a.status}
                    disabled={updating === a.id}
                    onChange={(e) => changeStatus(a.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </span>
                <button
                  className="icon-btn"
                  onClick={() => setOpenId(openId === a.id ? null : a.id)}
                  aria-label="Toggle details"
                >
                  {openId === a.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {openId === a.id && (
                <div className="admin-order-detail">
                  <div>
                    <h4>Contact</h4>
                    <p>
                      <Phone size={13} /> {a.phone}
                    </p>
                    <p>
                      <Mail size={13} /> {a.email}
                    </p>
                    <p>
                      <MapPin size={13} /> {a.city}, {a.state}
                    </p>
                    {a.businessName && (
                      <p>
                        <Building2 size={13} /> {a.businessName}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4>Message</h4>
                    <p style={{ display: 'block' }}>{a.message || '—'}</p>
                  </div>
                  <div>
                    <h4>Meta</h4>
                    <p>Applied: {fmtDate(a.createdAt)}</p>
                    <p>Last updated: {fmtDate(a.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
