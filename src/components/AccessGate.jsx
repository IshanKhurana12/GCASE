import { STORE } from '../lib/config'
import PhoneChecker from './PhoneChecker'
import AdminLoginForm from './AdminLoginForm'
import './AccessGate.css'

/** Full-screen door: shows the admin login and the phone checker (or a spinner while checking). */
export default function AccessGate({ adminOnly = false, loading = false }) {
  if (loading) {
    return <div className="access-gate access-gate--loading" role="status" aria-label="Checking access"><span className="access-gate__spinner" /></div>
  }
  return (
    <div className="access-gate">
      <header className="access-gate__head">
        <h1>{STORE.name}</h1>
        <p>{adminOnly ? 'Admin area. Sign in to continue.' : 'This catalog is private. Choose how you’re entering.'}</p>
      </header>

      <div className={`access-gate__panels ${adminOnly ? 'is-single' : ''}`}>
        {!adminOnly && (
          <section className="access-gate__panel">
            <h2>I’m a customer</h2>
            <p>Enter the mobile number the admin approved.</p>
            <PhoneChecker />
          </section>
        )}
        <section className="access-gate__panel">
          <h2>I’m the admin</h2>
          <p>Sign in to manage products and who can view the catalog.</p>
          <AdminLoginForm />
        </section>
      </div>
    </div>
  )
}
