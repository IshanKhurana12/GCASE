import { useMemo, useState } from 'react'
import { useAllowedNumbers } from '../hooks/useAllowedNumbers'
import { addAllowed, removeAllowed, replaceNumber, updateAllowed } from '../lib/accessService'
import { isValidPhone, normalizePhone } from '../lib/phone'
import '../styles/forms.css'
import './AccessManager.css'

const EMPTY = { phone: '', name: '', note: '' }

/** Admin control panel: add, edit, pause and remove the numbers that may view the site. */
export default function AccessManager() {
  const { items, loading, error: loadError } = useAllowedNumbers()
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? items.filter((i) => `${i.id} ${i.name ?? ''} ${i.note ?? ''}`.toLowerCase().includes(q)) : items
  }, [items, query])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const reset = () => { setForm(EMPTY); setEditing(null); setError('') }

  function startEdit(item) {
    setEditing(item)
    setForm({ phone: item.id, name: item.name ?? '', note: item.note ?? '' })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValidPhone(form.phone)) return setError('Enter a valid 10-digit mobile number.')
    const phone = normalizePhone(form.phone)
    const patch = { name: form.name.trim(), note: form.note.trim() }
    if (items.some((i) => i.id === phone && i.id !== editing?.id)) return setError('That number is already in the list.')

    setBusy(true)
    try {
      if (!editing) await addAllowed({ phone, ...patch })
      else if (phone === editing.id) await updateAllowed(phone, patch)
      else await replaceNumber(editing, phone, patch)
      reset()
    } catch {
      setError('Could not save. Check that you are signed in as the admin.')
    } finally {
      setBusy(false)
    }
  }

  const toggle = (item) => updateAllowed(item.id, { active: item.active === false })

  async function remove(item) {
    if (!window.confirm(`Remove access for ${item.name || item.id}?`)) return
    await removeAllowed(item.id)
    if (editing?.id === item.id) reset()
  }

  return (
    <section className="access-manager">
      <form className="access-manager__form" onSubmit={handleSubmit}>
        <h2>{editing ? 'Edit number' : 'Give someone access'}</h2>
        <div className="access-manager__fields">
          <div className="field"><label htmlFor="am-phone">Mobile number</label>
            <input id="am-phone" type="tel" inputMode="numeric" placeholder="9232000123" value={form.phone} onChange={set('phone')} /></div>
          <div className="field"><label htmlFor="am-name">Name (optional)</label>
            <input id="am-name" value={form.name} onChange={set('name')} placeholder="Raj Mobile Shop" /></div>
          <div className="field"><label htmlFor="am-note">Note (optional)</label>
            <input id="am-note" value={form.note} onChange={set('note')} placeholder="Karol Bagh, pays weekly" /></div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add number'}</button>
        </div>
      </form>

      <div className="access-manager__list-head">
        <p><strong>{items.length}</strong> approved · <strong>{items.filter((i) => i.active === false).length}</strong> paused</p>
        <input type="search" placeholder="Search number or name" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search numbers" />
      </div>

      {loadError && <p className="form-error">{loadError}</p>}
      {loading ? <p className="access-manager__empty">Loading…</p> : shown.length === 0 ? (
        <p className="access-manager__empty">{items.length ? 'No match.' : 'No numbers yet. Add the first one above.'}</p>
      ) : (
        <ul className="access-manager__list">
          {shown.map((item) => {
            const active = item.active !== false
            return (
              <li key={item.id} className={`access-row ${active ? '' : 'is-paused'}`}>
                <div className="access-row__who">
                  <strong>{item.id}</strong>
                  <span>{[item.name, item.note].filter(Boolean).join(' · ') || 'No name'}</span>
                </div>
                <button type="button" role="switch" aria-checked={active} className="access-row__switch" onClick={() => toggle(item)}
                  title={active ? 'Pause access' : 'Restore access'}><span /></button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(item)}>Edit</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(item)}>Delete</button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
