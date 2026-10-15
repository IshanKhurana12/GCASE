import { useMemo, useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import CategoryBar from '../components/CategoryBar'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import { useProducts } from '../hooks/useProducts'
import { getCategory } from '../lib/categories'
import { getCoverType } from '../lib/covers'
import withAccessGate from '../hoc/withAccessGate'
import './Storefront.css'

function Storefront() {
  const { products, loading, error } = useProducts()
  const [filters, setFilters] = useState({ query: '', category: 'all', type: 'all' })
  const [selectedId, setSelectedId] = useState(null)

  const visible = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    return products.filter((p) => {
      if (filters.category !== 'all' && getCategory(p).id !== filters.category) return false
      if (filters.type !== 'all' && getCoverType(p).id !== filters.type) return false
      return !q || `${p.name} ${p.sku ?? ''}`.toLowerCase().includes(q)
    })
  }, [products, filters])

  // Look the product up live so stock changes show inside an open modal.
  const selected = products.find((p) => p.id === selectedId)

  return (
    <>
      <Header />
      <main>
        <Hero />
        <section id="catalog" className="container storefront">
          <CategoryBar filters={filters} onChange={setFilters} />

          {error && <p className="storefront__notice storefront__notice--error" role="alert">{error}</p>}

          {loading ? (
            <div className="storefront__grid" aria-busy="true">
              {Array.from({ length: 8 }, (_, i) => <div key={i} className="storefront__skeleton" />)}
            </div>
          ) : visible.length === 0 ? (
            <p className="storefront__notice">
              {products.length === 0 ? 'No products yet. Check back soon.' : 'Nothing matches these filters. Try clearing the search.'}
            </p>
          ) : (
            <div className="storefront__grid">
              {visible.map((p, i) => <ProductCard key={p.id} product={p} index={i} onOpen={(prod) => setSelectedId(prod.id)} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
      {selected && <ProductModal key={selected.id} product={selected} onClose={() => setSelectedId(null)} />}
      <CartDrawer />
    </>
  )
}

export default withAccessGate(Storefront)
