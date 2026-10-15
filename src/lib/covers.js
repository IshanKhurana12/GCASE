export const COVER_TYPES = {
  choice: { id: 'choice', label: 'Choose model', emoji: '🎯', hint: 'Buyer picks the phone models they want' },
  lot: { id: 'lot', label: 'Full lot', emoji: '📦', hint: 'Sold as one fixed bundle, no model choice' },
}

// Products saved before cover types existed behave like lots.
export const getCoverType = (p) => COVER_TYPES[p.coverType] ?? COVER_TYPES.lot

export const getModels = (p) =>
  Array.isArray(p.models) ? p.models.map((m) => ({ name: m.name, stock: Number(m.stock) || 0 })) : []

export const getTotalStock = (p) =>
  getCoverType(p).id === 'choice' ? getModels(p).reduce((s, m) => s + m.stock, 0) : Number(p.stock) || 0

/** One cart line per (product, model) so each model has its own quantity and stock cap. */
export function cartProductFor(product, modelName) {
  const model = getModels(product).find((m) => m.name === modelName)
  return { ...product, id: `${product.id}::${modelName}`, parentId: product.id, model: modelName, stock: model?.stock ?? 0 }
}

/** Total pieces of a product in the cart, across all its model lines. */
export const cartQtyFor = (items, product) =>
  items.filter((i) => i.product.id === product.id || i.product.parentId === product.id).reduce((s, i) => s + i.qty, 0)
