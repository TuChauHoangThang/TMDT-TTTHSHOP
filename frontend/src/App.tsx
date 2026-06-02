import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import VNPayCallback from './pages/Product/VNPayCallback';
import Wishlist from './pages/Product/Wishlist';
import CustomOrderList from './pages/CustomOrder/CustomOrderList';
import CreateCustomOrder from './pages/CustomOrder/CreateCustomOrder';
import CustomOrderDetail from './pages/CustomOrder/CustomOrderDetail';
import SellerRFQList from './pages/Seller/SellerRFQList';
import SellerRFQDetail from './pages/Seller/SellerRFQDetail';

import ContractorLayout from './pages/Contractor/ContractorLayout';
import ContractorDashboard from './pages/Contractor/ContractorDashboard';
import ContractorProfile from './pages/Contractor/ContractorProfile';
import CustomerLayout from './pages/Customer/CustomerLayout';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import CustomerOrders from './pages/Customer/CustomerOrders';
import CustomerWishlist from './pages/Customer/CustomerWishlist';
import CustomerProfile from './pages/Customer/CustomerProfile';
import CustomerNotifications from './pages/Customer/CustomerNotifications';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminCustomOrders from './pages/Admin/AdminCustomOrders';
import AdminCustomers from './pages/Admin/AdminCustomers';
import AdminContractors from './pages/Admin/AdminContractors';
import './App.css';

const MainLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <FavoriteProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* ── Routes WITH Header & Footer ── */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/products" element={<ProductList />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/checkout/vnpay-callback" element={<VNPayCallback />} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

                <Route path="/custom-orders" element={<ProtectedRoute><CustomOrderList /></ProtectedRoute>} />
                <Route path="/custom-orders/create" element={<ProtectedRoute><CreateCustomOrder /></ProtectedRoute>} />
                <Route path="/custom-orders/:id" element={<ProtectedRoute><CustomOrderDetail /></ProtectedRoute>} />

                <Route path="*" element={
                  <div className="container section" style={{ minHeight: '50vh', paddingTop: '6rem' }}>
                    <h3>🚧 Đang phát triển...</h3>
                  </div>
                } />
              </Route>

              {/* ── Contractor Dashboard ── */}
              <Route path="/contractor" element={<ProtectedRoute allowedRoles={['CONTRACTOR', 'ADMIN']}><ContractorLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<ContractorDashboard />} />
                <Route path="profile" element={<ContractorProfile />} />
                <Route path="rfq" element={<SellerRFQList />} />
                <Route path="rfq/:id" element={<SellerRFQDetail />} />
              </Route>

              {/* ── Customer Dashboard ── */}
              <Route path="/customer" element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="orders" element={<CustomerOrders />} />
                <Route path="profile" element={<CustomerProfile />} />
                <Route path="custom-orders" element={<CustomOrderList />} />
                <Route path="wishlist" element={<CustomerWishlist />} />
                <Route path="notifications" element={<CustomerNotifications />} />
              </Route>

              {/* ── Admin Dashboard ── */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="custom-orders" element={<AdminCustomOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="contractors" element={<AdminContractors />} />
              </Route>
            </Routes>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
          </Router>
        </CartProvider>
      </FavoriteProvider>
    </AuthProvider>
  );
}

export default App;
