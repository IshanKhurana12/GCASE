import { useState } from 'react'
import ImageDropzone from './ImageDropzone'
import PriceTag from './PriceTag'
import { ALL_CATEGORIES } from '../lib/categories'
import { COVER_TYPES, getModels } from '../lib/covers'
import { discountPercent } from '../lib/format'
import '../styles/modal.css'
import '../styles/forms.css'
import './ProductForm.css'

const emptyForm = {
  name: '', sku: '', price: '', mrp: '', stock: '', category: '', description: '',
  images: [], productType: 'cover', coverType: 'choice', models: [], lotSize: '', lotDetails: '',
}

const toQty = (v) => (v === '' ? 0 : Math.max(0, Math.floor(Number(v)) || 0))
const splitNames = (raw) => raw.split(/[,\n]/).map((m) => m.trim()).filter(Boolean)

function fromProduct(p) {
  return {
    name: p.name ?? '', sku: p.sku ?? '', price: p.price ?? '', mrp: p.mrp ?? '', stock: p.stock ?? '',
    category: p.category ?? '', description: p.description ?? '',
    images: p.images ?? (p.imageUrl ? [p.imageUrl] : []),
    // Products saved before product types existed were all covers.
    productType: p.productType ?? 'cover',
    // Products saved before cover types existed behave like lots.
    coverType: p.coverType ?? 'lot',
    models: getModels(p), lotSize: p.lotSize ?? '', lotDetails: p.lotDetails ?? '',
  }
}

export default function ProductForm({ initialProduct, onSave, onCancel }) {
  const [form, setForm] = useState(initialProduct ? fromProduct(initialProduct) : emptyForm)
  const [modelInput, setModelInput] = useState('')
  const [modelQtyInput, setModelQtyInput] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(initialProduct)
  const isAccessory = form.productType === 'accessory'
  const isChoice = form.coverType === 'choice'
  // For covers the choices are phone models; for accessories they are options (colour, variant...).
  const optionNoun = isAccessory ? 'option' : 'phone model'
  const productNoun = isAccessory ? 'accessory' : 'cover'
  const totalModelStock = form.models.reduce((sum, m) => sum + (Number(m.stock) || 0), 0)

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  // Accepts one model, or several separated by commas / new lines (paste a list).
  // Every model added in one go gets the quantity from the qty box.
  function addModels(raw) {
    const names = splitNames(raw)
    if (!names.length) return
    const qty = toQty(modelQtyInput)
    setForm((prev) => {
      const seen = new Set(prev.models.map((m) => m.name.toLowerCase()))
      const fresh = names.filter((n) => !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase())).map((name) => ({ name, stock: qty }))
      return { ...prev, models: [...prev.models, ...fresh] }
    })
    setModelInput('')
  }

  const setModelStock = (name, value) =>
    setForm((prev) => ({ ...prev, models: prev.models.map((m) => (m.name === name ? { ...m, stock: value } : m)) }))

  const removeModel = (name) => setForm((prev) => ({ ...prev, models: prev.models.filter((m) => m.name !== name) }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Give the product a name.')
    const priceNumber = Number(form.price)
    if (form.price === '' || Number.isNaN(priceNumber) || priceNumber < 0) return setError('Enter a valid price.')
    const mrpNumber = form.mrp === '' ? null : Number(form.mrp)
    if (mrpNumber !== null && (Number.isNaN(mrpNumber) || mrpNumber < priceNumber)) {
      return setError('MRP should be at least our price. Leave it empty if there is no MRP.')
    }

    // Include a model that was typed but not added yet.
    const models = form.models.map((m) => ({ name: m.name, stock: m.stock === '' ? 0 : Number(m.stock) }))
    for (const name of splitNames(modelInput)) {
      if (!models.some((x) => x.name.toLowerCase() === name.toLowerCase())) models.push({ name, stock: toQty(modelQtyInput) })
    }

    let stockNumber
    if (isChoice) {
      if (!models.length) return setError(`Add at least one ${optionNoun} for a choice ${productNoun}.`)
      if (models.some((m) => !Number.isInteger(m.stock) || m.stock < 0)) {
        return setError(`Each ${optionNoun} needs a valid quantity (0 or more, whole numbers).`)
      }
      // Product-level stock is the total across models, so anything that reads
      // product.stock (sold-out, low-stock, admin lists) keeps working.
      stockNumber = models.reduce((sum, m) => sum + m.stock, 0)
    } else {
      stockNumber = form.stock === '' ? 0 : Number(form.stock)
      if (Number.isNaN(stockNumber) || stockNumber < 0) return setError('Enter a valid stock quantity.')
    }

    const lotSizeNumber = form.lotSize === '' ? null : Number(form.lotSize)
    if (!isChoice && lotSizeNumber !== null && (Number.isNaN(lotSizeNumber) || lotSizeNumber < 1)) {
      return setError('Pieces in the lot should be 1 or more. Leave it empty if you do not want to show it.')
    }

    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(), sku: form.sku.trim(), price: priceNumber,
        mrp: mrpNumber, // null (not undefined) so clearing the field also clears it in Firestore
        stock: stockNumber, category: form.category, description: form.description.trim(),
        images: form.images, productType: form.productType, coverType: form.coverType,
        models: isChoice ? models : [],
        lotSize: isChoice ? null : lotSizeNumber,
        lotDetails: isChoice ? '' : form.lotDetails.trim(),
      })
    } catch (err) {
      setError(err.message || 'Something went wrong while saving.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit product' : 'Add product'}>
        <h2 className="modal-title">{isEditing ? 'Edit product' : 'Add a new product'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Product name</label>
            <input id="name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
              placeholder={isAccessory ? 'Fast Charger 20W' : 'Clear Silicone Cover'} autoFocus />
          </div>

          <div className="field">
            <label htmlFor="productType">Product type</label>
            <select id="productType" value={form.productType} onChange={(e) => handleChange('productType', e.target.value)}>
              <option value="cover">Cover</option>
              <option value="accessory">Accessory</option>
            </select>
          </div>

          <div className="field">
            <label id="cover-type-label">{isAccessory ? 'Accessory type' : 'Cover type'}</label>
            <div className="type-toggle" role="radiogroup" aria-labelledby="cover-type-label">
              {Object.values(COVER_TYPES).map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={form.coverType === t.id}
                  className={`type-toggle-btn ${form.coverType === t.id ? 'is-active' : ''}`}
                  onClick={() => handleChange('coverType', t.id)}>
                  <strong>{t.emoji} {t.label}</strong>
                  <small>{t.hint}</small>
                </button>
              ))}
            </div>
          </div>

          {isChoice ? (
            <div className="field">
              <label htmlFor="model-input">
                Available {optionNoun}s {form.models.length > 0 && `(${form.models.length} ${optionNoun}s, ${totalModelStock} pcs total)`}
              </label>
              <div className="model-input-row">
                <input id="model-input" type="text" value={modelInput} onChange={(e) => setModelInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addModels(modelInput) } }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text')
                    if (/[,\n]/.test(text)) { e.preventDefault(); addModels(text) }
                  }}
                  placeholder={isAccessory ? 'Option, e.g. Black' : 'Model, e.g. iPhone 15'} />
                <input type="number" min="0" step="1" className="model-qty-input" value={modelQtyInput}
                  onChange={(e) => setModelQtyInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addModels(modelInput) } }}
                  placeholder="Qty" aria-label={`Quantity for this ${optionNoun}`} />
                <button type="button" className="btn btn-ghost" onClick={() => addModels(modelInput)}>Add</button>
              </div>
              <p className="field-hint">Type the {optionNoun} and its quantity, then press Enter. Paste a comma-separated list to add many at once.</p>

              {form.models.length > 0 && (
                <ul className="model-rows">
                  {form.models.map((m) => (
                    <li key={m.name} className="model-row">
                      <span className="model-row-name">{m.name}</span>
                      <input type="number" min="0" step="1" className="model-qty-input" value={m.stock}
                        onChange={(e) => setModelStock(m.name, e.target.value)} aria-label={`Quantity of ${m.name}`} />
                      <button type="button" className="model-row-remove" onClick={() => removeModel(m.name)} aria-label={`Remove ${m.name}`}>✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="lotSize">Pieces in one lot</label>
                <input id="lotSize" type="number" min="1" step="1" value={form.lotSize}
                  onChange={(e) => handleChange('lotSize', e.target.value)} placeholder="12 (optional)" />
              </div>
              <div className="field">
                <label htmlFor="lotDetails">What is in the lot</label>
                <textarea id="lotDetails" value={form.lotDetails} onChange={(e) => handleChange('lotDetails', e.target.value)}
                  placeholder={isAccessory
                    ? 'Mixed: 6× chargers, 6× cables, 6× earphones...'
                    : 'Mixed models: 4× iPhone 13, 4× Redmi Note 12, 4× Vivo Y22...'} />
              </div>
            </>
          )}

          <div className="field-row">
            <div className="field">
              <label htmlFor="mrp">{isChoice ? 'MRP (printed on pack)' : 'MRP per lot'}</label>
              <input id="mrp" type="number" min="0" step="0.01" value={form.mrp}
                onChange={(e) => handleChange('mrp', e.target.value)} placeholder="500 (optional)" />
            </div>
            <div className="field">
              <label htmlFor="price">{isChoice ? `Our price (per ${productNoun})` : 'Our price per lot'}</label>
              <input id="price" type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => handleChange('price', e.target.value)} placeholder="300" />
            </div>
          </div>
          {discountPercent(form.price, form.mrp) > 0 && (
            <p className="field-hint">Buyers will see: <PriceTag price={form.price} mrp={form.mrp} /></p>
          )}

          <div className="field-row">
            <div className="field">
              <label htmlFor="sku">SKU</label>
              <input id="sku" type="text" value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} placeholder="MC01" />
            </div>
            <div className="field">
              {isChoice ? (
                <>
                  <label htmlFor="total-stock">Total stock</label>
                  <input id="total-stock" type="text" value={`${totalModelStock} (sum of ${optionNoun}s)`} readOnly disabled />
                </>
              ) : (
                <>
                  <label htmlFor="stock">Lots in stock</label>
                  <input id="stock" type="number" min="0" step="1" value={form.stock}
                    onChange={(e) => handleChange('stock', e.target.value)} placeholder="20" />
                </>
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
              <option value="">Auto (guess from name)</option>
              {ALL_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Photos {form.images.length > 0 && `(${form.images.length})`}</label>
            <ImageDropzone value={form.images} onChange={(images) => handleChange('images', images)} />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={form.description} onChange={(e) => handleChange('description', e.target.value)}
              placeholder={isAccessory ? 'Brand, specs, warranty, what is in the box...' : 'Material, finish, shockproof, camera protection...'} />
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add to catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}