import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { formatPrice, optimizeImage, productImages } from '../lib/format'
import { orderOnWhatsApp } from '../lib/whatsapp'
import './CartDrawer.css'

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, updateQty, removeItem, clearCart, total, count } = useCart()

  useEffect(() => {
    if (!cartOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [cartOpen, setCartOpen])

  if (!cartOpen) return null

  return (
    <div className="cart-overlay" onMouseDown={(e) => e.target === e.currentTarget && setCartOpen(false)}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <header className="cart-drawer__head">
          <h2>Your cart {count > 0 && <small>({count} pcs)</small>}</h2>
          <button type="button" className="cart-drawer__close" onClick={() => setCartOpen(false)} aria-label="Close cart">✕</button>
        </header>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
            <button type="button" className="btn btn-primary" onClick={() => setCartOpen(false)}>Browse covers</button>
          </div>
        ) : (
          <>
            <ul className="cart-drawer__list">
              {items.map(({ product: p, qty }) => {
                const img = productImages(p)[0]
                const atMax = Number(p.stock) > 0 && qty >= Number(p.stock)
                return (
                  <li key={p.id} className="cart-item">
                    <div className="cart-item__img">{img ? <img src={optimizeImage(img, 160)} alt="" /> : '📱'}</div>
                    <div className="cart-item__info">
                      <p className="cart-item__name">{p.name}</p>
                      <p className="cart-item__meta">
                        {p.model ? `Model: ${p.model}` : Number(p.lotSize) > 0 ? `Lot of ${p.lotSize} pcs` : 'Full lot'}
                      </p>
                      <div className="cart-item__row">
                        <div className="qty-stepper">
                          <button type="button" onClick={() => updateQty(p.id, qty - 1)} aria-label="Decrease quantity">−</button>
                          <span>{qty}</span>
                          <button type="button" onClick={() => updateQty(p.id, qty + 1)} disabled={atMax} aria-label="Increase quantity">+</button>
                        </div>
                        <strong>{formatPrice(p.price * qty)}</strong>
                      </div>
                    </div>
                    <button type="button" className="cart-item__remove" onClick={() => removeItem(p.id)} aria-label={`Remove ${p.name}`}>✕</button>
                  </li>
                )
              })}
            </ul>

            <footer className="cart-drawer__foot">
              <div className="cart-drawer__total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
              <button type="button" className="btn btn-wa btn-lg" onClick={() => orderOnWhatsApp(items)}>Order on WhatsApp</button>
              <button type="button" className="cart-drawer__clear" onClick={clearCart}>Clear cart</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
