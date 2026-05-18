import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    dobDay: '1',
    dobMonth: '1',
    dobYear: '1990'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load dữ liệu từ DB khi vào trang
  useEffect(() => {
    if (!user?.id) return;
    axios.get(`http://localhost:8080/api/user/${user.id}`)
      .then(res => {
        const data = res.data;
        setFormData(prev => ({
          ...prev,
          username: data.email?.split('@')[0] || '',
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || ''
        }));
      })
      .catch(() => {
        // Fallback to AuthContext data if API fails
        if (user) {
          setFormData(prev => ({
            ...prev,
            username: user.email?.split('@')[0] || '',
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || ''
          }));
        }
      });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Lưu vào Database
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
        email: formData.email
      });
      setSuccessMsg(res.data.message || 'Cập nhật thành công!');
      // Cập nhật lại AuthContext
      if (setUser) {
        setUser(prev => prev ? { ...prev, fullName: formData.fullName, phone: formData.phone, email: formData.email } : prev);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Masking functions
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return email;
    return `${name.substring(0, 2)}${'*'.repeat(name.length - 2)}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '';
    if (phone.length < 4) return phone;
    return `${'*'.repeat(phone.length - 2)}${phone.substring(phone.length - 2)}`;
  };

  return (
    <div className="profile-container">
      {/* Alert Banner */}
      <div className="profile-alert">
        <div className="alert-content">
          <i className="fa-solid fa-bullhorn"></i>
          <span>Địa chỉ đã được cập nhật theo thông tin hành chính mới. <a href="#">Kiểm tra ngay</a></span>
        </div>
        <button className="alert-close"><i className="fa-solid fa-xmark"></i></button>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <h1 className="profile-title">Hồ Sơ Của Tôi</h1>
        <p className="profile-subtitle">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      {/* Profile Body */}
      <div className="profile-body">
        {/* Left Form */}
        <div className="profile-form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-label">Tên đăng nhập</div>
              <div className="form-value text-value">{formData.username}</div>
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="fullName">Tên</label>
              <div className="form-value">
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName"
                  className="profile-input" 
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="form-value">
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  className="profile-input" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="phone">Số điện thoại</label>
              <div className="form-value">
                <input 
                  type="text" 
                  id="phone"
                  name="phone"
                  className="profile-input" 
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">Giới tính</div>
              <div className="form-value radio-group">
                <label className="radio-label">
                  <input type="radio" name="gender" value="Nam" checked={formData.gender === 'Nam'} onChange={handleChange} />
                  Nam
                </label>
                <label className="radio-label">
                  <input type="radio" name="gender" value="Nữ" checked={formData.gender === 'Nữ'} onChange={handleChange} />
                  Nữ
                </label>
                <label className="radio-label">
                  <input type="radio" name="gender" value="Khác" checked={formData.gender === 'Khác'} onChange={handleChange} />
                  Khác
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">Ngày sinh</div>
              <div className="form-value dob-group">
                <select name="dobDay" className="profile-select" value={formData.dobDay} onChange={handleChange}>
                  {[...Array(31)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
                <select name="dobMonth" className="profile-select" value={formData.dobMonth} onChange={handleChange}>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>Tháng {i+1}</option>
                  ))}
                </select>
                <select name="dobYear" className="profile-select" value={formData.dobYear} onChange={handleChange}>
                  {[...Array(100)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="form-row submit-row">
              {successMsg && <div style={{ color: '#1e8e3e', fontSize: '0.85rem', marginBottom: 8 }}>✅ {successMsg}</div>}
              {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 8 }}>❌ {errorMsg}</div>}
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Avatar Section */}
        <div className="profile-avatar-section">
          <div className="avatar-preview">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" />
            ) : (
              <i className="fa-regular fa-user"></i>
            )}
          </div>
          <button className="btn-upload">Chọn Ảnh</button>
          <div className="upload-requirements">
            <p>Dụng lượng file tối đa 1 MB</p>
            <p>Định dạng: .JPEG, .PNG</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
