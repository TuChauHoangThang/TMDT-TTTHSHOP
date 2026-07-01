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
import ForgotPassword from './pages/Auth/ForgotPassword';
import RegisterContractor from './pages/Auth/RegisterContractor';
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
import ContractorProducts from './pages/Contractor/ContractorProducts';
import ContractorOrders from './pages/Contractor/ContractorOrders';
import CustomerLayout from './pages/Customer/CustomerLayout';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import CustomerOrders from './pages/Customer/CustomerOrders';
import CustomerWishlist from './pages/Customer/CustomerWishlist';
import Wallet from './pages/Customer/Wallet';
import CustomerProfile from './pages/Customer/CustomerProfile';
import CustomerNotifications from './pages/Customer/CustomerNotifications';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminCustomOrders from './pages/Admin/AdminCustomOrders';
import AdminCustomers from './pages/Admin/AdminCustomers';
import AdminContractors from './pages/Admin/AdminContractors';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminPendingProducts from './pages/Admin/AdminPendingProducts';
import AdminEscrowDashboard from './pages/Admin/AdminEscrowDashboard';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import AboutPage from './pages/About/AboutPage';
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
            <ScrollToTop />
            <Routes>
              {/* ── Routes WITH Header & Footer ── */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register-contractor" element={<RegisterContractor />} />

                <Route path="/products" element={<ProductList />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/checkout/vnpay-callback" element={<VNPayCallback />} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

                <Route path="/about" element={<AboutPage />} />
                <Route path="/custom-orders" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomOrderList /></ProtectedRoute>} />
                <Route path="/custom-orders/create" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CreateCustomOrder /></ProtectedRoute>} />
                <Route path="/custom-orders/:id" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomOrderDetail /></ProtectedRoute>} />
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
                <Route path="products" element={<ContractorProducts />} />
                <Route path="orders" element={<ContractorOrders />} />
                <Route path="rfq" element={<SellerRFQList />} />
                <Route path="rfq/:id" element={<SellerRFQDetail />} />
                <Route path="wallet" element={<Wallet />} />
              </Route>

              {/* ── Customer Dashboard ── */}
              <Route path="/customer" element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="orders" element={<CustomerOrders />} />
                <Route path="profile" element={<CustomerProfile />} />
                <Route path="custom-orders" element={<CustomOrderList />} />
                <Route path="wishlist" element={<CustomerWishlist />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="notifications" element={<CustomerNotifications />} />
                <Route path="wallet" element={<Wallet />} />
              </Route>

              {/* ── Admin Dashboard ── */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="custom-orders" element={<AdminCustomOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="contractors" element={<AdminContractors />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/pending" element={<AdminPendingProducts />} />
                <Route path="escrow" element={<AdminEscrowDashboard />} />
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
