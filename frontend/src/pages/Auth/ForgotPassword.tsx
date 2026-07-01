import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/Logo.jpeg';
import './Auth.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { sendForgotPasswordOtp, resetPassword } = useAuth();

  const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Timer for Resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Định dạng email không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendForgotPasswordOtp(email.trim());
      setStep('RESET');
      setCountdown(60);
      setSuccessMsg('Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gửi yêu cầu thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP');
      return;
    }
    if (otpCode.trim().length !== 6) {
      setError('Mã OTP phải gồm 6 ký tự số');
      return;
    }
    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới tối thiểu phải có 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await resetPassword(email.trim(), otpCode.trim(), newPassword);
      setSuccessMsg('Đặt lại mật khẩu thành công! Tự động chuyển hướng về trang Đăng nhập sau 3 giây...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendForgotPasswordOtp(email.trim());
      setCountdown(60);
      setSuccessMsg('Mã OTP mới đã được gửi tới email của bạn!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gửi lại OTP thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ---- Left Panel ---- */}
      <div className="auth-panel">
        <img src={logoImg} alt="Logo" className="auth-panel__logo" />
        <h2 className="auth-panel__title">Khôi phục mật khẩu</h2>
        <p className="auth-panel__subtitle">
          Nhập địa chỉ email đã đăng ký để lấy lại quyền truy cập vào tài khoản TTTH Furniture.
        </p>
      </div>

      {/* ---- Right Form ---- */}
      <div className="auth-form-wrap">
        <div className="auth-card fade-in visible">
          <div className="auth-card__head">
            <h1 className="auth-card__title">Quên Mật Khẩu</h1>
            <p className="auth-card__subtitle">
              {step === 'EMAIL' 
                ? 'Nhập email để nhận mã xác thực OTP khôi phục' 
                : `Vui lòng nhập OTP và mật khẩu mới cho email: ${email}`
              }
            </p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <i className="fa fa-circle-exclamation"></i> {error}
            </div>
          )}

          {successMsg && (
            <div className="auth-success-banner">
              <i className="fa fa-circle-check"></i> {successMsg}
            </div>
          )}

          {step === 'EMAIL' ? (
            <form onSubmit={handleEmailSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="forgot-email">Địa chỉ Email</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-envelope auth-input-icon"></i>
                  <input
                    id="forgot-email"
                    type="email"
                    className="auth-input"
                    placeholder="email@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button id="forgot-submit" type="submit" className="auth-btn" disabled={loading}>
                {loading
                  ? <><div className="auth-spinner"></div> Đang gửi yêu cầu...</>
                  : <><i className="fa fa-paper-plane"></i> Gửi Mã OTP</>
                }
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} noValidate>
              {/* OTP Input */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reset-otp">Mã xác thực OTP (6 chữ số)</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-key auth-input-icon"></i>
                  <input
                    id="reset-otp"
                    type="text"
                    className="auth-input"
                    placeholder="Nhập mã OTP"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    autoFocus
                    autoComplete="one-time-code"
                  />
                </div>
                <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  * Lưu ý: Hãy kiểm tra hòm thư Spam hoặc xem OTP được in trực tiếp trong log console của backend nếu không nhận được email.
                </small>
              </div>

              {/* New Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reset-password">Mật khẩu mới</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-lock auth-input-icon"></i>
                  <input
                    id="reset-password"
                    type={showPwd ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                    <i className={`fa ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reset-confirm">Xác nhận mật khẩu mới</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-lock auth-input-icon"></i>
                  <input
                    id="reset-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                    <i className={`fa ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button id="reset-submit" type="submit" className="auth-btn" disabled={loading}>
                {loading
                  ? <><div className="auth-spinner"></div> Đang lưu mật khẩu...</>
                  : <><i className="fa fa-rotate"></i> Đặt Lại Mật Khẩu</>
                }
              </button>
            </form>
          )}

          {/* Footer controls */}
          <div className="auth-footer-text" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            {step === 'RESET' && (
              <div>
                {countdown > 0 ? (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    Gửi lại mã sau: <strong>{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            )}
            
            <Link to="/login" style={{ textDecoration: 'underline' }}>
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
