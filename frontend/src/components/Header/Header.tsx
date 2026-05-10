import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../css/Header.css';
import logoImg from '../../assets/Logo.jpeg';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState('vi');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getRoleLabel = () => {
    if (user?.role === 'CONTRACTOR') return 'Nhà Thầu';
    if (user?.role === 'ADMIN') return 'Quản Trị';
    return 'Khách Hàng';
  };

  const getAvatarInitial = () =>
    user?.fullName ? user.fullName.split(' ').pop()?.charAt(0).toUpperCase() ?? 'U' : 'U';

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar-left">
            <a href="tel:07785050" className="topbar-info">
              <i className="fa fa-phone"></i>
              <span>0778 5050</span>
            </a>
            <a href="mailto:hoangthangdragone@gmail.com" className="topbar-info">
              <i className="fa fa-envelope"></i>
              <span>hoangthangdragone@gmail.com</span>
            </a>
          </div>
          <div className="topbar-center">
            🎁 Miễn phí vận chuyển cho đơn hàng từ 5 triệu &nbsp;|&nbsp; Bảo hành 5 năm toàn bộ sản phẩm
          </div>
          <div className="topbar-right">
            <span className="topbar-location">
              <i className="fa fa-location-dot"></i>
              <span>TP. Hồ Chí Minh</span>
            </span>
            <div className="topbar-lang">
              <span className={`lang-btn ${lang === 'vi' ? 'active' : ''}`} onClick={() => setLang('vi')}>VI</span>
              <span className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</span>
            </div>
          </div>
        </div>
      </div>

      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="header-logo" aria-label="Trang Chủ">
            <img src={logoImg} alt="Shop Logo" style={{ height: '70px', objectFit: 'contain', borderRadius: '4px' }} />
          </Link>

          <nav className="header-nav-center" aria-label="Menu chính">
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link active">Trang chủ</Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link">Giới thiệu</Link>
              </li>
              <li className="nav-item">
                <Link to="/products" className="nav-link">
                  Sản phẩm <i className="fa fa-chevron-down chevron"></i>
                </Link>
                <div className="dropdown">
                  <div className="dropdown-header">Danh mục nội thất</div>
                  <div className="dropdown-grid">
                    <Link to="/products?cat=sofa" className="dropdown-item"><i className="fa fa-couch"></i> Sofa & Ghế</Link>
                    <Link to="/products?cat=ban-ghe" className="dropdown-item"><i className="fa fa-chair"></i> Bàn Ghế</Link>
                    <Link to="/products?cat=tu-ke" className="dropdown-item"><i className="fa fa-box-open"></i> Tủ & Kệ</Link>
                    <Link to="/products?cat=giuong" className="dropdown-item"><i className="fa fa-bed"></i> Giường Ngủ</Link>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          <div className="header-nav-right">
            <ul className="nav-menu">
              <li className="nav-item">
                <Link
                  to="/custom-orders"
                  className="nav-link"
                  style={{ color: 'var(--color-accent)', fontWeight: 700 }}
                >
                  <i className="fa fa-pencil-ruler" style={{ marginRight: 4 }}></i>Đặt Theo Yêu Cầu
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className="nav-link">Liên Hệ</Link>
              </li>
            </ul>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <button className="header-action-btn" onClick={() => setSearchOpen(!searchOpen)}>
                <i className="fa fa-magnifying-glass"></i>
              </button>
              <div className={`search-dropdown ${searchOpen ? 'open' : ''}`}>
                <div className="search-input-wrap">
                  <i className="fa fa-magnifying-glass"></i>
                  <input type="text" placeholder="Tìm sofa, bàn ghế, tủ kệ..." />
                </div>
              </div>
            </div>

            {/* Cart */}
            <Link to="/cart" className="header-action-btn">
              <i className="fa fa-bag-shopping"></i>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>

            {/* ---- Auth: User Menu or Login button ---- */}
            {isAuthenticated && user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  id="header-user-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                    borderRadius: 'var(--radius-full)', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(90,124,101,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {/* Avatar circle */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                  }}>
                    {getAvatarInitial()}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.fullName.split(' ').pop()}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {getRoleLabel()}
                    </div>
                  </div>
                  <i className={`fa fa-chevron-down`} style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }}></i>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#fff', borderRadius: 'var(--radius-lg)', width: 220,
                    boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border-light)',
                    zIndex: 1000, overflow: 'hidden', animation: 'fadeIn 0.15s ease',
                  }}>
                    {/* User info */}
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg-alt)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '0.15rem' }}>
                        {user.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                    </div>

                    {/* Menu items */}
                    {[
                      { icon: 'fa-user', label: 'Hồ sơ cá nhân', to: '/profile' },
                      { icon: 'fa-clipboard-list', label: 'Đơn hàng của tôi', to: '/orders' },
                      { icon: 'fa-pencil-ruler', label: 'Yêu cầu đặt hàng', to: '/custom-orders' },
                      { icon: 'fa-heart', label: 'Danh sách yêu thích', to: '/wishlist' },
                      ...(user.role === 'CONTRACTOR' ? [{ icon: 'fa-store', label: 'Seller Dashboard', to: '/seller/dashboard' }, { icon: 'fa-tags', label: 'Yêu cầu từ KH', to: '/seller/rfq' }] : []),
                      ...(user.role === 'ADMIN' ? [{ icon: 'fa-gauge', label: 'Admin Dashboard', to: '/admin/dashboard' }] : []),
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: '0.65rem 1rem', fontSize: '0.85rem', color: 'var(--color-text)',
                          transition: 'background 0.15s', textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-alt)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <i className={`fa ${item.icon}`} style={{ width: 18, color: 'var(--color-primary)', fontSize: '0.85rem' }}></i>
                        {item.label}
                      </Link>
                    ))}

                    {/* Logout */}
                    <div style={{ borderTop: '1px solid var(--color-border-light)' }}>
                      <button
                        id="header-logout-btn"
                        onClick={handleLogout}
                        style={{
                          width: '100%', padding: '0.65rem 1rem',
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          fontSize: '0.85rem', color: 'var(--color-sale)', cursor: 'pointer',
                          background: 'none', border: 'none', textAlign: 'left', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fce4ec')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <i className="fa fa-right-from-bracket" style={{ width: 18 }}></i>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="header-action-btn" style={{ fontSize: '14px', fontWeight: 600, width: 'auto', padding: '0 12px' }}>
                  Đăng Nhập
                </Link>
                <Link to="/register" className="btn btn--primary btn--sm" style={{ borderRadius: 'var(--radius-full)' }}>
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>

          <button className={`hamburger-btn ${mobileNavOpen ? 'open' : ''}`} onClick={() => setMobileNavOpen(true)}>
            <div className="hamburger-lines">
              <span></span><span></span><span></span>
            </div>
          </button>
        </div>
      </header>

      <div className={`overlay ${mobileNavOpen ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}></div>
      <nav className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {getAvatarInitial()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.fullName.split(' ').pop()}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}>{getRoleLabel()}</div>
              </div>
            </div>
          ) : (
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>HTTTSHOP</span>
          )}
          <button className="mobile-nav-close" onClick={() => setMobileNavOpen(false)}>
            <i className="fa fa-xmark"></i>
          </button>
        </div>
        <div className="mobile-nav-body">
          <Link to="/" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Trang Chủ</Link>
          <div className="mobile-nav-link" onClick={() => setMobileSubOpen(!mobileSubOpen)}>
            Sản Phẩm <i className="fa fa-chevron-down" style={{ transform: mobileSubOpen ? 'rotate(180deg)' : 'none' }}></i>
          </div>
          <div className={`mobile-nav-sub ${mobileSubOpen ? 'open' : ''}`}>
            <Link to="/products?cat=sofa" className="mobile-nav-sub-link" onClick={() => setMobileNavOpen(false)}><i className="fa fa-couch"></i> Sofa & Ghế</Link>
            <Link to="/products?cat=ban-ghe" className="mobile-nav-sub-link" onClick={() => setMobileNavOpen(false)}><i className="fa fa-chair"></i> Bàn Ghế</Link>
          </div>
          <Link to="/custom-orders" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
            <i className="fa fa-pencil-ruler" style={{ marginRight: 6 }}></i>Đặt Theo Yêu Cầu
          </Link>
          <Link to="/contact" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Liên Hệ</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Đơn hàng của tôi</Link>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Hồ sơ cá nhân</Link>
              {user?.role === 'CONTRACTOR' && (
                <Link to="/seller/rfq" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Yêu cầu từ KH</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileNavOpen(false); }} className="mobile-nav-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--color-sale)', cursor: 'pointer', fontWeight: 600 }}>
                <i className="fa fa-right-from-bracket" style={{ marginRight: 6 }}></i>Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Đăng Nhập</Link>
              <Link to="/register" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Đăng Ký</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
