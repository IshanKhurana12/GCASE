import { useEffect, useRef, useState } from 'react'
import { useCart } from '../context/CartContext'
import { formatPrice, optimizeImage, productImages } from '../lib/format'
import { getCategory } from '../lib/categories'
import { getCoverType, getModels, getTotalStock, cartProductFor, cartQtyFor } from '../lib/covers'
import { orderOnWhatsApp } from '../lib/whatsapp'
import { sparkBurst } from '../lib/fireworks'
import { ImagePlaceholder } from './ProductCard'
import PriceTag from './PriceTag'
import '../styles/modal.css'
import './ProductModal.css'

export default function ProductModal({ product, onClose }) {
  const { addToCart, updateQty, items, setCartOpen } = useCart()

  // What's already in the cart for this product (one line per model, or one line for a lot)
  const cartLines = items.filter((i) => i.product.parentId === product.id)
  const lotLine = items.find((i) => i.product.id === product.id)

  const images = productImages(product)
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(() => (cartLines[0] ?? lotLine)?.qty ?? 1)
  const [added, setAdded] = useState(false)
  const [model, setModel] = useState(() => cartLines[0]?.product.model ?? null)
  const [showModelHint, setShowModelHint] = useState(false)
  const closeRef = useRef(null)
  const touchX = useRef(null)

  const stock = getTotalStock(product)
  const outOfStock = stock <= 0
  const category = getCategory(product)
  const coverType = getCoverType(product)
  const isChoice = coverType.id === 'choice'
  const models = getModels(product)
  const selectedModel = models.find((m) => m.name === model)
  // Most the buyer can order: that model's stock for choice covers, otherwise the lots in stock.
  const maxQty = isChoice ? (selectedModel?.stock ?? 1) : Math.max(1, stock)
  const lotSize = Number(product.lotSize) || 0

  // What goes in the cart: the product itself for lots, a per-model line for choice covers.
  const cartProduct = isChoice ? (model ? cartProductFor(product, model) : null) : product
  const inCart = cartProduct ? items.find((i) => i.product.id === cartProduct.id) : null
  const totalInCart = cartQtyFor(items, product)
  const hasMany = images.length > 1

  const go = (delta) => setActive((i) => (i + delta + images.length) % images.length)

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % Math.max(1, images.length))
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % Math.max(1, images.length))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pickModel(name) {
    const line = cartLines.find((l) => l.product.model === name)
    setModel(name)
    setShowModelHint(false)
    setQty(line?.qty ?? 1) // show the quantity already in the cart for this model
  }

  // True (and shows a hint) when the buyer still has to pick a model.
  function needsModel() {
    if (isChoice && !model) { setShowModelHint(true); return true }
    return false
  }

  function handleAdd(e) {
    if (needsModel()) return
    if (inCart) updateQty(cartProduct.id, qty) // change the existing line
    else addToCart(cartProduct, qty)
    sparkBurst(e.clientX, e.clientY)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  // Skips the cart: opens WhatsApp with just what's picked here.
  function handleOrderNow() {
    if (needsModel()) return
    orderOnWhatsApp([{ product: cartProduct, qty }])
  }

  return (
    <div className="modal-overlay modal-overlay--product" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="product-modal" role="dialog" aria-modal="true" aria-label={product.name}>
        <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="gallery">
          <div
            className="gallery-stage"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current == null || !hasMany) return
              const dx = e.changedTouches[0].clientX - touchX.current
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
              touchX.current = null
            }}
          >
            {images.length ? (
              <div className="gallery-track" style={{ transform: `translateX(-${active * 100}%)` }}>
                {images.map((src, i) => (
                  <img key={src} src={optimizeImage(src, 1000)} alt={`${product.name}, photo ${i + 1} of ${images.length}`} />
                ))}
              </div>
            ) : (
              <ImagePlaceholder />
            )}
            {hasMany && (
              <>
                <button type="button" className="gallery-nav gallery-nav--prev" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
                <button type="button" className="gallery-nav gallery-nav--next" onClick={() => go(1)} aria-label="Next photo">›</button>
                <span className="gallery-counter">{active + 1} / {images.length}</span>
              </>
            )}
          </div>

          {hasMany && (
            <div className="gallery-thumbs">
              {images.map((src, i) => (
                <button key={src} type="button" className={`gallery-thumb ${i === active ? 'is-active' : ''}`}
                  onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === active}>
                  <img src={optimizeImage(src, 160)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-details">
          <div className="product-details-chips">
            <span className="chip chip-category chip-static">{category.emoji} {category.label}</span>
            <span className={`chip chip-type chip-type--${coverType.id} chip-static`}>{coverType.emoji} {coverType.label}</span>
          </div>
          <h2 className="product-details-name">{product.name}</h2>
          {product.sku && <p className="product-details-sku">SKU: {product.sku}</p>}

          <div className="product-details-price-row">
            <PriceTag price={product.price} mrp={product.mrp} className="product-details-price" />
            <span className={`stock-pill ${outOfStock ? 'out' : stock <= 5 ? 'low' : ''}`}>
              {outOfStock ? 'Sold out' : stock <= 5 ? `Hurry, only ${stock} left` : 'In stock'}
            </span>
          </div>

          {product.description && <p className="product-details-desc">{product.description}</p>}

          {isChoice ? (
            <div className="model-picker">
              <p className="model-picker-title">
                Choose your phone model
                {model && <span className="model-picker-selected"> · {model}</span>}
              </p>
              <div className="model-list" role="radiogroup" aria-label="Phone model">
                {models.map((m) => {
                  const soldOut = m.stock <= 0
                  const line = cartLines.find((l) => l.product.model === m.name)
                  return (
                    <button key={m.name} type="button" role="radio" aria-checked={m.name === model} disabled={soldOut}
                      className={`model-chip ${m.name === model ? 'is-selected' : ''} ${soldOut ? 'is-soldout' : ''}`}
                      onClick={() => pickModel(m.name)}>
                      {m.name === model && <span aria-hidden="true">✓ </span>}
                      {m.name}
                      {soldOut
                        ? ' · sold out'
                        : line
                          ? ` · ${line.qty} in cart`
                          : m.stock <= 5 ? ` · ${m.stock} left` : ''}
                    </button>
                  )
                })}
              </div>
              {showModelHint && <p className="model-picker-hint">Please pick a phone model first.</p>}
            </div>
          ) : (
            <div className="lot-info">
              <p className="lot-info-title">📦 Full lot{lotSize > 0 ? ` · ${lotSize} pcs` : ''}</p>
              <p className="lot-info-note">This is sold as a complete lot. Models can’t be chosen individually.</p>
              {product.lotDetails && <p className="lot-info-details">{product.lotDetails}</p>}
            </div>
          )}

          {!outOfStock && (
            <>
              <div className="product-details-buy">
                <div className="qty-stepper qty-stepper--lg">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Increase quantity">+</button>
                </div>
                <button type="button" className={`btn btn-primary btn-lg btn-grow ${added ? 'is-added' : ''}`} onClick={handleAdd}>
                  {added
                    ? '✓ Cart updated'
                    : isChoice && !model
                      ? 'Select a model'
                      : `${inCart ? 'Update cart' : 'Add to cart'} · ${formatPrice((Number(product.price) || 0) * qty)}`}
                </button>
              </div>

              <button type="button" className="btn btn-wa btn-lg product-details-order" onClick={handleOrderNow}>
                Order now on WhatsApp
              </button>
            </>
          )}

          {totalInCart > 0 && (
            <p className="product-details-incart">
              🛒 {totalInCart} already in your cart.{' '}
              <button type="button" onClick={() => { onClose(); setCartOpen(true) }}>View cart</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}