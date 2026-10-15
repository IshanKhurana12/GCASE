// Built for 10-digit Indian mobile numbers. Anything typed before the last
// 10 digits (+91, 0, spaces, dashes) is ignored.
export const normalizePhone = (raw = '') => String(raw).replace(/\D/g, '').slice(-10)
export const isValidPhone = (raw) => /^[6-9]\d{9}$/.test(normalizePhone(raw))
export const maskPhone = (p = '') => (p.length === 10 ? `${p.slice(0, 4)}***${p.slice(-3)}` : p)
