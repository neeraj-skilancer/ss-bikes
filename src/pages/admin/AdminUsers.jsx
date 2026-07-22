import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, X, Shield } from 'lucide-react'
import {
  adminListPermissionCatalog,
  adminListUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
} from '../../lib/adminApi'
import { useAdminSession } from '../../context/AdminSessionContext'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminUsers() {
  const { type } = useAdminSession()
  const [users, setUsers] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | { id?, email, password, permissions, active }
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (type !== 'owner') return
    Promise.all([adminListPermissionCatalog(), adminListUsers()])
      .then(([catalogRes, usersRes]) => {
        setCatalog(catalogRes.permissions || [])
        setUsers(usersRes.users || [])
      })
      .catch((err) => {
        setError(err.message || 'Could not load users and permissions catalog.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [type])

  if (type !== 'owner') {
    return (
      <div style={{ padding: 24 }}>
        <div className="notice notice--error">
          Access Denied: Only the owner account can access the user management dashboard.
        </div>
      </div>
    )
  }

  function startCreate() {
    // Start with all permission keys mapped to false
    const initialPerms = {}
    catalog.forEach((p) => {
      initialPerms[p.key] = false
    })
    setEditing({
      email: '',
      password: '',
      permissions: initialPerms,
      active: true,
    })
  }

  function startEdit(user) {
    // Ensure all permission keys in the catalog exist in the user's permissions object
    const perms = { ...user.permissions }
    catalog.forEach((p) => {
      if (perms[p.key] === undefined) {
        perms[p.key] = false
      }
    })
    setEditing({
      id: user.id,
      email: user.email,
      password: '', // blank by default when editing
      permissions: perms,
      active: user.active !== false,
    })
  }

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editing.id) {
        // Update user
        const patch = {
          permissions: editing.permissions,
          active: editing.active,
        }
        if (editing.password) {
          patch.password = editing.password
        }
        const res = await adminUpdateUser(editing.id, patch)
        setUsers((list) => list.map((u) => (u.id === editing.id ? res.user : u)))
        setSuccess(`User ${editing.email} updated successfully.`)
      } else {
        // Create user
        const res = await adminCreateUser({
          email: editing.email,
          password: editing.password,
          permissions: editing.permissions,
        })
        setUsers((list) => [...list, res.user])
        setSuccess(`User ${editing.email} created successfully.`)
      }
      setEditing(null)
    } catch (err) {
      setError(err.message || 'Could not save user.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(user) {
    if (!window.confirm(`Delete staff account for "${user.email}"? This cannot be undone.`)) return
    setDeletingId(user.id)
    setError('')
    setSuccess('')
    try {
      await adminDeleteUser(user.id)
      setUsers((list) => list.filter((u) => u.id !== user.id))
      setSuccess(`User ${user.email} deleted successfully.`)
    } catch (err) {
      setError(err.message || 'Could not delete user.')
    } finally {
      setDeletingId(null)
    }
  }

  const setField = (key, val) => {
    setEditing((prev) => ({ ...prev, [key]: val }))
  }

  const togglePermission = (key) => {
    setEditing((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }))
  }

  // Group permissions by their defined group
  const groupedPermissions = catalog.reduce((acc, p) => {
    const groupName = p.group || 'General'
    if (!acc[groupName]) acc[groupName] = []
    acc[groupName].push(p)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="admin__loading">
        <Loader2 size={28} className="spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="admin__head admin__head--row">
        <div>
          <h1>Manage Users</h1>
          <p>{users ? `${users.length} staff accounts registered` : 'Loading…'}</p>
        </div>
        <button className="btn btn--primary" onClick={startCreate}>
          <Plus size={16} /> Add Staff Account
        </button>
      </div>

      {error && <div className="notice notice--error">{error}</div>}
      {success && <div className="notice notice--success">{success}</div>}

      {users && (
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head admin-table__row--users">
            <span>Email</span>
            <span>Status</span>
            <span>Permissions</span>
            <span>Created</span>
            <span></span>
          </div>

          {users.length === 0 ? (
            <div className="admin__empty">No staff users created yet.</div>
          ) : (
            users.map((u) => {
              const activePermsCount = Object.values(u.permissions || {}).filter(Boolean).length
              return (
                <div className="admin-table__row admin-table__row--users" key={u.id}>
                  <span style={{ fontWeight: 500 }}>{u.email}</span>
                  <span>
                    {u.active ? (
                      <span className="tag tag--green">Active</span>
                    ) : (
                      <span className="tag tag--red">Suspended</span>
                    )}
                  </span>
                  <span>
                    {activePermsCount === catalog.length ? (
                      <span className="tag tag--blue">All Permissions</span>
                    ) : activePermsCount === 0 ? (
                      <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>No Permissions</span>
                    ) : (
                      <span className="tag tag--soft" style={{ background: 'var(--soft)', border: '1px solid var(--line)', color: 'var(--dark)' }}>
                        {activePermsCount} of {catalog.length} permissions
                      </span>
                    )}
                  </span>
                  <span>{fmtDate(u.createdAt)}</span>
                  <span className="admin-table__actions">
                    <button className="icon-btn" onClick={() => startEdit(u)} aria-label="Edit User">
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => onDelete(u)}
                      disabled={deletingId === u.id}
                      aria-label="Delete User"
                    >
                      {deletingId === u.id ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                    </button>
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}

      {editing && (
        <div className="admin-modal-overlay" onClick={() => !saving && setEditing(null)}>
          <div className="admin-modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>{editing.id ? `Edit Permissions for ${editing.email}` : 'Add Staff User'}</h3>
              <button className="icon-btn" onClick={() => setEditing(null)} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form className="form-grid admin-modal__body" onSubmit={onSave}>
              <div className="input full">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  disabled={!!editing.id}
                  value={editing.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="staff@ssbikes.in"
                />
              </div>

              <div className="input full">
                <label>Password {editing.id && '(Leave blank to keep unchanged)'}</label>
                <input
                  type="password"
                  required={!editing.id}
                  minLength={8}
                  value={editing.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder={editing.id ? '••••••••' : 'At least 8 characters'}
                />
              </div>

              {editing.id && (
                <div className="input full">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={editing.active}
                      onChange={(e) => setField('active', e.target.checked)}
                    />
                    Account Active (uncheck to suspend account login access)
                  </label>
                </div>
              )}

              <div className="input full">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Shield size={16} style={{ color: 'var(--muted)' }} />
                  <label style={{ margin: 0, fontWeight: 600 }}>Assign Permissions</label>
                </div>
                
                <div className="permission-groups-grid">
                  {Object.entries(groupedPermissions).map(([group, list]) => (
                    <div className="permission-group" key={group}>
                      <h4>{group}</h4>
                      <div className="permission-checkboxes">
                        {list.map((p) => (
                          <label className="admin-checkbox" key={p.key} style={{ fontSize: '0.84rem' }}>
                            <input
                              type="checkbox"
                              checked={!!editing.permissions[p.key]}
                              onChange={() => togglePermission(p.key)}
                            />
                            {p.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="input full admin-modal__foot">
                <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : editing.id ? 'Save Permissions' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
