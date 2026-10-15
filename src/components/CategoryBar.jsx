import { ALL_CATEGORIES } from '../lib/categories'
import { COVER_TYPES } from '../lib/covers'
import './CategoryBar.css'

const TYPE_OPTIONS = [{ id: 'all', label: 'All types' }, ...Object.values(COVER_TYPES)]

/** filters: { query, category, type } · onChange(nextFilters) */
export default function CategoryBar({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch })
  return (
    <div className="filter-bar">
      <div className="filter-bar__top">
        <input type="search" className="filter-bar__search" placeholder="Search name or SKU" value={filters.query}
          onChange={(e) => set({ query: e.target.value })} aria-label="Search products" />
        <div className="filter-bar__types" role="radiogroup" aria-label="Cover type">
          {TYPE_OPTIONS.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={filters.type === t.id}
              className={`filter-bar__type ${filters.type === t.id ? 'is-active' : ''}`} onClick={() => set({ type: t.id })}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-bar__chips">
        {[{ id: 'all', label: 'All', emoji: '' }, ...ALL_CATEGORIES].map((c) => (
          <button key={c.id} type="button" aria-pressed={filters.category === c.id}
            className={`filter-bar__chip ${filters.category === c.id ? 'is-active' : ''}`} onClick={() => set({ category: c.id })}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
