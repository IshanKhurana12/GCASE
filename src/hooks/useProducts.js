import { useEffect, useState } from 'react'
import { subscribeProducts } from '../lib/productsService'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(
    () =>
      subscribeProducts(
        (list) => { setProducts(list); setLoading(false) },
        () => { setError('Could not load products. Check your connection and Firebase setup.'); setLoading(false) }
      ),
    []
  )
  return { products, loading, error }
}
