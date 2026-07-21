import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { adminLogin } from '../../lib/adminApi'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showStaff, setShowStaff] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminLogin(password, showStaff ? email : '')
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-auth">
      <form className="admin-auth__card" onSubmit={onSubmit}>
        <div className="admin-auth__ico">
          <Lock size={22} />
        </div>
        <h1>SS Bikes Admin</h1>
        <p>Sign in to manage products and orders.</p>

        {showStaff && (
          <div className="input full">
            <label>Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ssbikes.in"
            />
          </div>
        )}

        <div className="input full">
          <label>Password</label>
          <input
            type="password"
            required
            autoFocus={!showStaff}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
          />
        </div>

        {error && <div className="notice notice--error">{error}</div>}

        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? <Loader2 size={16} className="spin" /> : 'Sign in'}
        </button>

        <button
          type="button"
          className="admin-auth__toggle"
          onClick={() => setShowStaff((v) => !v)}
        >
          {showStaff ? 'Sign in as owner instead' : "Signing in as a team member?"}
          {showStaff ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </form>
    </div>
  )
}
