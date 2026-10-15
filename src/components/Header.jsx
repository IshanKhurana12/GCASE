import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAccess } from '../context/AccessContext'
import { STORE } from '../lib/config'
import { maskPhone } from '../lib/phone'
import './Header.css'

export default function Header() {
  const { count, setCartOpen } = useCart()
  const { role, phone, signOut } = useAccess()
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand">
          <span className="site-header__logo" aria-hidden="true" />
          <span>{STORE.name}</span>
        </Link>
        <div className="site-header__right">
          {role === 'admin' && <Link to="/admin" className="site-header__link">Admin panel</Link>}
          {role === 'user' && <span className="site-header__who">{maskPhone(phone)}</span>}
          <button type="button" className="site-header__link" onClick={signOut}>Sign out</button>
          <button type="button" className="site-header__cart" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`}>
            🛒 <span>Cart</span>
            {count > 0 && <b className="site-header__badge">{count}</b>}
          </button>
        </div>
      </div>
    </header>
  )
}
