import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UserLayout.css';

const UserLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(true); // Mặc định mở menu "Tài Khoản Của Tôi"

  if (!user) {
    // Redirect to login if somehow accessed without auth, though ProtectedRoute should handle this
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="user-layout-container section">
      <div className="user-layout-content container">
        {/* Sidebar */}
        <div className="user-sidebar">
          {/* User Info Header */}
          <div className="user-sidebar-header">
            <div className="user-avatar-placeholder">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" />
              ) : (
                <i className="fa-regular fa-user"></i>
              )}
            </div>
            <div className="user-header-info">
              <span className="user-header-name">{user.fullName || user.email.split('@')[0]}</span>
              <NavLink to="/user/profile" className="user-header-edit">
                <i className="fa-solid fa-pen"></i> Sửa Hồ Sơ
              </NavLink>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="user-sidebar-menu">
            
            {/* My Account Section */}
            <div className="menu-group">
              <div 
                className={`menu-group-title ${isAccountOpen ? 'open' : ''}`}
                onClick={() => setIsAccountOpen(!isAccountOpen)}
              >
                <div className="menu-group-icon">
                  <i className="fa-regular fa-user" style={{ color: '#0055AA' }}></i>
                </div>
                <span>Tài Khoản Của Tôi</span>
              </div>
              
              {isAccountOpen && (
                <div className="menu-sub-items">
                  <NavLink to="/user/profile" className={({ isActive }) => isActive ? 'active' : ''}>Hồ Sơ</NavLink>
                  <NavLink to="/user/payment" className={({ isActive }) => isActive ? 'active' : ''}>Ngân Hàng</NavLink>
                  <NavLink to="/user/address" className={({ isActive }) => isActive ? 'active' : ''}>Địa Chỉ</NavLink>
                  <NavLink to="/user/password" className={({ isActive }) => isActive ? 'active' : ''}>Đổi Mật Khẩu</NavLink>
                  <NavLink to="/user/notifications-settings" className={({ isActive }) => isActive ? 'active' : ''}>Cài Đặt Thông Báo</NavLink>
                  <NavLink to="/user/privacy" className={({ isActive }) => isActive ? 'active' : ''}>Những Thiết Lập Riêng Tư</NavLink>
                </div>
              )}
            </div>

            {/* Other Menu Items */}
            <NavLink to="/user/purchase" className={({ isActive }) => `menu-single-item ${isActive ? 'active' : ''}`}>
              <div className="menu-group-icon"><i className="fa-solid fa-clipboard-list" style={{ color: '#0055AA' }}></i></div>
              <span>Đơn Mua</span>
            </NavLink>

            <NavLink to="/user/notifications" className={({ isActive }) => `menu-single-item ${isActive ? 'active' : ''}`}>
              <div className="menu-group-icon"><i className="fa-regular fa-bell" style={{ color: '#ee4d2d' }}></i></div>
              <span>Thông Báo</span>
            </NavLink>

            <NavLink to="/user/voucher" className={({ isActive }) => `menu-single-item ${isActive ? 'active' : ''}`}>
              <div className="menu-group-icon"><i className="fa-solid fa-ticket" style={{ color: '#ee4d2d' }}></i></div>
              <span>Kho Voucher</span>
            </NavLink>

            <NavLink to="/user/coin" className={({ isActive }) => `menu-single-item ${isActive ? 'active' : ''}`}>
              <div className="menu-group-icon"><i className="fa-solid fa-coins" style={{ color: '#fbb03b' }}></i></div>
              <span>Shopee Xu</span>
            </NavLink>
            
            <button onClick={handleLogout} className="menu-single-item logout-btn">
               <div className="menu-group-icon"><i className="fa-solid fa-arrow-right-from-bracket" style={{ color: '#777' }}></i></div>
               <span>Đăng xuất</span>
            </button>
            
          </div>
        </div>

        {/* Main Content Area */}
        <div className="user-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
