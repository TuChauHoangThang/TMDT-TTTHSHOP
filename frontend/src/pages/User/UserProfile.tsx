import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './UserProfile.css';

interface Address {
  id: number;
  label: string;
  fullAddress: string;
  isDefault: boolean;
}

const UserProfile: React.FC = () => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showChangePass, setShowChangePass] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [stats, setStats] = useState({ orders: 0, custom: 0, favorites: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Load user data ── */
  useEffect(() => {
    if (!user?.id) return;
    const headers = { 'X-Customer-Id': String(user.id) };

    axios.get(`http://localhost:8080/api/user/${user.id}`)
      .then(res => {
        const d = res.data;
        setFormData({
          fullName: d.fullName || '',
          email: d.email || '',
          phone: d.phone || '',
          gender: d.gender || '',
          dob: d.dob || '',
        });
      })
      .catch(() => {
        if (user) {
          setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: '',
            dob: '',
          });
        }
      });

    // Stats
    Promise.all([
      axios.get('http://localhost:8080/api/orders', { headers }),
      axios.get('http://localhost:8080/api/custom-orders', { headers }),
      axios.get('http://localhost:8080/api/favorites', { headers }),
    ]).then(([ordRes, cusRes, favRes]) => {
      setStats({
        orders: Array.isArray(ordRes.data) ? ordRes.data.length : 0,
        custom: Array.isArray(cusRes.data) ? cusRes.data.length : 0,
        favorites: Array.isArray(favRes.data) ? favRes.data.length : 0,
      });
    }).catch(() => {});

    // Addresses (mock nếu chưa có API)
    setAddresses([
      { id: 1, label: 'Nhà riêng', fullAddress: '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP. Hồ Chí Minh', isDefault: true },
      { id: 2, label: 'Văn phòng', fullAddress: '456 Lê Văn Sỹ, P.14, Q.3, TP. Hồ Chí Minh', isDefault: false },
    ]);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await axios.put(`http://localhost:8080/api/user/${user.id}`, {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        dob: formData.dob,
      });
      setSuccessMsg(res.data.message || 'Cập nhật thành công!');
      if (setUser) {
        setUser(prev => prev ? { ...prev, fullName: formData.fullName, phone: formData.phone, email: formData.email } : prev);
      }
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');
    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('Mật khẩu xác nhận không khớp.');
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/user/${user?.id}/password`, {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword,
      });
      setPassMsg('Đổi mật khẩu thành công!');
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePass(false);
    } catch (err: any) {
      setPassError(err.response?.data?.error || 'Đổi mật khẩu thất bại.');
    }
  };

  const initials = formData.fullName?.charAt(0)?.toUpperCase() || 'K';

  const formatDate = (dob: string) => {
    if (!dob) return null;
    try { return new Date(dob).toLocaleDateString('vi-VN'); } catch { return dob; }
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '01/01/2024';

  return (
    <div className="up-root">

      {/* ── LEFT COLUMN ── */}
      <aside className="up-left">

        {/* Avatar card */}
        <div className="up-card up-avatar-card">
          <div className="up-avatar-wrap">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="avatar" className="up-avatar-img" />
              : <div className="up-avatar-placeholder">{initials}</div>
            }
            <button
              className="up-avatar-edit-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Đổi ảnh"
            >
              <i className="fa-solid fa-camera" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
          </div>
          <div className="up-avatar-name">{formData.fullName || 'Khách hàng'}</div>
          <div className="up-avatar-email">{formData.email}</div>
          <div className="up-member-badge">
            <i className="fa-solid fa-star" />
            Thành viên vàng
          </div>

          {/* Stats */}
          <div className="up-stats-row">
            <div className="up-stat">
              <div className="up-stat-val">{stats.orders}</div>
              <div className="up-stat-lbl">Đơn hàng</div>
            </div>
            <div className="up-stat-divider" />
            <div className="up-stat">
              <div className="up-stat-val">{stats.custom}</div>
              <div className="up-stat-lbl">Custom</div>
            </div>
            <div className="up-stat-divider" />
            <div className="up-stat">
              <div className="up-stat-val">{stats.favorites}</div>
              <div className="up-stat-lbl">Yêu thích</div>
            </div>
          </div>
        </div>

        {/* Addresses card */}
        <div className="up-card up-addr-card">
          <div className="up-addr-header">
            <span>Địa chỉ giao hàng</span>
            <button className="up-addr-add-btn"><i className="fa-solid fa-plus" /> Thêm mới</button>
          </div>
          {addresses.map(addr => (
            <div key={addr.id} className="up-addr-item">
              <div className="up-addr-icon-wrap">
                <i className={addr.label === 'Nhà riêng' ? 'fa-solid fa-house' : 'fa-solid fa-briefcase'} />
              </div>
              <div className="up-addr-info">
                <div className="up-addr-label">{addr.label}</div>
                <div className="up-addr-full">{addr.fullAddress}</div>
                {addr.isDefault && <span className="up-addr-default">Mặc định</span>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── RIGHT COLUMN ── */}
      <main className="up-right">

        {/* Personal info card */}
        <div className="up-card">
          <div className="up-section-header">
            <span className="up-section-title">Thông tin cá nhân</span>
            {!isEditing && (
              <button className="up-btn-edit" onClick={() => { setIsEditing(true); setSuccessMsg(''); setErrorMsg(''); }}>
                <i className="fa-regular fa-pen-to-square" /> Chỉnh sửa
              </button>
            )}
          </div>

          {successMsg && <div className="up-alert up-alert-success"><i className="fa-solid fa-circle-check" /> {successMsg}</div>}
          {errorMsg   && <div className="up-alert up-alert-error"><i className="fa-solid fa-circle-xmark" /> {errorMsg}</div>}

          {!isEditing ? (
            /* ─ View mode ─ */
            <div className="up-info-grid">
              <div className="up-info-cell">
                <div className="up-info-lbl">HỌ VÀ TÊN</div>
                <div className="up-info-val">{formData.fullName || <span className="up-info-empty">Chưa cập nhật</span>}</div>
              </div>
              <div className="up-info-cell">
                <div className="up-info-lbl">SỐ ĐIỆN THOẠI</div>
                <div className="up-info-val">{formData.phone || <span className="up-info-empty">Chưa cập nhật</span>}</div>
              </div>
              <div className="up-info-cell">
                <div className="up-info-lbl">EMAIL</div>
                <div className="up-info-val">{formData.email || <span className="up-info-empty">Chưa cập nhật</span>}</div>
              </div>
              <div className="up-info-cell">
                <div className="up-info-lbl">NGÀY SINH</div>
                {formData.dob
                  ? <div className="up-info-val">{formatDate(formData.dob)}</div>
                  : <div className="up-info-val up-info-empty">Chưa cập nhật <span className="up-tag-missing"><i className="fa-regular fa-clock" /> Thiếu</span></div>
                }
              </div>
              <div className="up-info-cell">
                <div className="up-info-lbl">GIỚI TÍNH</div>
                <div className="up-info-val">{formData.gender || <span className="up-info-empty">Chưa cập nhật</span>}</div>
              </div>
              <div className="up-info-cell">
                <div className="up-info-lbl">THÀNH VIÊN TỪ</div>
                <div className="up-info-val">{memberSince}</div>
              </div>
            </div>
          ) : (
            /* ─ Edit mode ─ */
            <form onSubmit={handleSubmit} className="up-edit-form">
              <div className="up-form-grid">
                <div className="up-form-group">
                  <label className="up-form-lbl">Họ và tên</label>
                  <input name="fullName" className="up-form-input" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="up-form-group">
                  <label className="up-form-lbl">Số điện thoại</label>
                  <input name="phone" className="up-form-input" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="up-form-group">
                  <label className="up-form-lbl">Email</label>
                  <input name="email" type="email" className="up-form-input" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="up-form-group">
                  <label className="up-form-lbl">Ngày sinh</label>
                  <input name="dob" type="date" className="up-form-input" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="up-form-group">
                  <label className="up-form-lbl">Giới tính</label>
                  <select name="gender" className="up-form-input up-form-select" value={formData.gender} onChange={handleChange}>
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <div className="up-edit-actions">
                <button type="button" className="up-btn-cancel" onClick={() => setIsEditing(false)}>Hủy</button>
                <button type="submit" className="up-btn-save" disabled={isLoading}>
                  {isLoading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Đang lưu...</> : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security card */}
        <div className="up-card">
          <div className="up-section-header">
            <span className="up-section-title">Bảo mật tài khoản</span>
          </div>

          {/* Change password row */}
          <div className="up-security-row">
            <div className="up-security-info">
              <div className="up-security-name">Mật khẩu</div>
              <div className="up-security-desc">Lần đổi cuối: 3 tháng trước</div>
            </div>
            <button className="up-btn-security" onClick={() => setShowChangePass(v => !v)}>
              <i className="fa-solid fa-lock" /> Đổi mật khẩu
            </button>
          </div>

          {showChangePass && (
            <form onSubmit={handleChangePassword} className="up-pass-form">
              {passMsg   && <div className="up-alert up-alert-success"><i className="fa-solid fa-circle-check" /> {passMsg}</div>}
              {passError && <div className="up-alert up-alert-error"><i className="fa-solid fa-circle-xmark" /> {passError}</div>}
              <div className="up-form-grid">
                <div className="up-form-group up-span2">
                  <label className="up-form-lbl">Mật khẩu hiện tại</label>
                  <input type="password" className="up-form-input" value={passData.oldPassword}
                    onChange={e => setPassData(p => ({ ...p, oldPassword: e.target.value }))} required />
                </div>
                <div className="up-form-group">
                  <label className="up-form-lbl">Mật khẩu mới</label>
                  <input type="password" className="up-form-input" value={passData.newPassword}
                    onChange={e => setPassData(p => ({ ...p, newPassword: e.target.value }))} required />
                </div>
                <div className="up-form-group">
                  <label className="up-form-lbl">Xác nhận mật khẩu</label>
                  <input type="password" className="up-form-input" value={passData.confirmPassword}
                    onChange={e => setPassData(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
              </div>
              <div className="up-edit-actions">
                <button type="button" className="up-btn-cancel" onClick={() => setShowChangePass(false)}>Hủy</button>
                <button type="submit" className="up-btn-save">Xác nhận</button>
              </div>
            </form>
          )}

          <div className="up-security-divider" />

          {/* 2FA row */}
          <div className="up-security-row">
            <div className="up-security-info">
              <div className="up-security-name">Xác thực 2 lớp (2FA)</div>
              <div className="up-security-desc">Bảo vệ tài khoản tốt hơn</div>
            </div>
            <label className="up-toggle">
              <input type="checkbox" />
              <span className="up-toggle-slider" />
            </label>
          </div>
        </div>

      </main>
    </div>
  );
};

export default UserProfile;
