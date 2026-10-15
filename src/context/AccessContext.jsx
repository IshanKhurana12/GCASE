import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { checkNumber, watchNumber } from '../lib/accessService'
import { isValidPhone, normalizePhone } from '../lib/phone'

const AccessContext = createContext(null)
const KEY = 'casecrate-phone-v1'

const readStored = () => { try { return localStorage.getItem(KEY) } catch { return null } }
const writeStored = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY) } catch { /* storage unavailable */ } }

/**
 * Who is allowed in?  role = 'admin' | 'user' | null
 *  - admin: signed in with the admin email
 *  - user:  entered a phone number that is on the admin's list (re-checked live)
 */
export function AccessProvider({ children }) {
  const { ready, isAdmin, logout } = useAuth()
  const [phone, setPhone] = useState(readStored)
  const [approved, setApproved] = useState(() => (readStored() ? null : false)) // null = still checking

  useEffect(() => {
    if (!phone) { setApproved(false); return undefined }
    return watchNumber(phone, (ok) => {
      setApproved(ok)
      if (!ok) { writeStored(null); setPhone(null) } // access removed by admin
    })
  }, [phone])

  const verify = useCallback(async (raw) => {
    if (!isValidPhone(raw)) return { ok: false, reason: 'invalid' }
    const p = normalizePhone(raw)
    try {
      if (!(await checkNumber(p))) return { ok: false, reason: 'denied', phone: p }
      writeStored(p)
      setApproved(true)
      setPhone(p)
      return { ok: true }
    } catch {
      return { ok: false, reason: 'error' }
    }
  }, [])

  const signOut = useCallback(async () => {
    writeStored(null); setPhone(null); setApproved(false)
    await logout()
  }, [logout])

  const value = useMemo(() => ({
    role: isAdmin ? 'admin' : phone && approved ? 'user' : null,
    phone,
    loading: !ready || (!isAdmin && approved === null),
    verify,
    signOut,
  }), [isAdmin, phone, approved, ready, verify, signOut])

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

export const useAccess = () => useContext(AccessContext)
