import { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2, Save, Settings, AlertCircle } from 'lucide-react'
import { adminUpdateCodFees } from '../../lib/adminApi'
import { useAdminSession } from '../../context/AdminSessionContext'

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
].sort()

export default function AdminSettings() {
  const { type, permissions } = useAdminSession()
  const hasAccess = type === 'owner' || Boolean(permissions?.manageSettings)

  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  // Form state for adding a new state override
  const [newState, setNewState] = useState('')
  const [newEbikeFee, setNewEbikeFee] = useState('')
  const [newAccessoryFee, setNewAccessoryFee] = useState('')

  useEffect(() => {
    if (!hasAccess) return

    fetch('/api/config/cod-fees')
      .then((r) => r.json())
      .then((data) => {
        // Ensure default and states keys exist
        setConfig({
          default: {
            ebikeFee: data.default?.ebikeFee ?? 999,
            accessoryFee: data.default?.accessoryFee ?? 199,
          },
          states: data.states || {},
        })
      })
      .catch((err) => {
        setError(err.message || 'Could not load COD fee settings.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [hasAccess])

  if (!hasAccess) {
    return (
      <div style={{ padding: 24 }}>
        <div className="notice notice--error">
          Access Denied: You do not have permission to manage COD settings.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin__loading">
        <Loader2 size={28} className="spin" />
      </div>
    )
  }

  function handleDefaultChange(key, value) {
    const val = value === '' ? '' : Math.max(0, Number(value) || 0)
    setConfig((prev) => ({
      ...prev,
      default: {
        ...prev.default,
        [key]: val,
      },
    }))
  }

  function handleStateOverrideChange(stateName, key, value) {
    const val = value === '' ? '' : Math.max(0, Number(value) || 0)
    setConfig((prev) => ({
      ...prev,
      states: {
        ...prev.states,
        [stateName]: {
          ...prev.states[stateName],
          [key]: val,
        },
      },
    }))
  }

  function handleAddOverride(e) {
    e.preventDefault()
    if (!newState) return

    const ebikeFee = newEbikeFee === '' ? config.default.ebikeFee : Math.max(0, Number(newEbikeFee) || 0)
    const accessoryFee = newAccessoryFee === '' ? config.default.accessoryFee : Math.max(0, Number(newAccessoryFee) || 0)

    setConfig((prev) => ({
      ...prev,
      states: {
        ...prev.states,
        [newState]: {
          ebikeFee,
          accessoryFee,
        },
      },
    }))

    // Reset override form
    setNewState('')
    setNewEbikeFee('')
    setNewAccessoryFee('')
    setSuccess('State override added locally. Remember to click "Save Configuration".')
    setTimeout(() => setSuccess(''), 4000)
  }

  function handleDeleteOverride(stateName) {
    if (!window.confirm(`Remove fee override for ${stateName}?`)) return
    setConfig((prev) => {
      const copy = { ...prev.states }
      delete copy[stateName]
      return {
        ...prev,
        states: copy,
      }
    })
    setSuccess('State override removed locally. Remember to click "Save Configuration".')
    setTimeout(() => setSuccess(''), 4000)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await adminUpdateCodFees(config)
      setSuccess('COD fee settings saved successfully.')
    } catch (err) {
      setError(err.message || 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  // Filter out states that already have an override configured
  const availableStates = INDIAN_STATES.filter((s) => !config.states[s])

  return (
    <div>
      <div className="admin__head admin__head--row">
        <div>
          <h1>COD Settings &amp; Fees</h1>
          <p>Configure state-specific and category-specific upfront logistics fees for Cash on Delivery orders.</p>
        </div>
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save Configuration
        </button>
      </div>

      {error && <div className="notice notice--error">{error}</div>}
      {success && <div className="notice notice--success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginTop: 18 }}>
        
        {/* Default Fees Form */}
        <div className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Settings size={18} style={{ color: 'var(--muted)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Default COD Logistics Fees</h3>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 18 }}>
            These fees apply to all states unless overridden in the state overrides table below.
          </p>
          <div className="form-grid">
            <div className="input">
              <label>Default E-Bike Fee (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={config.default.ebikeFee}
                onChange={(e) => handleDefaultChange('ebikeFee', e.target.value)}
              />
            </div>
            <div className="input">
              <label>Default Accessory Fee (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={config.default.accessoryFee}
                onChange={(e) => handleDefaultChange('accessoryFee', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* State Overrides List */}
        <div className="form-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 14 }}>State-Specific Overrides</h3>
          
          {Object.keys(config.states).length === 0 ? (
            <div className="notice" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> No state overrides defined. All states currently use default fees.
            </div>
          ) : (
            <div className="admin-table" style={{ marginBottom: 24 }}>
              <div className="admin-table__row admin-table__row--head" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 60px' }}>
                <span>State / UT</span>
                <span>E-Bike Fee (₹)</span>
                <span>Accessory Fee (₹)</span>
                <span></span>
              </div>
              {Object.entries(config.states).map(([stateName, fees]) => (
                <div key={stateName} className="admin-table__row" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 60px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{stateName}</span>
                  <span>
                    <input
                      type="number"
                      min="0"
                      style={{ padding: '6px 10px', fontSize: '0.85rem', width: 120 }}
                      value={fees.ebikeFee}
                      onChange={(e) => handleStateOverrideChange(stateName, 'ebikeFee', e.target.value)}
                    />
                  </span>
                  <span>
                    <input
                      type="number"
                      min="0"
                      style={{ padding: '6px 10px', fontSize: '0.85rem', width: 120 }}
                      value={fees.accessoryFee}
                      onChange={(e) => handleStateOverrideChange(stateName, 'accessoryFee', e.target.value)}
                    />
                  </span>
                  <span className="admin-table__actions">
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => handleDeleteOverride(stateName)}
                      aria-label={`Delete override for ${stateName}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add State Override Form */}
          <form onSubmit={handleAddOverride} style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
            <h4 style={{ fontSize: '0.92rem', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              Add State Override
            </h4>
            <div className="form-grid" style={{ alignItems: 'flex-end' }}>
              <div className="input">
                <label>Select State</label>
                <select value={newState} onChange={(e) => setNewState(e.target.value)}>
                  <option value="">Choose a state...</option>
                  {availableStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input">
                <label>E-Bike Fee (₹, optional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder={`Default: ${config.default.ebikeFee}`}
                  value={newEbikeFee}
                  onChange={(e) => setNewEbikeFee(e.target.value)}
                />
              </div>
              <div className="input">
                <label>Accessory Fee (₹, optional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder={`Default: ${config.default.accessoryFee}`}
                  value={newAccessoryFee}
                  onChange={(e) => setNewAccessoryFee(e.target.value)}
                />
              </div>
              <div>
                <button type="submit" className="btn btn--secondary btn--block" style={{ height: 42 }} disabled={!newState}>
                  <Plus size={16} /> Add Override
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Global Save Button at Bottom */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn--primary btn--large" onClick={handleSave} disabled={saving} style={{ padding: '12px 28px' }}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save Configuration
          </button>
        </div>

      </div>
    </div>
  )
}
