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

  if (user.role === 'CONTRACTOR') {
    navigate('/contractor/dashboard');
    return null;
  }

  const initials = user.fullName?.charAt(0)?.toUpperCase() || 'K';

  return (
    <div className={`customer-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* ── Sidebar ── */}
      <aside className="customer-sidebar">

        {/* Header */}
        <div className="customer-sidebar-header">
          {isSidebarOpen ? (
            <>
              <div className="customer-logo" onClick={() => navigate('/')}>
                <div className="customer-logo-mark">
                  <i className="fa-solid fa-couch" />
                </div>
                <span>TTTH</span>
              </div>
              <button
                className="sidebar-toggle-btn"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Thu sidebar"
              >
              </button>
            </>
          ) : (
            <div
              className="customer-logo-mark"
              onClick={() => navigate('/')}
              style={{ margin: '0 auto', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-couch" />
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="customer-profile-brief">
          <div className="brief-avatar">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="avatar" />
              : initials}
          </div>
          <div className="brief-info">
            <div className="brief-name">{user.fullName || 'Khách hàng'}</div>
            <div className="brief-badge">
              <i className="fa-solid fa-star" style={{ fontSize: '0.6rem' }} />
              Thành viên vàng
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="customer-sidebar-nav">
          <div className="nav-section-title">Giao Dịch</div>

          <NavLink
            to="/customer/dashboard"
            end
            className={({ isActive }) =>
              `customer-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-solid fa-gauge-high" />
            <span className="nav-text">Tổng Quan</span>
          </NavLink>

          <NavLink
            to="/customer/orders"
            className={({ isActive }) =>
              `customer-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-solid fa-bag-shopping" />
            <span className="nav-text">Lịch Sử Mua Hàng</span>
          </NavLink>

          <NavLink
            to="/customer/custom-orders"
            className={({ isActive }) =>
              `customer-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-solid fa-pen-ruler" />
            <span className="nav-text">Yêu Cầu Custom</span>
          </NavLink>

          <div className="nav-section-title">Tài Khoản</div>

          <NavLink
            to="/customer/profile"
            className={({ isActive }) =>
              `customer-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-regular fa-id-card" />
            <span className="nav-text">Thông Tin Cá Nhân</span>
          </NavLink>

          <NavLink
            to="/customer/wishlist"
            className={({ isActive }) =>
              `customer-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-regular fa-heart" />
            <span className="nav-text">Sản Phẩm Yêu Thích</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="customer-sidebar-footer">
          <button
            className="customer-logout-btn"
            onClick={() => { logout(); navigate('/'); }}
          >
            <i className="fa-solid fa-right-from-bracket" />
            <span className="nav-text">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="customer-main">

        {/* Topbar */}
        <header className="customer-topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle-btn-topbar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <i className="fa-solid fa-bars-staggered" />
            </button>
            <h2 className="topbar-title">Tài Khoản Của Tôi</h2>
          </div>
          <div className="topbar-right">
            <button className="back-home-btn" onClick={() => navigate('/')}>
              <i className="fa-solid fa-store" />
              Tiếp Tục Mua Sắm
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="customer-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;