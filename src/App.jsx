import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AccessProvider } from './context/AccessContext'
import { CartProvider } from './context/CartContext'
import Storefront from './pages/Storefront'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Storefront />} />
          </Routes>
        </CartProvider>
        </AccessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
