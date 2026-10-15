import { useEffect, useState } from 'react'
import { subscribeAllowed } from '../lib/accessService'

export function useAllowedNumbers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(
    () => subscribeAllowed(
      (list) => { setItems(list); setLoading(false) },
      () => { setError('Could not load numbers. Are you signed in as the admin?'); setLoading(false) }
    ),
    []
  )
  return { items, loading, error }
}
