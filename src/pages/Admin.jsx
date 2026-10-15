import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccess } from '../context/AccessContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { addProduct, deleteProduct, moveToTop, updateProduct } from '../lib/productsService'
import { getTotalStock } from '../lib/covers'
import ProductCard from '../components/ProductCard'
import ProductForm from '../components/ProductForm'
import AccessManager from '../components/AccessManager'
import withAccessGate from '../hoc/withAccessGate'
import './Admin.css'

function Admin() {
  const { user } = useAuth()
  const { signOut } = useAccess()
  return <Dashboard email={user.email} onLogout={signOut} />
}

function Dashboard({ email, onLogout }) {
  const [tab, setTab] = useState('products')
  const { products, loading, error } = useProducts()
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [notice, setNotice] = useState('')

  const soldOut = products.filter((p) => getTotalStock(p) <= 0).length

  function flash(message) {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  async function handleSave(data) {
    if (editing === 'new') await addProduct(data)
    else await updateProduct(editing.id, data)
    flash(editing === 'new' ? 'Product added.' : 'Changes saved.')
    setEditing(null)
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try { await deleteProduct(product.id); flash('Product deleted.') } catch { flash('Could not delete. Check your permissions.') }
  }

  async function handleMoveToTop(product) {
    try { await moveToTop(product, products); flash('Moved to the top of the store.') } catch { flash('Could not reorder. Check your permissions.') }
  }

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="container admin__bar-inner">
          <h1>Catalog</h1>
          <div className="admin__bar-actions">
            <span className="admin__email">{email}</span>
            <Link to="/" className="btn btn-ghost btn-sm">View store</Link>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="container admin__main">
        <div className="admin__tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'products'} className={tab === 'products' ? 'is-active' : ''} onClick={() => setTab('products')}>Products</button>
          <button type="button" role="tab" aria-selected={tab === 'access'} className={tab === 'access' ? 'is-active' : ''} onClick={() => setTab('access')}>Customer access</button>
        </div>

        {tab === 'access' ? <AccessManager /> : (<>
        <div className="admin__summary">
          <p><strong>{products.length}</strong> products</p>
          <p><strong>{soldOut}</strong> sold out</p>
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>+ Add product</button>
        </div>

        {error && <p className="form-error">{error}</p>}
        {loading ? (
          <p className="admin__loading">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="admin__loading">No products yet. Add your first one.</p>
        ) : (
          <div className="admin__grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} adminMode
                onOpen={setEditing} onEdit={setEditing} onDelete={handleDelete} onMoveToTop={handleMoveToTop} />
            ))}
          </div>
        )}
        </>)}
      </main>

      {editing && (
        <ProductForm initialProduct={editing === 'new' ? null : editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
      {notice && <div className="admin__toast" role="status">{notice}</div>}
    </div>
  )
}

export default withAccessGate(Admin, { adminOnly: true })
