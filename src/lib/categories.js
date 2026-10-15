export const ALL_CATEGORIES = [
  { id: 'clear', label: 'Clear', emoji: '🫧', keywords: ['clear', 'transparent', 'crystal'] },
  { id: 'silicone', label: 'Silicone', emoji: '🍬', keywords: ['silicone', 'soft', 'matte', 'liquid'] },
  { id: 'glitter', label: 'Glitter', emoji: '✨', keywords: ['glitter', 'shine', 'sparkle', 'bling'] },
  { id: 'printed', label: 'Printed', emoji: '🎨', keywords: ['print', 'design', 'pattern', 'cartoon'] },
  { id: 'leather', label: 'Leather', emoji: '👜', keywords: ['leather', 'wallet', 'flip'] },
  { id: 'armor', label: 'Shockproof', emoji: '🛡️', keywords: ['armor', 'armour', 'shockproof', 'rugged', 'heavy'] },
   { id: 'Accessory', label: 'Accessory', emoji: '📱', keywords: ['earphones', 'charger', 'wire', 'cable', 'buds'] },
]
export const OTHER_CATEGORY = { id: 'other', label: 'Other', emoji: '📱', keywords: [] }

/** Uses the saved category, otherwise guesses from the product name. */
export function getCategory(product) {
  const saved = ALL_CATEGORIES.find((c) => c.id === product.category)
  if (saved) return saved
  const name = (product.name || '').toLowerCase()
  return ALL_CATEGORIES.find((c) => c.keywords.some((k) => name.includes(k))) ?? OTHER_CATEGORY
}
