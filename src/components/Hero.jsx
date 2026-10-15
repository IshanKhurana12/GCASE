import { STORE } from '../lib/config'
import './Hero.css'
import './HeroBrand.css'

const iconProps = {
  viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5,
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

const CaseIcon = () => (
  <svg {...iconProps}>
    <rect x="13" y="5" width="22" height="38" rx="6" />
    <rect x="17" y="9" width="10" height="10" rx="3" />
    <circle cx="22" cy="14" r="2" />
    <path d="M20 36h8" />
  </svg>
)

const ChargerIcon = () => (
  <svg {...iconProps}>
    <rect x="11" y="14" width="26" height="24" rx="5" />
    <path d="M18 14V7M30 14V7" />
    <path d="M26 20l-5 8h6l-4 7" />
  </svg>
)

const EarbudsIcon = () => (
  <svg {...iconProps}>
    <circle cx="16" cy="16" r="6.5" />
    <path d="M19 22v14a2.5 2.5 0 0 0 5 0V22" transform="translate(-4 0)" />
    <circle cx="32" cy="16" r="6.5" />
    <path d="M35 22v14a2.5 2.5 0 0 0 5 0V22" transform="translate(-8 0)" />
  </svg>
)

const CableIcon = () => (
  <svg {...iconProps}>
    <rect x="31" y="5" width="10" height="9" rx="2.5" />
    <path d="M36 14v4" />
    <path d="M36 18C36 34 12 24 12 38" />
    <rect x="7" y="38" width="10" height="6" rx="2" />
  </svg>
)

const TILES = [
  { label: 'Cases', note: 'Every model', Icon: CaseIcon },
  { label: 'Chargers', note: 'Fast & safe', Icon: ChargerIcon },
  { label: 'Earphones', note: 'Wired & wireless', Icon: EarbudsIcon },
  { label: 'Cables', note: 'Type-C, Lightning', Icon: CableIcon },
]

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1>Premium phone accessories and covers wholesale.</h1>
          <p>
            Pick exactly the models you need, or grab a ready-made lot at a lower rate.
            Add to cart and send your order to us on WhatsApp.
          </p>
          <div className="hero__actions">
            <a href="#catalog" className="btn btn-primary btn-lg">Browse products</a>
            <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">Chat with us</a>
          </div>
        </div>

        <div className="gcase" role="img" aria-label="GCASE phone accessories: cases, chargers, earphones and cables">
          <div className="gcase__brand">
            <span className="gcase__badge">Wholesale</span>
            <span className="gcase__logo"><b>G</b>CASE</span>
            <span className="gcase__sub">Phone accessories &amp; covers</span>
          </div>
          {TILES.map(({ label, note, Icon }) => (
            <div key={label} className="gcase__tile">
              <span className="gcase__icon"><Icon /></span>
              <strong>{label}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}