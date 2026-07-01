import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  const initials = user.fullName?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">

        {/* Header */}
        <div className="admin-sidebar-header">
          {isSidebarOpen ? (
            <>
              <div className="admin-logo" onClick={() => navigate('/admin/dashboard')}>
                <div className="admin-logo-mark">
                  <i className="fa-solid fa-shield-halved" />
                </div>
                <div>
                  <span>TTTH Admin</span>
                  <span className="admin-logo-sub">Quản trị hệ thống</span>
                </div>
              </div>
              <button
                className="sidebar-toggle-btn"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Thu sidebar"
              >
                <i className="fa-solid fa-chevron-left" />
              </button>
            </>
          ) : (
            <div
              className="admin-logo-mark"
              onClick={() => navigate('/admin/dashboard')}
              style={{ margin: '0 auto', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-shield-halved" />
            </div>
          )}
        </div>

        {/* Profile brief */}
        <div className="admin-profile-brief">
          <div className="brief-avatar">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="avatar" />
              : initials}
          </div>
          <div className="brief-info">
            <div className="brief-name">{user.fullName || 'Admin'}</div>
            <div className="brief-badge">
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '0.6rem' }} />
              Quản Trị Viên
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <div className="nav-section-title">Tổng Quan</div>

          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-gauge-high" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <div className="nav-section-title">Quản Lý</div>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-box-open" />
            <span className="nav-text">Đơn Hàng</span>
          </NavLink>

          <NavLink
            to="/admin/custom-orders"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-pen-ruler" />
            <span className="nav-text">Đơn Theo Yêu Cầu</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-users" />
            <span className="nav-text">Khách Hàng</span>
          </NavLink>

          <NavLink
            to="/admin/contractors"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-hammer" />
            <span className="nav-text">Nhà Thầu</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-images" />
            <span className="nav-text">Sản Phẩm & Ảnh</span>
          </NavLink>

          <NavLink
            to="/admin/products/pending"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-square-check" />
            <span className="nav-text">Duyệt Sản Phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/escrow"
            className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
          >
            <i className="fa-solid fa-shield-halved" />
            <span className="nav-text">Escrow & Ví</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <button
            className="admin-logout-btn"
            onClick={() => { logout(); navigate('/'); }}
          >
            <i className="fa-solid fa-right-from-bracket" />
            <span className="nav-text">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">

        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle-btn-topbar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <i className="fa-solid fa-bars-staggered" />
            </button>
            <h2 className="topbar-title">Bảng Quản Trị</h2>
          </div>
          <div className="topbar-right">
            <button className="back-home-btn" onClick={() => navigate('/admin/dashboard')}>
              <i className="fa-solid fa-gauge-high" />
              Dashboard
            </button>
            <button className="back-home-btn" style={{ background: '#475569', marginLeft: 8 }} onClick={() => navigate('/')}>
              <i className="fa-solid fa-store" />
              Xem Website
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
