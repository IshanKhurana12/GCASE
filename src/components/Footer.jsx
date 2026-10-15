import { STORE } from '../lib/config'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p><strong>{STORE.name}</strong> · {STORE.tagline}</p>
        <p>Prices are wholesale. Orders are confirmed on WhatsApp.</p>
      </div>
    </footer>
  )
}
