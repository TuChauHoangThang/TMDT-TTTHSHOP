import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CustomerLayout.css';

const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    navigate('/login');
    return null;
  }

  // Phân quyền: Contractor không được dùng trang Customer
  if (user.role === 'CONTRACTOR') {
    navigate('/contractor/dashboard');
    return null;
  }

  return (
    <div className={`customer-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="customer-sidebar">
        <div className="customer-sidebar-header">
          <div className="customer-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <i className="fa-solid fa-house"></i>
            <span>HTTH Shop</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <i className="fa-solid fa-bars-staggered"></i>
          </button>
        </div>

        <div className="customer-profile-brief">
          <div className="brief-avatar">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" /> : user.fullName?.charAt(0) || 'C'}
          </div>
          <div className="brief-info">
            <div className="brief-name">{user.fullName || 'Thành viên'}</div>
            <div className="brief-badge">Khách hàng Thân thiết</div>
          </div>
        </div>

        <nav className="customer-sidebar-nav">
          <div className="nav-section-title">Quản Lý Giao Dịch</div>
          <NavLink to="/customer/dashboard" className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`} end>
            <i className="fa-solid fa-bag-shopping"></i>
            <span className="nav-text">Lịch Sử Mua Hàng</span>
          </NavLink>
          
          <NavLink to="/custom-orders" className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-pen-ruler"></i>
            <span className="nav-text">Yêu Cầu Custom</span>
          </NavLink>

          <div className="nav-section-title">Tài Khoản Của Tôi</div>
          <NavLink to="/customer/profile" className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-regular fa-id-card"></i>
            <span className="nav-text">Thông Tin Cá Nhân</span>
          </NavLink>
          
          <NavLink to="/wishlist" className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-regular fa-heart"></i>
            <span className="nav-text">Sản Phẩm Yêu Thích</span>
          </NavLink>
        </nav>

        <div className="customer-sidebar-footer">
          <button onClick={() => { logout(); navigate('/'); }} className="customer-logout-btn">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="nav-text">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      <main className="customer-main">
        <header className="customer-topbar">
          <div className="topbar-left">
            {!isSidebarOpen && (
              <button className="sidebar-toggle-btn-mobile" onClick={() => setIsSidebarOpen(true)}>
                <i className="fa-solid fa-bars-staggered"></i>
              </button>
            )}
            <h2 className="topbar-title">Tài Khoản Của Tôi</h2>
          </div>
          <div className="topbar-right">
            <button className="back-home-btn" onClick={() => navigate('/')}>
              <i className="fa-solid fa-store"></i> Tiếp Tục Mua Sắm
            </button>
          </div>
        </header>

        <div className="customer-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
