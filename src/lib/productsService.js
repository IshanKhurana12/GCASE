import {
  addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const col = collection(db, 'products')

/** Live list, sorted client-side by `order` (lowest first) so old docs without it still show. */
export function subscribeProducts(onData, onError) {
  return onSnapshot(
    col,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      onData(list)
    },
    onError
  )
}

export const addProduct = (data) =>
  addDoc(col, { ...data, order: -Date.now(), createdAt: serverTimestamp() })

export const updateProduct = (id, data) =>
  updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() })

export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id))

export function moveToTop(product, all) {
  const min = Math.min(0, ...all.map((p) => p.order ?? 0))
  return updateDoc(doc(db, 'products', product.id), { order: min - 1 })
}
