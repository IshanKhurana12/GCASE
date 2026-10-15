import { STORE } from './config'
import { formatPrice } from './format'

export function buildOrderMessage(items) {
  const lines = items.map(({ product: p, qty }, i) => {
    const title = `${p.name}${p.model ? ` – ${p.model}` : ''}${p.sku ? ` [${p.sku}]` : ''}`
    const lot = !p.model && Number(p.lotSize) > 0 ? ` (lot of ${p.lotSize} pcs)` : ''
    return `${i + 1}. ${title}${lot}\n    ${qty} × ${formatPrice(p.price)} = ${formatPrice(p.price * qty)}`
  })
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  return `Hi ${STORE.name}, I'd like to place a wholesale order:\n\n${lines.join('\n')}\n\nTotal: ${formatPrice(total)}\n\nPlease confirm availability and payment details.`
}

/** items: [{ product, qty }] */
export function orderOnWhatsApp(items) {
  const url = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(buildOrderMessage(items))}`
  window.open(url, '_blank', 'noopener')
}
