import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const KEY = 'casecrate-cart-v1'

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}
const capFor = (product) => (Number(product.stock) > 0 ? Number(product.stock) : Infinity)

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* storage unavailable */ }
  }, [items])

  const addToCart = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (!existing) return [...prev, { product, qty: Math.min(capFor(product), qty) }]
      return prev.map((i) => (i.product.id === product.id ? { product, qty: Math.min(capFor(product), i.qty + qty) } : i))
    })
  }, [])

  const updateQty = useCallback((id, qty) => {
    setItems((prev) =>
      qty < 1
        ? prev.filter((i) => i.product.id !== id)
        : prev.map((i) => (i.product.id === id ? { ...i, qty: Math.min(capFor(i.product), qty) } : i))
    )
  }, [])

  const removeItem = useCallback((id) => setItems((prev) => prev.filter((i) => i.product.id !== id)), [])
  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({
      items, cartOpen, setCartOpen, addToCart, updateQty, removeItem, clearCart,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.product.price * i.qty, 0),
    }),
    [items, cartOpen, addToCart, updateQty, removeItem, clearCart]
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
