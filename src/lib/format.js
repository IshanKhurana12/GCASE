export const formatPrice = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0)

export function discountPercent(price, mrp) {
  if (price === '' || mrp === '' || price == null || mrp == null) return 0
  const p = Number(price), m = Number(mrp)
  return m > p && p >= 0 ? Math.round(((m - p) / m) * 100) : 0
}

export function productImages(product) {
  if (product.images?.length) return product.images
  return product.imageUrl ? [product.imageUrl] : []
}

/** Asks Cloudinary for a resized, auto-format copy. Non-Cloudinary URLs pass through. */
export function optimizeImage(url, width = 600) {
  return url?.includes('/image/upload/') ? url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`) : url
}
