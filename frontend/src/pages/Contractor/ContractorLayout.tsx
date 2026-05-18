import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ContractorLayout.css';

const ContractorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user || (user.role !== 'CONTRACTOR' && user.role !== 'ADMIN')) {
    navigate('/');
    return null;
  }

  return (
    <div className={`contractor-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="contractor-sidebar">
        <div className="contractor-sidebar-header">
          <div className="contractor-logo">
            <i className="fa-solid fa-hammer"></i>
            <span>HTTH Xưởng</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>

        <nav className="contractor-sidebar-nav">
          <NavLink to="/contractor/dashboard" className={({ isActive }) => `contractor-nav-item ${isActive ? 'active' : ''}`} end>
            <i className="fa-solid fa-chart-line"></i>
            <span className="nav-text">Bảng Điều Khiển</span>
          </NavLink>
          
          <div className="nav-section-title">Nghiệp Vụ</div>
          
          <NavLink to="/seller/rfq" className={({ isActive }) => `contractor-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-file-signature"></i>
            <span className="nav-text">Yêu Cầu Báo Giá</span>
          </NavLink>
          
          <NavLink to="/contractor/profile" className={({ isActive }) => `contractor-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-store"></i>
            <span className="nav-text">Hồ Sơ Cửa Hàng</span>
          </NavLink>
        </nav>

        <div className="contractor-sidebar-footer">
          <button onClick={logout} className="contractor-logout-btn">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span className="nav-text">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      <main className="contractor-main">
        <header className="contractor-topbar">
          <div className="topbar-left">
            {!isSidebarOpen && (
              <button className="sidebar-toggle-btn-mobile" onClick={() => setIsSidebarOpen(true)}>
                <i className="fa-solid fa-bars"></i>
              </button>
            )}
            <h2 className="topbar-title">Kênh Nhà Thầu</h2>
          </div>
          <div className="topbar-right">
            <div className="topbar-action">
              <i className="fa-regular fa-message"></i>
            </div>
            <div className="topbar-user">
              <div className="user-avatar">{user.fullName?.charAt(0) || 'C'}</div>
              <div className="user-info">
                <span className="user-name">{user.fullName || 'Nhà Thầu'}</span>
                <span className="user-role">Contractor</span>
              </div>
            </div>
          </div>
        </header>

        <div className="contractor-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ContractorLayout;
