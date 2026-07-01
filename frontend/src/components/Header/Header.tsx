import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorite } from '../../context/FavoriteContext';
import { productService } from '../../services/productService';
import type { Product } from '../../types';
import '../../css/Header.css';
import logoImg from '../../assets/Logo.jpeg';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { favoriteProductIds } = useFavorite();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState('vi');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/products?keyword=${encodeURIComponent(trimmed)}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const results = await productService.getSuggestions(query.trim(), 6);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, fetchSuggestions]);

  const handleSuggestionClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    // Ép kiểu (as string) để tránh lỗi TS2367 khi so sánh với 'CONTRACTOR'
    const role = user?.role as string;
    if (role === 'CONTRACTOR') return 'Nhà Thầu';
    if (role === 'ADMIN') return 'Quản Trị';
    return 'Khách Hàng';
  };

  const getAvatarInitial = () => {
    if (!user?.fullName) return 'U';
    const nameParts = user.fullName.trim().split(' ');
    return nameParts.length > 0 ? nameParts.pop()?.charAt(0).toUpperCase() : 'U';
  };

  const getLastName = () => {
    if (!user?.fullName) return 'Thành viên';
    const parts = user.fullName.trim().split(' ');
    return parts.pop() || 'Thành viên';
  };

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

              <div style={{ position: 'relative' }}>
                <button className="header-action-btn" onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 100); }}>
                  <i className="fa fa-magnifying-glass"></i>
                </button>
                <div className={`search-dropdown ${searchOpen ? 'open' : ''}`}>
                  <form onSubmit={handleSearch} className="search-input-wrap">
                    <i className="fa fa-magnifying-glass" onClick={handleSearch} style={{ cursor: 'pointer' }}></i>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Tìm sofa, bàn ghế, tủ kệ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <i className="fa fa-xmark" onClick={() => { setSearchQuery(''); setSuggestions([]); searchInputRef.current?.focus(); }} style={{ cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}></i>
                    )}
                  </form>

                  {/* Suggestions dropdown */}
                  {searchQuery.trim().length > 0 && (
                    <div className="search-suggestions">
                      {suggestionsLoading ? (
                        <div className="search-suggestion-loading">
                          <i className="fa fa-spinner fa-spin"></i> Đang tìm...
                        </div>
                      ) : suggestions.length > 0 ? (
                        <>
                          {suggestions.map(product => (
                            <div
                              key={product.id}
                              className="search-suggestion-item"
                              onClick={() => handleSuggestionClick(product.slug)}
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="search-suggestion-img"
                              />
                              <div className="search-suggestion-info">
                                <div className="search-suggestion-name">{product.name}</div>
                                <div className="search-suggestion-category">{product.categoryName}</div>
                              </div>
                              <div className="search-suggestion-price">
                                {formatPrice(product.priceCurrent)}
                              </div>
                            </div>
                          ))}
                          <div
                            className="search-suggestion-viewall"
                            onClick={handleSearch}
                          >
                            Xem tất cả kết quả cho "{searchQuery}" <i className="fa fa-arrow-right"></i>
                          </div>
                        </>
                      ) : (
                        <div className="search-suggestion-empty">
                          <i className="fa fa-face-meh"></i> Không tìm thấy sản phẩm nào
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Link to="/wishlist" className="header-action-btn" aria-label="Yêu thích">
                <i className="fa-regular fa-heart"></i>
                {favoriteProductIds.length > 0 && <span className="cart-badge">{favoriteProductIds.length}</span>}
              </Link>

              <Link to="/cart" className="header-action-btn">
                <i className="fa fa-bag-shopping"></i>
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>

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
                    >
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
                          {getLastName()}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                          {getRoleLabel()}
                        </div>
                      </div>
                      <i className={`fa fa-chevron-down`} style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }}></i>
                    </button>

                    {userMenuOpen && (
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                          background: '#fff', borderRadius: 'var(--radius-lg)', width: 220,
                          boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border-light)',
                          zIndex: 1000, overflow: 'hidden',
                        }}>
                          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg-alt)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '0.15rem' }}>
                              {user.fullName || 'Thành viên'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                          </div>

                          {/* Admin: nút nổi bật vào Dashboard */}
                          {(user.role as string) === 'ADMIN' && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.65rem',
                                padding: '0.75rem 1rem', fontSize: '0.85rem', textDecoration: 'none',
                                background: 'linear-gradient(135deg, #1e2a3a, #2563eb)',
                                color: '#fff', fontWeight: 700, margin: '0.5rem 0.75rem',
                                borderRadius: '8px', letterSpacing: '0.3px'
                              }}
                            >
                              <i className="fa fa-shield-halved" style={{ width: 18 }}></i>
                              Bảng Quản Trị Admin
                              <i className="fa fa-arrow-right" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}></i>
                            </Link>
                          )}

                          {[
                            { icon: 'fa-user', label: 'Tài Khoản Của Tôi', to: '/customer/dashboard', roles: ['CUSTOMER'] },
                            { icon: 'fa-store', label: 'Kênh Nhà Thầu', to: '/contractor/dashboard', roles: ['CONTRACTOR'] },
                            { icon: 'fa-wallet', label: 'Ví Của Tôi', to: '/customer/wallet', roles: ['CUSTOMER'] },
                            { icon: 'fa-wallet', label: 'Ví Của Tôi', to: '/contractor/wallet', roles: ['CONTRACTOR'] },
                            { icon: 'fa-heart', label: 'Danh sách yêu thích', to: '/wishlist', roles: ['CUSTOMER', 'CONTRACTOR'] }
                          ]
                          .filter(item => item.roles.includes(user.role as string))
                          .map(item => (
                            <Link
                              key={item.to + item.label}
                              to={item.to}
                              onClick={() => setUserMenuOpen(false)}
                              className="dropdown-link-item"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1rem', fontSize: '0.85rem', color: 'var(--color-text)', textDecoration: 'none' }}
                            >
                              <i className={`fa ${item.icon}`} style={{ width: 18, color: 'var(--color-primary)' }}></i>
                              {item.label}
                            </Link>
                          ))}

                          <div style={{ borderTop: '1px solid var(--color-border-light)' }}>
                            <button onClick={handleLogout} style={{ width: '100%', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--color-sale)', cursor: 'pointer', background: 'none', border: 'none' }}>
                              <i className="fa fa-right-from-bracket"></i> Đăng xuất
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
              ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/login" className="header-action-btn" style={{ fontSize: '14px', fontWeight: 600, width: 'auto', padding: '0 12px' }}>Đăng Nhập</Link>
                    <Link to="/register" className="btn btn--primary btn--sm" style={{ borderRadius: 'var(--radius-full)' }}>Đăng Ký</Link>
                  </div>
              )}
            </div>
          </div>
        </header>

        <div className={`overlay ${mobileNavOpen ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}></div>
        <nav className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            {isAuthenticated && user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {getAvatarInitial()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{getLastName()}</div>
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

            {/* Sử dụng mobileSubOpen để fix lỗi TS6133 */}
            <div className="mobile-nav-link" onClick={() => setMobileSubOpen(!mobileSubOpen)}>
              Sản Phẩm <i className={`fa fa-chevron-down ${mobileSubOpen ? 'rotate' : ''}`} style={{ transition: '0.3s' }}></i>
            </div>
            {mobileSubOpen && (
                <div className="mobile-nav-sub" style={{ paddingLeft: '1rem', background: 'rgba(0,0,0,0.02)' }}>
                  <Link to="/products?cat=sofa" className="mobile-nav-sub-link" onClick={() => setMobileNavOpen(false)}>Sofa & Ghế</Link>
                  <Link to="/products?cat=ban-ghe" className="mobile-nav-sub-link" onClick={() => setMobileNavOpen(false)}>Bàn Ghế</Link>
                  <Link to="/products?cat=tu-ke" className="mobile-nav-sub-link" onClick={() => setMobileNavOpen(false)}>Tủ & Kệ</Link>
                  <Link to="/products?cat=giuong" className="mobile-nav-sub-link" onClick={() => setMobileNavOpen(false)}>Giường Ngủ</Link>
                </div>
            )}

            <Link to="/custom-orders" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Đặt Theo Yêu Cầu</Link>
            <Link to="/contact" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Liên Hệ</Link>

            {isAuthenticated ? (
                <button onClick={() => { handleLogout(); setMobileNavOpen(false); }} className="mobile-nav-link" style={{ border: 'none', background: 'none', color: 'var(--color-sale)', width: '100%', textAlign: 'left', fontWeight: 600 }}>
                  Đăng xuất
                </button>
            ) : (
                <Link to="/login" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>Đăng Nhập</Link>
            )}
          </div>
        </nav>
      </>
  );
};

export default Header;