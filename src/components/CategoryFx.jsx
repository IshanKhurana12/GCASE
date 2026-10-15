import './CategoryFx.css'

const POSITIONS = [8, 24, 44, 62, 80, 93]

/** Quiet, category-themed particles behind a card's text. Animates only while the card is visible. */
export default function CategoryFx({ category, offset = 0 }) {
  return (
    <div className={`category-fx category-fx--${category}`} aria-hidden="true">
      {POSITIONS.map((x, i) => (
        <span key={x} style={{ left: `${x}%`, animationDelay: `${(i * 0.9 + offset).toFixed(2)}s` }} />
      ))}
    </div>
  )
}
