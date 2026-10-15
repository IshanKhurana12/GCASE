import { discountPercent, formatPrice } from '../lib/format'
import './PriceTag.css'

export default function PriceTag({ price, mrp, className = '' }) {
  const off = discountPercent(price, mrp)
  return (
    <span className={`price-tag ${className}`}>
      <strong className="price-tag__now">{formatPrice(price)}</strong>
      {off > 0 && (
        <>
          <s className="price-tag__mrp">{formatPrice(mrp)}</s>
          <span className="price-tag__off">{off}% off</span>
        </>
      )}
    </span>
  )
}
