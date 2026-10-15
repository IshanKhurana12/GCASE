import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase'

const col = collection(db, 'allowedNumbers')
const isActive = (snap) => snap.exists() && snap.data().active !== false

/** Visitor side: look up exactly one number. */
export const checkNumber = async (phone) => isActive(await getDoc(doc(col, phone)))

/** Live access for one number, so removing it kicks the visitor out. */
export const watchNumber = (phone, onChange) => onSnapshot(doc(col, phone), (s) => onChange(isActive(s)), () => {})

/** Admin side */
export function subscribeAllowed(onData, onError) {
  return onSnapshot(col, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => (b.createdAt?.seconds ?? 1e12) - (a.createdAt?.seconds ?? 1e12))
    onData(list)
  }, onError)
}

export const addAllowed = ({ phone, name, note }) =>
  setDoc(doc(col, phone), { name, note, active: true, createdAt: serverTimestamp() })

export const updateAllowed = (phone, patch) => updateDoc(doc(col, phone), patch)

export const removeAllowed = (phone) => deleteDoc(doc(col, phone))

/** The number is the document id, so changing it means create new + delete old, atomically. */
export function replaceNumber(existing, newPhone, patch) {
  const { id, ...data } = existing
  const batch = writeBatch(db)
  batch.set(doc(col, newPhone), { ...data, ...patch })
  batch.delete(doc(col, id))
  return batch.commit()
}
