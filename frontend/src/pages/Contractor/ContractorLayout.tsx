import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ContractorLayout.css';

const ContractorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'CONTRACTOR' && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || (user.role !== 'CONTRACTOR' && user.role !== 'ADMIN')) {
    return null;
  }

  const initials = user.fullName?.charAt(0)?.toUpperCase() || 'C';

  return (
    <div className={`contractor-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* ── Sidebar ── */}
      <aside className="contractor-sidebar">

        {/* Header */}
        <div className="contractor-sidebar-header">
          {isSidebarOpen ? (
            <>
              <div className="contractor-logo" onClick={() => navigate('/')}>
                <div className="contractor-logo-mark">
                  <i className="fa-solid fa-hammer" />
                </div>
                <span>HTTH Xưởng</span>
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
              className="contractor-logo-mark"
              onClick={() => navigate('/')}
              style={{ margin: '0 auto', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-hammer" />
            </div>
          )}
        </div>

        {/* Profile brief */}
        <div className="contractor-profile-brief">
          <div className="brief-avatar">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="avatar" />
              : initials}
          </div>
          <div className="brief-info">
            <div className="brief-name">{user.fullName || 'Nhà Thầu'}</div>
            <div className="brief-badge">
              <i className="fa-solid fa-hammer" style={{ fontSize: '0.6rem' }} />
              Nhà Thầu
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="contractor-sidebar-nav">
          <div className="nav-section-title">Tổng Quan</div>

          <NavLink
            to="/contractor/dashboard"
            end
            className={({ isActive }) =>
              `contractor-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-solid fa-gauge-high" />
            <span className="nav-text">Bảng Điều Khiển</span>
          </NavLink>

          <div className="nav-section-title">Nghiệp Vụ</div>

          <NavLink
            to="/contractor/rfq"
            className={({ isActive }) =>
              `contractor-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-solid fa-file-signature" />
            <span className="nav-text">Yêu Cầu Báo Giá</span>
          </NavLink>

          <div className="nav-section-title">Tài Khoản</div>

          <NavLink
            to="/contractor/profile"
            className={({ isActive }) =>
              `contractor-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-solid fa-store" />
            <span className="nav-text">Hồ Sơ Cửa Hàng</span>
          </NavLink>

          <NavLink
            to="/contractor/wallet"
            className={({ isActive }) =>
              `contractor-nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className="fa-solid fa-wallet" />
            <span className="nav-text">Ví Của Tôi</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="contractor-sidebar-footer">
          <button
            className="contractor-logout-btn"
            onClick={() => { logout(); navigate('/'); }}
          >
            <i className="fa-solid fa-right-from-bracket" />
            <span className="nav-text">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="contractor-main">

        {/* Topbar */}
        <header className="contractor-topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle-btn-topbar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <i className="fa-solid fa-bars-staggered" />
            </button>
            <h2 className="topbar-title">Kênh Nhà Thầu</h2>
          </div>
          <div className="topbar-right">
            <button className="back-home-btn" onClick={() => navigate('/')}>
              <i className="fa-solid fa-store" />
              Về Trang Chủ
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="contractor-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ContractorLayout;