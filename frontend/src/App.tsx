import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoriteProvider } from './context/FavoriteContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import HomePage from './pages/Home/HomePage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProductList from './pages/Product/ProductList';
import ProductDetail from './pages/Product/ProductDetail';
import Cart from './pages/Product/Cart';
import Checkout from './pages/Product/Checkout';
import Wishlist from './pages/Product/Wishlist';
import CustomOrderList from './pages/CustomOrder/CustomOrderList';
import CreateCustomOrder from './pages/CustomOrder/CreateCustomOrder';
import CustomOrderDetail from './pages/CustomOrder/CustomOrderDetail';
import SellerRFQList from './pages/Seller/SellerRFQList';
import SellerRFQDetail from './pages/Seller/SellerRFQDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <FavoriteProvider>
        <CartProvider>
          <Router>
        <Header />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Products ── */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

          {/* ── Custom Order RFQ (Customer) — requires login ── */}
          <Route path="/custom-orders" element={
            <ProtectedRoute><CustomOrderList /></ProtectedRoute>
          } />
          <Route path="/custom-orders/create" element={
            <ProtectedRoute><CreateCustomOrder /></ProtectedRoute>
          } />
          <Route path="/custom-orders/:id" element={
            <ProtectedRoute><CustomOrderDetail /></ProtectedRoute>
          } />

          {/* ── Seller / Contractor RFQ — requires CONTRACTOR role ── */}
          <Route path="/seller/rfq" element={
            <ProtectedRoute allowedRoles={['CONTRACTOR', 'ADMIN']}>
              <SellerRFQList />
            </ProtectedRoute>
          } />
          <Route path="/seller/rfq/:id" element={
            <ProtectedRoute allowedRoles={['CONTRACTOR', 'ADMIN']}>
              <SellerRFQDetail />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={
            <div className="container section" style={{ minHeight: '50vh', paddingTop: '6rem' }}>
              <h3>🚧 Đang phát triển...</h3>
            </div>
          } />
        </Routes>
        <Footer />
        </Router>
        </CartProvider>
      </FavoriteProvider>
    </AuthProvider>
  );
}

export default App;
