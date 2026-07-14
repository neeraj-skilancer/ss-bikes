import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2 } from 'lucide-react'
import { adminLogin } from '../../lib/adminApi'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminLogin(password)
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
        <div className="input full">
          <label>Password</label>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
          />
        </div>
        {error && <div className="notice notice--error">{error}</div>}
        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? <Loader2 size={16} className="spin" /> : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
