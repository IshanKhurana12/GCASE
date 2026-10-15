import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { STORE } from '../lib/config'
import '../styles/forms.css'

export default function AdminLoginForm() {
  const { login, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { user } = await login(email.trim(), password)
      if (user.email?.toLowerCase() !== STORE.adminEmail) {
        await logout()
        setError('This account is not an admin.')
      }
    } catch {
      setError('Wrong email or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in as admin'}
      </button>
    </form>
  )
}
