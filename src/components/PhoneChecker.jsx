import { useState } from 'react'
import { useAccess } from '../context/AccessContext'
import { STORE } from '../lib/config'
import './PhoneChecker.css'

const MESSAGES = {
  invalid: 'Enter a valid 10-digit mobile number.',
  error: 'Could not check your number. Check your connection and try again.',
}

/** Customer entry: type a phone number; it opens the site only if the admin has approved it. */
export default function PhoneChecker() {
  const { verify } = useAccess()
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setResult(null)
    const res = await verify(value)
    setBusy(false)
    if (!res.ok) setResult(res) // on success the gate unmounts by itself
  }

  const requestUrl = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    `Hi ${STORE.name}, please give my number ${result?.phone ?? ''} access to the wholesale catalog.`
  )}`

  return (
    <form className="phone-checker" onSubmit={handleSubmit} noValidate>
      <label htmlFor="phone-input" className="phone-checker__label">Mobile number</label>
      <div className="phone-checker__row">
        <span className="phone-checker__prefix">+91</span>
        <input id="phone-input" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14}
          placeholder="98765 43210" value={value} onChange={(e) => { setValue(e.target.value); setResult(null) }} autoFocus />
      </div>

      {result?.reason === 'denied' ? (
        <div className="phone-checker__denied" role="alert">
          <strong>This number doesn’t have access yet.</strong>
          <p>Ask the admin to approve it, then try again.</p>
          <a className="btn btn-wa btn-sm" href={requestUrl} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
        </div>
      ) : result ? (
        <p className="form-error" role="alert">{MESSAGES[result.reason]}</p>
      ) : null}

      <button type="submit" className="btn btn-primary btn-lg" disabled={busy || !value.trim()}>
        {busy ? 'Checking…' : 'Enter the catalog'}
      </button>
    </form>
  )
}
