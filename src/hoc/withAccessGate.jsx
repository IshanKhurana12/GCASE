import { useAccess } from '../context/AccessContext'
import AccessGate from '../components/AccessGate'

/**
 * Higher-order component that locks a page behind the access gate.
 *
 *   export default withAccessGate(Storefront)                    // admin OR approved phone
 *   export default withAccessGate(Admin, { adminOnly: true })    // admin only
 */
export default function withAccessGate(Wrapped, { adminOnly = false } = {}) {
  function Gated(props) {
    const { role, loading } = useAccess()
    if (loading) return <AccessGate loading />
    const allowed = adminOnly ? role === 'admin' : role !== null
    return allowed ? <Wrapped {...props} /> : <AccessGate adminOnly={adminOnly} />
  }
  Gated.displayName = `withAccessGate(${Wrapped.displayName || Wrapped.name || 'Component'})`
  return Gated
}
