import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/Logo.jpeg';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Redirect to where user came from (or home)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Vui lòng nhập email'); return; }
    if (!password)      { setError('Vui lòng nhập mật khẩu'); return; }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ---- Left Decorative Panel ---- */}
      <div className="auth-panel">
        <img src={logoImg} alt="Logo" className="auth-panel__logo" />
        <h2 className="auth-panel__title">Chào mừng trở lại!</h2>
        <p className="auth-panel__subtitle">
          Đăng nhập để đặt hàng nội thất theo yêu cầu, theo dõi đơn hàng và nhận báo giá từ hàng trăm nhà thầu uy tín.
        </p>
        <div className="auth-panel__features">
          <div className="auth-panel__feature">
            <div className="auth-panel__feature-icon"><i className="fa fa-pencil-ruler"></i></div>
            <span>Đặt hàng theo yêu cầu cá nhân hoá</span>
          </div>
          <div className="auth-panel__feature">
            <div className="auth-panel__feature-icon"><i className="fa fa-tags"></i></div>
            <span>Nhận báo giá cạnh tranh từ nhiều nhà thầu</span>
          </div>
          <div className="auth-panel__feature">
            <div className="auth-panel__feature-icon"><i className="fa fa-shield-halved"></i></div>
            <span>Thanh toán an toàn qua VNPay</span>
          </div>
          <div className="auth-panel__feature">
            <div className="auth-panel__feature-icon"><i className="fa fa-headset"></i></div>
            <span>Hỗ trợ tư vấn 24/7</span>
          </div>
        </div>
      </div>

      {/* ---- Right Form Panel ---- */}
      <div className="auth-form-wrap">
        <div className="auth-card fade-in visible">
          <div className="auth-card__head">
            <h1 className="auth-card__title">Đăng Nhập</h1>
            <p className="auth-card__subtitle">Nhập thông tin tài khoản của bạn</p>
          </div>

          {/* Demo hint */}
          <div style={{
            background: 'rgba(90,124,101,0.08)', border: '1px solid rgba(90,124,101,0.2)',
            borderRadius: 'var(--radius-md)', padding: '0.6rem 0.85rem',
            fontSize: '0.78rem', color: 'var(--color-primary)', marginBottom: '1.25rem', lineHeight: 1.6,
          }}>
            <strong>Demo:</strong> customer@test.com / seller@test.com / admin@test.com<br />
            Mật khẩu: <strong>123456</strong>
          </div>

          {/* Error banner */}
          {error && (
            <div className="auth-error-banner">
              <i className="fa fa-circle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">Email</label>
              <div className="auth-input-wrap">
                <i className="fa fa-envelope auth-input-icon"></i>
                <input
                  id="login-email"
                  type="email"
                  className={`auth-input ${error ? 'error' : ''}`}
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">Mật khẩu</label>
              <div className="auth-input-wrap">
                <i className="fa fa-lock auth-input-icon"></i>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className={`auth-input ${error ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                >
                  <i className={`fa ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="auth-row">
              <label className="auth-remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="auth-forgot">Quên mật khẩu?</Link>
            </div>

            {/* Submit */}
            <button id="login-submit" type="submit" className="auth-btn" disabled={loading}>
              {loading
                ? <><div className="auth-spinner"></div> Đang đăng nhập...</>
                : <><i className="fa fa-right-to-bracket"></i> Đăng Nhập</>
              }
            </button>
          </form>

          {/* Social login */}
          <div className="auth-divider">Hoặc đăng nhập với</div>
          <div className="auth-socials">
            <button className="auth-social-btn auth-social-btn--google" type="button">
              <i className="fab fa-google"></i> Google
            </button>
            <button className="auth-social-btn auth-social-btn--facebook" type="button">
              <i className="fab fa-facebook-f"></i> Facebook
            </button>
          </div>

          <div className="auth-footer-text">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
