import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface Shop {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  logoUrl: string;
  rating: number;
  ratingCount: number;
}

const ContractorProfile: React.FC = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
  });

  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    axios
      .get('http://localhost:8080/api/shops/my-shop', {
        headers: { 'X-Contractor-Id': String(user.id) },
      })
      .then(res => {
        setShop(res.data);
        setFormData({
          name: res.data.name || '',
          description: res.data.description || '',
          address: res.data.address || '',
        });
      })
      .catch(err => console.error('Lỗi lấy thông tin shop:', err));
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      const res = await axios.put(
        'http://localhost:8080/api/shops/my-shop',
        formData,
        { headers: { 'X-Contractor-Id': String(user.id) } }
      );
      setSuccessMsg('Cập nhật hồ sơ cửa hàng thành công!');
      setShop(res.data);
    } catch (err) {
      setErrorMsg('Cập nhật thất bại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contractor-card" style={{ maxWidth: 900 }}>

      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.6rem',
          fontWeight: 600,
          color: 'var(--cp-text)',
          margin: '0 0 6px',
        }}>
          Hồ Sơ Cửa Hàng
        </h1>
        <p style={{ color: 'var(--cp-text-muted)', fontSize: '0.875rem', margin: 0 }}>
          Quản lý thông tin hiển thị của cửa hàng (Nhà thầu) trên hệ thống
        </p>
      </div>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ flex: 2, minWidth: 280 }}>

          {/* Tên cửa hàng */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle} htmlFor="name">Tên cửa hàng</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Nhập tên cửa hàng..."
            />
          </div>

          {/* Địa chỉ */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle} htmlFor="address">Địa chỉ cửa hàng / Xưởng</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Nhập địa chỉ..."
            />
          </div>

          {/* Mô tả */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle} htmlFor="description">Mô tả ngắn</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Giới thiệu về xưởng, kinh nghiệm, thế mạnh..."
            />
          </div>

          {/* Thống kê */}
          {shop && (
            <div style={{ marginBottom: 20 }}>
              <div style={labelStyle}>Thống kê</div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--cp-gold-light)',
                border: '1px solid #f0d898',
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: '0.85rem',
                color: '#8a6010',
                fontWeight: 600,
              }}>
                <i className="fa-solid fa-star" style={{ color: '#c9a45a' }} />
                {shop.rating} ({shop.ratingCount} đánh giá)
              </div>
            </div>
          )}

          {/* Messages */}
          {successMsg && (
            <div style={{ color: '#3d5c49', background: 'var(--cp-green-light)', border: '1px solid #b8d4c0', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16 }}>
              ✅ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{ color: 'var(--cp-red)', background: 'var(--cp-red-light)', border: '1px solid #f5c0ba', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16 }}>
              ❌ {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: isLoading ? 'var(--cp-text-hint)' : 'var(--cp-green)',
              color: '#fff',
              border: 'none',
              padding: '10px 28px',
              borderRadius: 24,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              letterSpacing: '0.3px',
            }}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
          </button>
        </form>

        {/* ── Logo upload ── */}
        <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{
            width: 140,
            height: 140,
            borderRadius: 12,
            border: '2px dashed var(--cp-cream-dark)',
            background: 'var(--cp-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {shop?.logoUrl ? (
              <img src={shop.logoUrl} alt="Logo Cửa Hàng" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
            ) : (
              <i className="fa-solid fa-store" style={{ fontSize: '2.5rem', color: 'var(--cp-text-hint)' }} />
            )}
          </div>

          <button style={{
            background: 'var(--cp-green-light)',
            color: 'var(--cp-green)',
            border: '1px solid #b8d4c0',
            padding: '8px 20px',
            borderRadius: 20,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}>
            Cập Nhật Logo
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--cp-text-hint)', lineHeight: 1.8 }}>
            <div>Dung lượng file tối đa 2 MB</div>
            <div>Định dạng: .JPEG, .PNG, .WEBP</div>
            <div>Tỉ lệ 1:1 (Vuông)</div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ── Shared inline styles ── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--cp-text-muted)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--cp-cream-dark)',
  borderRadius: 8,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.875rem',
  color: 'var(--cp-text)',
  background: 'var(--cp-bg)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default ContractorProfile;