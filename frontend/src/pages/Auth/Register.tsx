import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/Logo.jpeg';
import './Auth.css';

/* Password strength scorer */
const scorePassword = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'Rất yếu',  color: '#e53935' };
  if (score === 2) return { score, label: 'Yếu',      color: '#fb8c00' };
  if (score === 3) return { score, label: 'Trung bình', color: '#fdd835' };
  if (score === 4) return { score, label: 'Mạnh',     color: '#43a047' };
  return              { score, label: 'Rất mạnh',  color: '#1b5e20' };
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, verifyOtp, resendOtp, registerContractor } = useAuth();

  const [roleTab, setRoleTab] = useState<'CUSTOMER' | 'CONTRACTOR'>('CUSTOMER');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    shopName: '',
    shopDescription: '',
    shopAddress: ''
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({});

  // Các State hỗ trợ màn hình OTP
  const [step, setStep] = useState<'FORM' | 'OTP' | 'CONTRACTOR_SUCCESS'>('FORM');
  const [otpCode, setOtpCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Nhận dạng Tab ban đầu từ URL query parameter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'contractor') {
      setRoleTab('CONTRACTOR');
    } else {
      setRoleTab('CUSTOMER');
    }
  }, [searchParams]);

  // Bộ đếm thời gian gửi lại OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const update = (field: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setFieldErrors(fe => ({ ...fe, [field]: undefined }));
    setError('');
    setSuccessMsg('');
  };

  const pwdStrength = scorePassword(form.password);

  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};
    if (!form.fullName.trim())              errs.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim())                 errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.password)                     errs.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6)     errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.password !== form.confirm)    errs.confirm = 'Mật khẩu xác nhận không khớp';

    if (roleTab === 'CONTRACTOR') {
      if (!form.shopName.trim())            errs.shopName = 'Vui lòng nhập tên nhà thầu / thương hiệu';
      if (!form.shopAddress.trim())         errs.shopAddress = 'Vui lòng nhập địa chỉ văn phòng / xưởng';
      if (!form.phone.trim())               errs.phone = 'Vui lòng nhập số điện thoại';
    }

    if (!agree) { 
      setError(roleTab === 'CONTRACTOR' ? 'Vui lòng đồng ý với điều khoản hợp tác đối tác' : 'Vui lòng đồng ý với điều khoản sử dụng'); 
      return false; 
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (roleTab === 'CUSTOMER') {
        const res = await register(form.fullName.trim(), form.email.trim(), form.password, form.phone.trim() || undefined);
        if (res && res.otpRequired) {
          setRegisteredEmail(form.email.trim());
          setStep('OTP');
          setOtpCode('');
          setCountdown(60);
        } else {
          navigate('/', { replace: true });
        }
      } else {
        await registerContractor(
          form.fullName.trim(),
          form.email.trim(),
          form.password,
          form.phone.trim(),
          form.shopName.trim(),
          form.shopDescription.trim(),
          form.shopAddress.trim()
        );
        setStep('CONTRACTOR_SUCCESS');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP');
      return;
    }
    if (otpCode.trim().length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await verifyOtp(registeredEmail, otpCode.trim());
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xác thực OTP thất bại, vui lòng thử lại');
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
      await resendOtp(registeredEmail);
      setCountdown(60);
      setSuccessMsg('Một mã OTP mới đã được gửi tới email của bạn!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gửi lại OTP thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'OTP') {
    return (
      <div className="auth-page">
        {/* ---- Left Panel ---- */}
        <div className="auth-panel">
          <img src={logoImg} alt="Logo" className="auth-panel__logo" />
          <h2 className="auth-panel__title">Xác thực tài khoản</h2>
          <p className="auth-panel__subtitle">
            Chúng tôi đã gửi mã OTP xác thực gồm 6 chữ số đến địa chỉ email đăng ký của bạn.
          </p>
        </div>

        {/* ---- OTP Form ---- */}
        <div className="auth-form-wrap">
          <div className="auth-card fade-in visible">
            <div className="auth-card__head">
              <h1 className="auth-card__title">Nhập Mã OTP</h1>
              <p className="auth-card__subtitle">
                Mã OTP đã được gửi đến email: <strong style={{ color: 'var(--color-primary)' }}>{registeredEmail}</strong>
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

            <form onSubmit={handleOtpSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="otp-input">Mã xác thực OTP (6 chữ số)</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-key auth-input-icon"></i>
                  <input
                    id="otp-input"
                    type="text"
                    className="auth-input"
                    placeholder="Nhập 6 số OTP"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    autoFocus
                    autoComplete="one-time-code"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  * Lưu ý: Nếu không nhận được email, hãy kiểm tra hòm thư rác (Spam) hoặc xem mã OTP được in trực tiếp trong log console của backend.
                </small>
              </div>

              <button id="otp-submit" type="submit" className="auth-btn" disabled={loading}>
                {loading
                  ? <><div className="auth-spinner"></div> Đang xác thực...</>
                  : <><i className="fa fa-check-to-slot"></i> Xác Thực & Kích Hoạt</>
                }
              </button>
            </form>

            <div className="auth-footer-text" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
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
              
              <button
                type="button"
                onClick={() => {
                  setStep('FORM');
                  setError('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Quay lại màn hình đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'CONTRACTOR_SUCCESS') {
    return (
      <div className="auth-page">
        <div className="auth-panel">
          <img src={logoImg} alt="Logo" className="auth-panel__logo" />
          <h2 className="auth-panel__title">Hồ sơ đã được gửi</h2>
          <p className="auth-panel__subtitle">
            Cảm ơn bạn đã lựa chọn hợp tác cùng TTTH Furniture. Chúng tôi đang xử lý hồ sơ của bạn.
          </p>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-card fade-in visible" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4.5rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
              <i className="fa-regular fa-circle-check"></i>
            </div>
            <h1 className="auth-card__title" style={{ marginBottom: '1rem' }}>Đăng Ký Thành Công!</h1>
            <div className="auth-success-banner" style={{ textAlign: 'left', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              <i className="fa fa-info-circle" style={{ flexShrink: 0, marginTop: '2px' }}></i>
              <span>
                Hồ sơ đối tác nhà thầu của bạn đã được lưu nhận. Hiện tại tài khoản đang ở trạng thái <strong>Chờ xét duyệt</strong>. Ban quản trị sẽ đánh giá hồ sơ và liên hệ kích hoạt tài khoản cho bạn sớm nhất có thể!
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
              Chúng tôi cũng đã gửi một email xác nhận tiếp nhận hồ sơ đăng ký đến địa chỉ: <br />
              <strong>{form.email}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => navigate('/')} className="auth-btn">
                <i className="fa fa-home"></i> Quay Về Trang Chủ
              </button>
              <button onClick={() => { setStep('FORM'); setRoleTab('CUSTOMER'); }} className="auth-btn" style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text)', boxShadow: 'none' }}>
                Đăng ký tài khoản khách hàng
              </button>
              <Link to="/login" style={{ textDecoration: 'underline', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Đi đến trang Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* ---- Left Panel ---- */}
      <div className="auth-panel">
        <img src={logoImg} alt="Logo" className="auth-panel__logo" />
        <h2 className="auth-panel__title">
          {roleTab === 'CONTRACTOR' ? 'Đăng Ký Nhà Thầu Đối Tác' : 'Tham gia TTTH'}
        </h2>
        <p className="auth-panel__subtitle">
          {roleTab === 'CONTRACTOR' 
            ? 'Trở thành đối tác cung cấp đồ nội thất gỗ chất lượng cao, tiếp cận hàng ngàn dự án đo đạc thiết kế trên toàn quốc.'
            : 'Tạo tài khoản miễn phí để trải nghiệm nền t hàng đặt hàng nội thất theo yêu cầu hàng đầu Việt Nam.'
          }
        </p>
        <div className="auth-panel__features">
          {roleTab === 'CONTRACTOR' ? (
            <>
              <div className="auth-panel__feature">
                <div className="auth-panel__feature-icon"><i className="fa fa-file-invoice-dollar"></i></div>
                <span>Nhận yêu cầu báo giá RFQ trực tiếp</span>
              </div>
              <div className="auth-panel__feature">
                <div className="auth-panel__feature-icon"><i className="fa fa-briefcase"></i></div>
                <span>Quản lý đơn hàng sản xuất chuyên nghiệp</span>
              </div>
              <div className="auth-panel__feature">
                <div className="auth-panel__feature-icon"><i className="fa fa-chart-line"></i></div>
                <span>Tăng trưởng doanh thu đột phá</span>
              </div>
            </>
          ) : (
            <>
              <div className="auth-panel__feature">
                <div className="auth-panel__feature-icon"><i className="fa fa-store"></i></div>
                <span>Hàng nghìn nhà thầu uy tín</span>
              </div>
              <div className="auth-panel__feature">
                <div className="auth-panel__feature-icon"><i className="fa fa-star"></i></div>
                <span>Đánh giá & bình luận minh bạch</span>
              </div>
              <div className="auth-panel__feature">
                <div className="auth-panel__feature-icon"><i className="fa fa-truck-fast"></i></div>
                <span>Giao hàng & lắp đặt tận nơi</span>
              </div>
              <div className="auth-panel__feature">
                <div className="auth-panel__feature-icon"><i className="fa fa-rotate-left"></i></div>
                <span>Đổi trả trong 30 ngày</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- Right Form ---- */}
      <div className="auth-form-wrap">
        <div className="auth-card fade-in visible" style={{ maxWidth: roleTab === 'CONTRACTOR' ? '560px' : '420px' }}>
          <div className="auth-card__head">
            <h1 className="auth-card__title">Đăng Ký</h1>
            <p className="auth-card__subtitle">Tạo tài khoản mới — miễn phí & nhanh chóng</p>
          </div>

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${roleTab === 'CUSTOMER' ? 'active' : ''}`}
              onClick={() => { setRoleTab('CUSTOMER'); setError(''); }}
            >
              Khách Hàng
            </button>
            <button
              type="button"
              className={`auth-tab ${roleTab === 'CONTRACTOR' ? 'active' : ''}`}
              onClick={() => { setRoleTab('CONTRACTOR'); setError(''); }}
            >
              Nhà Thầu Đối Tác
            </button>
          </div>

          {/* Social register */}
          {roleTab === 'CUSTOMER' && (
            <>
              <div className="auth-socials">
                <button className="auth-social-btn auth-social-btn--google" type="button">
                  <i className="fab fa-google"></i> Google
                </button>
                <button className="auth-social-btn auth-social-btn--facebook" type="button">
                  <i className="fab fa-facebook-f"></i> Facebook
                </button>
              </div>
              <div className="auth-divider">Hoặc đăng ký bằng email</div>
            </>
          )}

          {error && (
            <div className="auth-error-banner">
              <i className="fa fa-circle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {roleTab === 'CONTRACTOR' && (
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                1. Thông tin người đại diện
              </h3>
            )}

            {/* Full Name */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-name">Họ và tên <span style={{ color: 'var(--color-sale)' }}>*</span></label>
              <div className="auth-input-wrap">
                <i className="fa fa-user auth-input-icon"></i>
                <input
                  id="reg-name"
                  type="text"
                  className={`auth-input ${fieldErrors.fullName ? 'error' : ''}`}
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  autoFocus
                />
              </div>
              {fieldErrors.fullName && <div className="auth-field-error"><i className="fa fa-circle-xmark"></i>{fieldErrors.fullName}</div>}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">Email <span style={{ color: 'var(--color-sale)' }}>*</span></label>
              <div className="auth-input-wrap">
                <i className="fa fa-envelope auth-input-icon"></i>
                <input
                  id="reg-email"
                  type="email"
                  className={`auth-input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <div className="auth-field-error"><i className="fa fa-circle-xmark"></i>{fieldErrors.email}</div>}
            </div>

            {/* Phone */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-phone">Số điện thoại {roleTab === 'CONTRACTOR' && <span style={{ color: 'var(--color-sale)' }}>*</span>}</label>
              <div className="auth-input-wrap">
                <i className="fa fa-phone auth-input-icon"></i>
                <input
                  id="reg-phone"
                  type="tel"
                  className={`auth-input ${fieldErrors.phone ? 'error' : ''}`}
                  placeholder="0901 234 567"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                />
              </div>
              {fieldErrors.phone && <div className="auth-field-error"><i className="fa fa-circle-xmark"></i>{fieldErrors.phone}</div>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">Mật khẩu <span style={{ color: 'var(--color-sale)' }}>*</span></label>
              <div className="auth-input-wrap">
                <i className="fa fa-lock auth-input-icon"></i>
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  className={`auth-input ${fieldErrors.password ? 'error' : ''}`}
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-input-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  <i className={`fa ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {fieldErrors.password && <div className="auth-field-error"><i className="fa fa-circle-xmark"></i>{fieldErrors.password}</div>}
              {form.password && (
                <div className="auth-strength">
                  <div className="auth-strength__bar">
                    <div className="auth-strength__fill" style={{
                      width: `${(pwdStrength.score / 5) * 100}%`,
                      background: pwdStrength.color,
                    }} />
                  </div>
                  <span className="auth-strength__label" style={{ color: pwdStrength.color }}>
                    Độ mạnh: {pwdStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-confirm">Xác nhận mật khẩu <span style={{ color: 'var(--color-sale)' }}>*</span></label>
              <div className="auth-input-wrap">
                <i className="fa fa-lock auth-input-icon"></i>
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`auth-input ${fieldErrors.confirm ? 'error' : ''}`}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirm}
                  onChange={e => update('confirm', e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-input-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  <i className={`fa ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {fieldErrors.confirm && <div className="auth-field-error"><i className="fa fa-circle-xmark"></i>{fieldErrors.confirm}</div>}
              {form.confirm && form.password && (
                <div className="auth-field-error" style={{ color: form.password === form.confirm ? '#2e7d32' : 'var(--color-sale)' }}>
                  <i className={`fa ${form.password === form.confirm ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                  {form.password === form.confirm ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
                </div>
              )}
            </div>

            {/* Shop Fields for Contractor */}
            {roleTab === 'CONTRACTOR' && (
              <>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                  2. Thông tin xưởng sản xuất / Cửa hàng
                </h3>

                {/* Shop Name */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="shopName">Tên Nhà Thầu / Thương Hiệu <span style={{ color: 'var(--color-sale)' }}>*</span></label>
                  <div className="auth-input-wrap">
                    <i className="fa fa-store auth-input-icon"></i>
                    <input
                      id="shopName"
                      type="text"
                      className={`auth-input ${fieldErrors.shopName ? 'error' : ''}`}
                      placeholder="Nội Thất Gỗ Xinh Đông Anh"
                      value={form.shopName}
                      onChange={e => update('shopName', e.target.value)}
                    />
                  </div>
                  {fieldErrors.shopName && <div className="auth-field-error"><i className="fa fa-circle-xmark"></i>{fieldErrors.shopName}</div>}
                </div>

                {/* Shop Address */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="shopAddress">Địa chỉ văn phòng / Xưởng sản xuất <span style={{ color: 'var(--color-sale)' }}>*</span></label>
                  <div className="auth-input-wrap">
                    <i className="fa fa-location-dot auth-input-icon"></i>
                    <input
                      id="shopAddress"
                      type="text"
                      className={`auth-input ${fieldErrors.shopAddress ? 'error' : ''}`}
                      placeholder="123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội"
                      value={form.shopAddress}
                      onChange={e => update('shopAddress', e.target.value)}
                    />
                  </div>
                  {fieldErrors.shopAddress && <div className="auth-field-error"><i className="fa fa-circle-xmark"></i>{fieldErrors.shopAddress}</div>}
                </div>

                {/* Shop Description */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="shopDescription">Mô tả giới thiệu năng lực nhà thầu</label>
                  <div className="auth-input-wrap">
                    <textarea
                      id="shopDescription"
                      className="auth-input"
                      placeholder="Giới thiệu kinh nghiệm sản xuất, trang thiết bị xưởng gỗ..."
                      value={form.shopDescription}
                      onChange={e => update('shopDescription', e.target.value)}
                      style={{
                        paddingLeft: '1rem',
                        paddingTop: '0.5rem',
                        minHeight: '80px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Terms */}
            <label className="auth-terms">
              <input type="checkbox" checked={agree} onChange={e => { setAgree(e.target.checked); setError(''); }} />
              <span>
                {roleTab === 'CONTRACTOR' ? (
                  <>
                    Tôi đồng ý với <Link to="/terms" target="_blank">Điều khoản hợp tác đối tác</Link> và cam kết tuân thủ quy chuẩn chất lượng của TTTH Furniture.
                  </>
                ) : (
                  <>
                    Tôi đồng ý với <Link to="/terms" target="_blank">Điều khoản dịch vụ</Link> và <Link to="/privacy" target="_blank">Chính sách bảo mật</Link> của TTTH
                  </>
                )}
              </span>
            </label>

            <button id="register-submit" type="submit" className="auth-btn" disabled={loading}>
              {loading
                ? <><div className="auth-spinner"></div> {roleTab === 'CONTRACTOR' ? 'Đang gửi hồ sơ...' : 'Đang tạo tài khoản...'}</>
                : <><i className={roleTab === 'CONTRACTOR' ? 'fa fa-file-signature' : 'fa fa-user-plus'}></i> {roleTab === 'CONTRACTOR' ? 'Gửi Hồ Sơ Đăng Ký' : 'Tạo Tài Khoản'}</>
              }
            </button>
          </form>

          <div className="auth-footer-text">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
          <div className="auth-footer-text" style={{ marginTop: '0.75rem' }}>
            Bạn là nhà thầu đối tác? <Link to="/register?role=contractor">Đăng ký tại đây</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
