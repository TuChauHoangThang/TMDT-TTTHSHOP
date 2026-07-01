import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/Logo.jpeg';
import './Auth.css';

const RegisterContractor: React.FC = () => {
  const navigate = useNavigate();
  const { registerContractor } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    shopName: '',
    shopDescription: '',
    shopAddress: '',
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({});

  const update = (field: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setFieldErrors(fe => ({ ...fe, [field]: undefined }));
    setError('');
  };

  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên đại diện';
    if (!form.email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Email không hợp lệ';
    }
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại liên hệ';
    if (!form.password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 6) {
      errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    if (form.password !== form.confirm) {
      errs.confirm = 'Mật khẩu xác nhận không khớp';
    }
    if (!form.shopName.trim()) errs.shopName = 'Vui lòng nhập tên nhà thầu / cửa hàng';
    if (!form.shopAddress.trim()) errs.shopAddress = 'Vui lòng nhập địa chỉ xưởng / văn phòng';

    if (!agree) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ đối tác');
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
    try {
      await registerContractor(
        form.fullName.trim(),
        form.email.trim(),
        form.password,
        form.phone.trim(),
        form.shopName.trim(),
        form.shopDescription.trim(),
        form.shopAddress.trim()
      );
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại, vui lòng kiểm tra lại');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
        <h2 className="auth-panel__title">Đăng Ký Nhà Thầu Đối Tác</h2>
        <p className="auth-panel__subtitle">
          Trở thành đối tác cung cấp đồ nội thất gỗ chất lượng cao, tiếp cận hàng ngàn dự án đo đạc thiết kế trên toàn quốc.
        </p>
        <div className="auth-panel__features" style={{ marginTop: '1.5rem' }}>
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
        </div>
      </div>

      {/* ---- Right Form ---- */}
      <div className="auth-form-wrap">
        <div className="auth-card fade-in visible" style={{ maxWidth: '560px' }}>
          <div className="auth-card__head">
            <h1 className="auth-card__title">Đăng Ký Đối Tác</h1>
            <p className="auth-card__subtitle">Tạo tài khoản nhà thầu - Đồng hành cùng TTTH Furniture</p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <i className="fa fa-circle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
              1. Thông tin người đại diện
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Full Name */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="name">Họ và tên <span style={{ color: 'var(--color-sale)' }}>*</span></label>
                <div className="auth-input-wrap">
                  <i className="fa fa-user auth-input-icon"></i>
                  <input
                    id="name"
                    type="text"
                    className={`auth-input ${fieldErrors.fullName ? 'error' : ''}`}
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    style={{ paddingLeft: '2.3rem' }}
                  />
                </div>
                {fieldErrors.fullName && <div className="auth-field-error">{fieldErrors.fullName}</div>}
              </div>

              {/* Phone */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="phone">Số điện thoại <span style={{ color: 'var(--color-sale)' }}>*</span></label>
                <div className="auth-input-wrap">
                  <i className="fa fa-phone auth-input-icon"></i>
                  <input
                    id="phone"
                    type="tel"
                    className={`auth-input ${fieldErrors.phone ? 'error' : ''}`}
                    placeholder="0912345678"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    style={{ paddingLeft: '2.3rem' }}
                  />
                </div>
                {fieldErrors.phone && <div className="auth-field-error">{fieldErrors.phone}</div>}
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email đăng nhập <span style={{ color: 'var(--color-sale)' }}>*</span></label>
              <div className="auth-input-wrap">
                <i className="fa fa-envelope auth-input-icon"></i>
                <input
                  id="email"
                  type="email"
                  className={`auth-input ${fieldErrors.email ? 'error' : ''}`}
                  placeholder="contact@nhathau.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  style={{ paddingLeft: '2.3rem' }}
                />
              </div>
              {fieldErrors.email && <div className="auth-field-error">{fieldErrors.email}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="password">Mật khẩu <span style={{ color: 'var(--color-sale)' }}>*</span></label>
                <div className="auth-input-wrap">
                  <i className="fa fa-lock auth-input-icon"></i>
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    className={`auth-input ${fieldErrors.password ? 'error' : ''}`}
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    style={{ paddingLeft: '2.3rem', paddingRight: '2rem' }}
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                    <i className={`fa ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {fieldErrors.password && <div className="auth-field-error">{fieldErrors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="confirm">Xác nhận mật khẩu <span style={{ color: 'var(--color-sale)' }}>*</span></label>
                <div className="auth-input-wrap">
                  <i className="fa fa-lock auth-input-icon"></i>
                  <input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className={`auth-input ${fieldErrors.confirm ? 'error' : ''}`}
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirm}
                    onChange={e => update('confirm', e.target.value)}
                    style={{ paddingLeft: '2.3rem', paddingRight: '2rem' }}
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                    <i className={`fa ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {fieldErrors.confirm && <div className="auth-field-error">{fieldErrors.confirm}</div>}
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
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
                  style={{ paddingLeft: '2.3rem' }}
                />
              </div>
              {fieldErrors.shopName && <div className="auth-field-error">{fieldErrors.shopName}</div>}
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
                  style={{ paddingLeft: '2.3rem' }}
                />
              </div>
              {fieldErrors.shopAddress && <div className="auth-field-error">{fieldErrors.shopAddress}</div>}
            </div>

            {/* Shop Description */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="shopDescription">Mô tả giới thiệu năng lực nhà thầu</label>
              <div className="auth-input-wrap">
                <textarea
                  id="shopDescription"
                  className="auth-input"
                  placeholder="Giới thiệu về kinh nghiệm sản xuất, trang thiết bị máy móc, nguyên vật liệu chuyên dùng (Gỗ Sồi, Gỗ MDF An Cường, Gỗ Tự nhiên...)..."
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

            {/* Agree checkbox */}
            <label className="auth-terms">
              <input type="checkbox" checked={agree} onChange={e => { setAgree(e.target.checked); setError(''); }} />
              <span>
                Tôi đồng ý với <Link to="/terms" target="_blank">Điều khoản hợp tác đối tác</Link> và cam kết tuân thủ quy chuẩn chất lượng của TTTH Furniture.
              </span>
            </label>

            <button id="contractor-submit" type="submit" className="auth-btn" disabled={loading}>
              {loading
                ? <><div className="auth-spinner"></div> Đang gửi hồ sơ...</>
                : <><i className="fa fa-file-signature"></i> Gửi Hồ Sơ Đăng Ký</>
              }
            </button>
          </form>

          <div className="auth-footer-text">
            Đã có tài khoản đối tác? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterContractor;
